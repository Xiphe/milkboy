import Cocoa

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Application started - create a new document automatically for testing
        NSDocumentController.shared.newDocument(nil)
    }

    func applicationWillTerminate(_ notification: Notification) {
        // Clean up when app terminates
    }

    func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
        return true
    }
    
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return false
    }
}

