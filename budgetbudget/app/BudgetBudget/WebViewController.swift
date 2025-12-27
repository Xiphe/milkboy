import Cocoa
import WebKit

class WebViewController: NSViewController, WKScriptMessageHandler {
    
    private var webView: WKWebView!
    private var denoBridge: DenoBridge!
    
    override func loadView() {
        // Configure WKWebView
        let config = WKWebViewConfiguration()
        let contentController = WKUserContentController()
        
        // Register our IPC message handler
        contentController.add(self, name: "bbIpc")
        config.userContentController = contentController
        
        webView = WKWebView(frame: .zero, configuration: config)
        webView.autoresizingMask = [.width, .height]
        
        #if DEBUG
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        if #available(macOS 13.3, *) {
            webView.isInspectable = true
        }
        #endif
        
        self.view = webView
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        // Initialize Deno bridge
        denoBridge = DenoBridge { [weak self] response in
            self?.sendResponseToWebView(response)
        }
        denoBridge.start()
        
        // Load bundled UI
        loadBundledUI()
    }
    
    
    private func loadBundledUI() {
        // Look for UI resources in the app bundle
        guard let resourcePath = Bundle.main.resourcePath else {
            showError("Could not find resource path")
            return
        }
        
        let uiPath = (resourcePath as NSString).appendingPathComponent("ui")
        let indexPath = (uiPath as NSString).appendingPathComponent("index.html")
        let indexURL = URL(fileURLWithPath: indexPath)
        
        if FileManager.default.fileExists(atPath: indexPath) {
            let uiDirURL = URL(fileURLWithPath: uiPath)
            webView.loadFileURL(indexURL, allowingReadAccessTo: uiDirURL)
        } else {
            showError("UI resources not found at: \(indexPath)")
        }
    }
    
    private func showError(_ message: String) {
        let html = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: #1a1a2e;
                    color: #ff4757;
                }
                .error {
                    text-align: center;
                    padding: 2rem;
                }
                h1 { font-size: 1.5rem; }
                p { color: #a0a0a0; margin-top: 1rem; }
            </style>
        </head>
        <body>
            <div class="error">
                <h1>Error</h1>
                <p>\(message)</p>
            </div>
        </body>
        </html>
        """
        webView.loadHTMLString(html, baseURL: nil)
    }
    
    // MARK: - WKScriptMessageHandler
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "bbIpc" else { return }
        guard let body = message.body as? String else {
            print("Invalid IPC message format - expected string, got " + String(describing: message.body))
            return
        }
        
        // Forward to Deno bridge
        denoBridge.sendRequest(body)
    }
    
    // MARK: - Response handling
    
    private func sendResponseToWebView(_ response: String) {
        // Call the global resolver function in the WebView
        let script = "window.__bb_resolveIpc(\(response));"
        
        DispatchQueue.main.async { [weak self] in
            self?.webView.evaluateJavaScript(script) { _, error in
                if let error = error {
                    print("Error sending response to WebView: \(error)")
                }
            }
        }
    }
    
    deinit {
        denoBridge?.stop()
    }
}

