import Foundation

/// Bridge for communicating with the Deno core process via stdin/stdout
class DenoBridge {
    
    private var process: Process?
    private var stdinPipe: Pipe?
    private var stdoutPipe: Pipe?
    private var stderrPipe: Pipe?
    
    private let responseHandler: (String) -> Void
    private let queue = DispatchQueue(label: "com.budgetbudget.deno-bridge")
    
    init(responseHandler: @escaping (String) -> Void) {
        self.responseHandler = responseHandler
    }
    
    /// Start the Deno core process
    func start() {
        queue.async { [weak self] in
            self?.startProcess()
        }
    }
    
    /// Stop the Deno core process
    func stop() {
        queue.async { [weak self] in
            self?.process?.terminate()
            self?.process = nil
        }
    }
    
    /// Send a request to the Deno core
    /// - Parameter request: Pre-serialized JSON string (one line)
    func sendRequest(_ request: String) {
        queue.async { [weak self] in
            guard let self = self,
                  let stdin = self.stdinPipe?.fileHandleForWriting else {
                print("Deno process not running")
                return
            }
            
            if var data = request.data(using: .utf8) {
                data.append(UInt8(ascii: "\n"))
                stdin.write(data)
            } else {
                print("Failed to encode request string as UTF-8")
            }
        }
    }
    
    // MARK: - Private
    
    private func startProcess() {
        // Find the Deno core binary in the app bundle
        guard let resourcePath = Bundle.main.resourcePath else {
            print("Could not find resource path")
            return
        }
        
        let corePath = (resourcePath as NSString).appendingPathComponent("rpc-server")
        
        guard FileManager.default.fileExists(atPath: corePath) else {
            print("Deno core binary not found at: \(corePath)")
            return
        }
        
        // Set up pipes
        let stdinPipe = Pipe()
        let stdoutPipe = Pipe()
        let stderrPipe = Pipe()
        
        self.stdinPipe = stdinPipe
        self.stdoutPipe = stdoutPipe
        self.stderrPipe = stderrPipe
        
        // Create process
        let process = Process()
        process.executableURL = URL(fileURLWithPath: corePath)
        process.standardInput = stdinPipe
        process.standardOutput = stdoutPipe
        process.standardError = stderrPipe
        
        // Handle stdout (responses from Deno)
        stdoutPipe.fileHandleForReading.readabilityHandler = { [weak self] handle in
            let data = handle.availableData
            guard !data.isEmpty else { return }
            
            if let line = String(data: data, encoding: .utf8)?.trimmingCharacters(in: .whitespacesAndNewlines),
               !line.isEmpty {
                // Each line is a JSON response
                for responseLine in line.components(separatedBy: "\n") {
                    if !responseLine.isEmpty {
                        self?.responseHandler(responseLine)
                    }
                }
            }
        }
        
        // Handle stderr (errors/logs from Deno)
        stderrPipe.fileHandleForReading.readabilityHandler = { handle in
            let data = handle.availableData
            if let output = String(data: data, encoding: .utf8), !output.isEmpty {
                print("[Deno] \(output)")
            }
        }
        
        // Handle process termination
        process.terminationHandler = { [weak self] process in
            print("Deno process terminated with code: \(process.terminationStatus)")
            self?.stdinPipe = nil
            self?.stdoutPipe = nil
            self?.stderrPipe = nil
        }
        
        // Start the process
        do {
            try process.run()
            self.process = process
        } catch {
            print("Failed to start Deno core process: \(error)")
        }
    }
}

