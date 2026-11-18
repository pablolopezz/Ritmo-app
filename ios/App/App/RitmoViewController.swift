import Capacitor

class RitmoViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(RitmoHealthPlugin())
    }
}
