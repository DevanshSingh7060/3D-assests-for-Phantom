import Cocoa

func sliceImage(inputPath: String, outDir: String, sliceHeight: Int) {
    guard let image = NSImage(contentsOfFile: inputPath) else {
        print("Failed to load \(inputPath)")
        return
    }
    
    guard let rep = image.representations.first as? NSBitmapImageRep ?? {
        guard let tiff = image.tiffRepresentation,
              let r = NSBitmapImageRep(data: tiff) else { return nil }
        return r
    }() else {
        print("No bitmap representation for \(inputPath)")
        return
    }
    
    let w = rep.pixelsWide
    let h = rep.pixelsHigh
    print("\(inputPath): \(w)x\(h)")
    
    try? FileManager.default.createDirectory(atPath: outDir, withIntermediateDirectories: true)
    
    var y = 0
    var idx = 0
    while y < h {
        let curH = min(sliceHeight, h - y)
        // Note: CGImage uses top-left or bottom-left depending on origin
        // CGImage crop:
        if let cgImg = rep.cgImage?.cropping(to: CGRect(x: 0, y: y, width: w, height: curH)) {
            let outRep = NSBitmapImageRep(cgImage: cgImg)
            if let pngData = outRep.representation(using: .png, properties: [:]) {
                let outPath = "\(outDir)/slice_\(idx).png"
                try? pngData.write(to: URL(fileURLWithPath: outPath))
                print("Saved \(outPath)")
            }
        }
        y += curH
        idx += 1
    }
}

let brain = "/Users/devanshsingh/.gemini/antigravity-ide/brain/8404bdc8-4523-40df-b065-77aecc86f707"
sliceImage(inputPath: "\(brain)/actual_desktop_full.png", outDir: "\(brain)/desktop_slices", sliceHeight: 1000)
sliceImage(inputPath: "\(brain)/actual_tablet_full.png", outDir: "\(brain)/tablet_slices", sliceHeight: 1000)
sliceImage(inputPath: "\(brain)/actual_mobile_full.png", outDir: "\(brain)/mobile_slices", sliceHeight: 1000)
print("All slicing complete!")
