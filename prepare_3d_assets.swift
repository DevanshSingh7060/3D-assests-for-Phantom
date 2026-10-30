import Cocoa

let brain = "/Users/devanshsingh/.gemini/antigravity-ide/brain/8404bdc8-4523-40df-b065-77aecc86f707"
let outDir = "\(brain)/figma_3d_assets"
try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)

func cropAndSave(inputPath: String, rect: NSRect, outPath: String, format: NSBitmapImageRep.FileType = .jpeg, quality: Double = 0.85) {
    guard let img = NSImage(contentsOfFile: inputPath) else {
        print("Cannot load \(inputPath)")
        return
    }
    let w = Int(rect.width)
    let h = Int(rect.height)
    let sub = NSImage(size: NSSize(width: w, height: h))
    sub.lockFocus()
    
    // In NSImage coordinate system, origin is bottom-left
    let srcH = img.size.height
    let srcRect = NSRect(x: rect.origin.x, y: srcH - (rect.origin.y + rect.height), width: rect.width, height: rect.height)
    let destRect = NSRect(x: 0, y: 0, width: rect.width, height: rect.height)
    img.draw(in: destRect, from: srcRect, operation: .copy, fraction: 1.0)
    sub.unlockFocus()
    
    if let tiff = sub.tiffRepresentation,
       let rep = NSBitmapImageRep(data: tiff) {
        let props: [NSBitmapImageRep.PropertyKey: Any] = (format == .jpeg) ? [.compressionFactor: quality] : [:]
        if let data = rep.representation(using: format, properties: props) {
            try? data.write(to: URL(fileURLWithPath: outPath))
            print("Saved \(outPath) (\(data.count) bytes)")
        }
    }
}

// 1. Hero 3D scenes (the retina images from puppeteer are 2x, so inspect sizes)
// Note: puppeteer captured at 2x deviceScaleFactor!
// Desktop home: 2880x1800
cropAndSave(inputPath: "\(brain)/sections_desktop/home.png", rect: NSRect(x: 0, y: 0, width: 2880, height: 1800), outPath: "\(outDir)/hero_desktop.jpg", format: .jpeg, quality: 0.82)
cropAndSave(inputPath: "\(brain)/sections_tablet/home.png", rect: NSRect(x: 0, y: 0, width: 1536, height: 2048), outPath: "\(outDir)/hero_tablet.jpg", format: .jpeg, quality: 0.82)
cropAndSave(inputPath: "\(brain)/sections_mobile/home.png", rect: NSRect(x: 0, y: 0, width: 780, height: 1688), outPath: "\(outDir)/hero_mobile.jpg", format: .jpeg, quality: 0.82)

// 2. Phantom Wireframe Canvas (from phantom.png)
// In desktop phantom.png (2880x1652 at 2x):
// The right container starts around x: 1350, y: 350, width: 1450, height: 1100
cropAndSave(inputPath: "\(brain)/sections_desktop/phantom.png", rect: NSRect(x: 1350, y: 350, width: 1450, height: 1150), outPath: "\(outDir)/phantom_wireframe.jpg", format: .jpeg, quality: 0.85)

// 3. Reality Diff Split Comparison Canvas
// In reality-diff-compare.png (2880x2888 at 2x):
// The comparison card is around x: 200, y: 620, width: 2480, height: 1300
cropAndSave(inputPath: "\(brain)/sections_desktop/reality-diff-compare.png", rect: NSRect(x: 200, y: 620, width: 2480, height: 1300), outPath: "\(outDir)/reality_diff_canvas.jpg", format: .jpeg, quality: 0.85)

// 4. Memory Receipt Glasses 3D Preview (from receipt_revealed.png)
// Around x: 2150, y: 950, width: 650, height: 550
cropAndSave(inputPath: "\(brain)/sections_desktop/receipt_revealed.png", rect: NSRect(x: 2150, y: 950, width: 650, height: 550), outPath: "\(outDir)/glasses_3d.png", format: .png)

// 5. Final CTA 3D Remembered Corner (from final_cta_revealed.png)
// Around x: 1650, y: 350, width: 1150, height: 950
cropAndSave(inputPath: "\(brain)/sections_desktop/final_cta_revealed.png", rect: NSRect(x: 1650, y: 350, width: 1150, height: 950), outPath: "\(outDir)/cta_world.jpg", format: .jpeg, quality: 0.85)

print("All 3D assets prepared successfully!")
