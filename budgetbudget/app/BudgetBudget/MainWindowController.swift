import Cocoa
import WebKit

class MainWindowController: NSWindowController {
    
    private var webViewController: WebViewController!
    
    convenience init() {
        let window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1024, height: 768),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "BudgetBudget"
        window.minSize = NSSize(width: 480, height: 640)
        window.center()
        window.setFrameAutosaveName("MainWindow")
        
        self.init(window: window)
        
        webViewController = WebViewController()
        window.contentViewController = webViewController
    }
    
    override func windowDidLoad() {
        super.windowDidLoad()
    }
}

