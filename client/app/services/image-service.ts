import imageCompression from "browser-image-compression"

export interface CompressImageOptions {
  file: File
  quality: number
}

export interface RemoveBackgroundOptions {
  file: File
}

export class ImageService {
  static async compress(options: CompressImageOptions): Promise<Blob> {
    const { file, quality } = options

    const compressionOptions = {
      maxSizeMB: (quality / 100) * 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    }

    return await imageCompression(file, compressionOptions)
  }

  static async removeBackground(options: RemoveBackgroundOptions): Promise<Blob> {
    const { file } = options

    const img = await this.loadImage(file)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) throw new Error("Could not get canvas context")

    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      if (r > 200 && g > 200 && b > 200) {
        data[i + 3] = 0
      }
    }

    ctx.putImageData(imageData, 0, 0)

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/png")
    })
  }

  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }
}