# App Android e iOS con Capacitor — versión 1.0

## Qué se ha preparado

Capacitor 8.6.2 empaqueta la interfaz existente sin cambiar HTML/CSS/JS por un framework. Se incluyen proyectos Android Gradle e iOS Xcode con Swift Package Manager. IndexedDB guarda perfil, menús, entrenamientos y progreso; localStorage, el tema. Filesystem 8.1.5 y Share 8.0.3, plugins oficiales, permiten exportar JSON/CSV a la hoja del sistema, una función que la descarga Blob del navegador no garantiza en un WebView. No hay servidor de datos ni cuenta de usuario.

`capacitor.config.json` usa `webDir: "dist"`. No contiene `server.url`: la app carga sus archivos incluidos, no una web alojada. El navegador de ordenador sigue pudiendo ejecutar `dist/` como antes. Se han añadido márgenes de zona segura para los bordes de pantalla; su aspecto debe comprobarse en dispositivos.

## Preparar el proyecto

Instalar Node 22 o posterior. Desde la carpeta del proyecto:

```sh
npm ci
npm test
npm run build:offline
npm run native:sync
```

No ejecutar `cap add` de nuevo: las carpetas de ambas plataformas ya existen. Tras cada cambio en `dist/`, ejecutar `npm run native:sync` antes de compilar. Editar siempre los archivos originales de `dist/`, no las copias generadas en `android/` o `ios/`.

## Android

Instalar Android Studio compatible con el proyecto Gradle, Android SDK Platform 36 y JDK 21. El proyecto usa `compileSdk`/`targetSdk` 36 y mínimo SDK 24; comprobar los requisitos de Google Play vigentes al publicar.

```sh
npm run native:sync
npm run android:open
```

En Android Studio, dejar terminar Gradle Sync, seleccionar un emulador o móvil con depuración USB y pulsar Run. Alternativamente, con el SDK configurado y el dispositivo disponible, `npm run android:run`.

Para crear una compilación de depuración desde terminal con el SDK instalado:

```sh
cd android
./gradlew assembleDebug
```

El APK aparece en `android/app/build/outputs/apk/debug/`. Este comando no se ha podido ejecutar aquí por no disponer de Android SDK.

Para Google Play, usar **Build → Generate Signed App Bundle / APK → Android App Bundle**. Crear/proteger la clave de subida, configurar la firma y generar el AAB de release. No guardar claves ni contraseñas en el repositorio. Un APK de depuración no es el paquete de publicación.

## iOS

Se necesita un Mac con una versión de Xcode compatible con Capacitor 8 y con los requisitos vigentes de App Store Connect. Abrir el proyecto:

```sh
npm run native:sync
npm run ios:open
```

Xcode resolverá el paquete `capacitor-swift-pm` 8.6.2. Seleccionar el equipo de desarrollo en **Signing & Capabilities**, comprobar el Bundle Identifier y ejecutar primero en un simulador y después en iPhone. El proyecto establece iOS 15 como mínimo técnico.

Para distribuir, se requiere pertenencia al Apple Developer Program. Con la app completa y configurada, seleccionar un destino de dispositivo genérico, **Product → Archive** y **Distribute App → App Store Connect**; probar mediante TestFlight antes del envío. Esta entrega no incluye un archivo firmado. No es posible compilar iOS con Xcode en este entorno Linux; un servicio de compilación con macOS sería otra opción.

## Identidad provisional

- Nombre: `Ritmo`.
- Application ID / Bundle ID: `com.dietaygym.personal`.
- Versión inicial de desarrollo: `1.0`, compilación 1.

No registrar estos identificadores en las tiendas hasta acordar el nombre y la identidad definitivos. Si se cambia la identidad, actualizar `capacitor.config.json`, `applicationId`/`namespace` y paquete Java en Android, y Bundle Identifier en Xcode. `cap sync` no renombra por sí solo los proyectos ya generados. Un cambio de identificador crea otra app y no conserva automáticamente sus datos.

## Prueba de aceptación en cada plataforma

