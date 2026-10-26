import Cocoa

func sliceImage(inputPath: String, outDir: String, sliceHeight: Int) {
    guard let image = NSImage(contentsOfFile: inputPath) else { return }
    let w = Int(image.size.width)
    let h = Int(image.size.height)
    print("\(inputPath): \(w)x\(h)")
    
    try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)
    
    var y = 0
    var idx = 0
    while y < h {
        let curH = min(sliceHeight, h - y)
        let subImage = NSImage(size: NSSize(width: w, height: curH))
        subImage.lockFocus()
        // draw the slice: in NSImage lockFocus, (0,0) is bottom-left
        // The slice is [y, y + curH] from the TOP of the source image.
        // In source image, distance from bottom is: h - (y + curH)
        let srcRect = NSRect(x: 0, y: CGFloat(h - (y + curH)), width: CGFloat(w), height: CGFloat(curH))
        let destRect = NSRect(x: 0, y: 0, width: CGFloat(w), height: CGFloat(curH))
        image.draw(in: destRect, from: srcRect, operation: .copy, fraction: 1.0)
        subImage.unlockFocus()
        
        if let tiff = subImage.tiffRepresentation,
           let rep = NSBitmapImageRep(data: tiff),
           let pngData = rep.representation(using: .png, properties: [:]) {
            let outPath = "\(outDir)/slice_\(idx).png"
            try? pngData.write(to: URL(fileURLWithPath: outPath))
        }
        y += curH
        idx += 1
    }
}

let brain = "/Users/devanshsingh/.gemini/antigravity-ide/brain/8404bdc8-4523-40df-b065-77aecc86f707"
sliceImage(inputPath: "\(brain)/actual_desktop_full.png", outDir: "\(brain)/desktop_slices", sliceHeight: 1000)
sliceImage(inputPath: "\(brain)/actual_tablet_full.png", outDir: "\(brain)/tablet_slices", sliceHeight: 1000)
sliceImage(inputPath: "\(brain)/actual_mobile_full.png", outDir: "\(brain)/mobile_slices", sliceHeight: 1000)
print("Fixed slicing done!")
