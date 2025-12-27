import Cocoa

class Document: NSDocument {
    
    override init() {
        super.init()
    }

    override class var autosavesInPlace: Bool {
        return true
    }

    override func makeWindowControllers() {
        let windowController = MainWindowController()
        self.addWindowController(windowController)
    }

    override func data(ofType typeName: String) throws -> Data {
        // TODO: Implement document serialization
        throw NSError(domain: NSOSStatusErrorDomain, code: unimpErr, userInfo: nil)
    }

    override func read(from data: Data, ofType typeName: String) throws {
        // TODO: Implement document deserialization
        throw NSError(domain: NSOSStatusErrorDomain, code: unimpErr, userInfo: nil)
    }
}

