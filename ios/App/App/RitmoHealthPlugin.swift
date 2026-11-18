import Foundation
import Capacitor
import HealthKit

/// Local-only bridge: explicit workout read/write, no analytics or background upload.
@objc(RitmoHealthPlugin)
public class RitmoHealthPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "RitmoHealthPlugin"
    public let jsName = "RitmoHealth"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "status", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestAccess", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "readWorkouts", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "saveWorkout", returnType: CAPPluginReturnPromise)
    ]
    private let store = HKHealthStore()
    private var saving = false // Accessed on main queue, prevents double taps during a save.
    private var requested = false // Session only: never infer permission to read from this flag.

    private func statusValue() -> [String: Any] {
        let available = HKHealthStore.isHealthDataAvailable()
        return ["available": available,
                "writeAuthorized": available && store.authorizationStatus(for: HKObjectType.workoutType()) == .sharingAuthorized]
    }
    @objc func status(_ call: CAPPluginCall) { call.resolve(statusValue()) }
    @objc func requestAccess(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else {
            call.reject("Salud no está disponible en este dispositivo."); return
        }
        DispatchQueue.main.async {
            self.store.requestAuthorization(toShare: [HKObjectType.workoutType()], read: [HKObjectType.workoutType()]) { completed, error in
                if let error = error { call.reject("No se pudo solicitar acceso a Salud: " + error.localizedDescription); return }
                guard completed else { call.reject("La solicitud de permisos no se completó."); return }
                self.requested = true
                // A completed permission sheet does not prove read or write authorization.
                call.resolve(self.statusValue())
            }
        }
    }
    @objc func readWorkouts(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { call.reject("Salud no está disponible."); return }
        // Requiring an explicit permission request in this launch avoids silently reading on startup.
        guard requested else { call.reject("Pulsa Vincular / revisar permisos antes de consultar Salud."); return }
        let end = Date()
        let start = Calendar.current.date(byAdding: .day, value: -30, to: end)!
        let predicate = HKQuery.predicateForSamples(withStart: start, end: end, options: .strictStartDate)
        let query = HKSampleQuery(sampleType: HKObjectType.workoutType(), predicate: predicate, limit: 100,
                                  sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: false)]) { _, samples, error in
            if let error = error { call.reject("No se pudieron consultar los entrenamientos: " + error.localizedDescription); return }
            let workouts = (samples as? [HKWorkout] ?? []).map { workout -> [String: Any] in
                let product = workout.sourceRevision.productType ?? ""
                let isWatch = product.lowercased().hasPrefix("watch") || (workout.device?.model?.lowercased().contains("watch") ?? false)
                let source = workout.sourceRevision.source
                return ["id": workout.uuid.uuidString,
                        "name": self.activityName(workout.workoutActivityType),
                        "start": workout.startDate.timeIntervalSince1970 * 1000,
                        "duration": workout.duration,
                        "source": source.name,
                        "isWatch": isWatch,
                        "isRitmo": source.bundleIdentifier == Bundle.main.bundleIdentifier]
            }
            call.resolve(["workouts": workouts])
        }
        store.execute(query)
    }
    @objc func saveWorkout(_ call: CAPPluginCall) {
        guard HKHealthStore.isHealthDataAvailable() else { call.reject("Salud no está disponible."); return }
        guard store.authorizationStatus(for: HKObjectType.workoutType()) == .sharingAuthorized else {
            call.reject("Autoriza guardar entrenamientos desde Vincular / revisar permisos o en Salud → tu perfil → Apps → Ritmo."); return
        }
        guard let identifier = call.getString("sessionId"), !identifier.isEmpty, identifier.count <= 100,
              let startMS = call.getDouble("start"), let endMS = call.getDouble("end"),
              startMS.isFinite, endMS.isFinite, startMS >= 0,
              endMS > startMS, endMS - startMS <= 360 * 60 * 1000,
              endMS - startMS >= 60 * 1000, endMS <= Date().timeIntervalSince1970 * 1000 else {
            call.reject("Revisa la fecha, la hora y la duración del entrenamiento (1–360 min)."); return
        }
        DispatchQueue.main.async {
            guard !self.saving else { call.reject("Ya hay un entrenamiento guardándose en Salud."); return }
            self.saving = true
            let config = HKWorkoutConfiguration()
            config.activityType = .traditionalStrengthTraining
            config.locationType = .unknown
            let builder = HKWorkoutBuilder(healthStore: self.store, configuration: config, device: nil)
            let start = Date(timeIntervalSince1970: startMS / 1000)
            let end = Date(timeIntervalSince1970: endMS / 1000)
            Task {
                do {
                    try await self.complete { builder.beginCollection(withStart: start, completion: $0) }
                    // Stable sync metadata makes retries of this session idempotent in HealthKit.
                    try await self.complete { builder.addMetadata([
                        HKMetadataKeySyncIdentifier: "ritmo.session." + identifier,
                        HKMetadataKeySyncVersion: 1,
                        HKMetadataKeyWorkoutBrandName: "Ritmo"
                    ], completion: $0) }
                    try await self.complete { builder.endCollection(withEnd: end, completion: $0) }
                    let workout: HKWorkout = try await withCheckedThrowingContinuation { continuation in
                        builder.finishWorkout { workout, error in
                            if let error = error { continuation.resume(throwing: error) }
                            else if let workout = workout { continuation.resume(returning: workout) }
                            else { continuation.resume(throwing: self.operationError()) }
                        }
                    }
                    call.resolve(["saved": true, "id": workout.uuid.uuidString])
                } catch {
                    builder.discardWorkout()
                    call.reject("No se pudo guardar en Salud: " + error.localizedDescription)
                }
                DispatchQueue.main.async { self.saving = false }
            }
        }
    }
    private func complete(_ work: (@escaping (Bool, Error?) -> Void) -> Void) async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            work { success, error in
                if let error = error { continuation.resume(throwing: error) }
                else if success { continuation.resume() }
                else { continuation.resume(throwing: self.operationError()) }
            }
        }
    }
    private func operationError() -> NSError {
        NSError(domain: "RitmoHealth", code: 1, userInfo: [NSLocalizedDescriptionKey: "Salud no completó la operación."])
    }
    private func activityName(_ type: HKWorkoutActivityType) -> String {
        switch type {
        case .traditionalStrengthTraining: return "Entrenamiento de fuerza"
        case .functionalStrengthTraining: return "Fuerza funcional"
        case .running: return "Carrera"
        case .walking: return "Caminata"
        case .cycling: return "Ciclismo"
        case .swimming: return "Natación"
        case .elliptical: return "Elíptica"
        case .rowing: return "Remo"
        case .highIntensityIntervalTraining: return "Entrenamiento por intervalos"
        case .yoga: return "Yoga"
        case .pilates: return "Pilates"
        case .hiking: return "Senderismo"
        case .stairClimbing: return "Escaleras"
        case .coreTraining: return "Trabajo de core"
        case .crossTraining: return "Entrenamiento cruzado"
        case .dance: return "Baile"
        case .cooldown: return "Vuelta a la calma"
        default: return "Entrenamiento"
        }
    }
}