1. Abrir sin conectar con una web externa, completar perfil y guardar. Comprobar las cifras de referencia del README.
2. Forzar el cierre de la app y volver a abrir: recuperar perfil y tema.
3. Activar modo avión antes de abrir y repetir cálculo y guardado. Los archivos se empaquetan localmente, pero el resultado real de esta prueba está pendiente.
4. Instalar una actualización con el mismo identificador/firma sin desinstalar y verificar que conserva el perfil. No cambiar el origen local configurado por Capacitor.
5. Comprobar teclado, orientación, zonas seguras, formularios, avisos y botones en un teléfono real. En Android probar también el botón Atrás.
6. Probar bloqueos de seguridad y cambios de macros. Verificar que el teclado permite introducir peso decimal según el idioma del dispositivo.

## Preparación de las tiendas — estado de entrega

Las cinco fases de código están implementadas. Hay iconos propios, una página local de privacidad y un PrivacyInfo.xcprivacy de iOS enlazado como recurso que declara el acceso a marcas de tiempo de archivos (C617.1) de Filesystem. La pantalla de lanzamiento muestra el símbolo de Ritmo y debe revisarse en dispositivos. No se han añadido analítica, publicidad ni cuentas.

Antes del envío siguen pendientes: nombre e identificadores definitivos; identidad/contacto y URL de soporte del responsable; ficha, capturas y declaraciones de privacidad/datos/salud aplicables; revisión de los manifiestos de dependencias dentro del archivo compilado; firma y pruebas de release. La página privacy.html es una base ajustada al comportamiento actual y debe completarse con los datos del distribuidor antes de publicar para terceros. Revisa las copias del sistema y las exportaciones temporales de caché.

La aprobación exige cumplir los requisitos vigentes de cada tienda; Capacitor por sí solo no garantiza aceptación. Las revisiones, las cuentas de desarrollador y la firma del propietario son pasos independientes del código. No se ha realizado ningún envío a Google Play ni App Store.

## Identidad Ritmo

El nombre visible y los iconos de Android/iOS se han actualizado a Ritmo. Se mantiene `com.dietaygym.personal` para que la actualización pertenezca a la misma app y conserve su almacenamiento. Antes del primer envío a tiendas sigue pendiente confirmar el identificador definitivo.

## Perfil personal y selección de foto (1.3)

Mi perfil admite foto, alias y biografía locales. Se usa un input de archivo estándar y recorte/compresión local, sin plugins nuevos. Info.plist incluye textos de biblioteca de fotos y cámara para las opciones que ofrezca el selector de iOS; los permisos no se solicitan en el arranque. Verifica selección/cancelación, retratos orientados, quitar/guardar, persistencia y restauración en móviles físicos antes de distribuir.

## Apple Salud / Fitness — Ritmo 1.4

El proyecto incorpora `RitmoHealthPlugin.swift` y `RitmoViewController.swift`. SceneDelegate y Main.storyboard usan el nuevo controlador. El target referencia `App/App.entitlements` con HealthKit y el Info.plist incluye `NSHealthShareUsageDescription` y `NSHealthUpdateUsageDescription`.

En un Mac con Xcode y la cuenta Apple Developer correspondiente:

1. Ejecutar `npm ci`, `npm run build:offline` y `npm run native:sync`.
2. Abrir `ios/App/App.xcodeproj`, seleccionar tu Team para el identificador de la app y comprobar Signing & Capabilities → HealthKit. Regenerar el perfil de aprovisionamiento con esa capacidad habilitada. No activar Clinical Records ni Background Delivery: no se usan.
3. Compilar y ejecutar en un iPhone real. Resolver cualquier error de compilación/firma y realizar las pruebas de `PRUEBAS.md` antes de distribuir por TestFlight/App Store.
4. En Ritmo: Ajustes → Apple Salud y Fitness → Vincular / revisar permisos. Elegir los permisos de lectura y escritura de entrenamientos. Consultar después los últimos 30 días (máximo 100 sesiones); filtrar Apple Watch cuando el reloj haya sincronizado con Salud.
5. En historial, Guardar en Salud permite revisar fecha, hora y duración. No exportar otra vez sesiones ya grabadas con el reloj. Salud controla sus datos de forma independiente de la base de Ritmo.

No hay API web de HealthKit: instalar la PWA no sustituye esta compilación nativa. No se han compilado ni probado los archivos Swift en este entorno Linux; no se presenta la conexión como validada. Los permisos pueden revocarse desde Salud → perfil → Apps → Ritmo. La consulta es manual y sus resultados no se guardan en IndexedDB ni en copias JSON.
