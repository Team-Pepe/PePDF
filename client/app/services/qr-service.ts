import QRCode from "qrcode"

export interface QROptions {
  url: string
  logoImage?: string | null
  logoSize?: number
  width?: number
}

export class QRService {
  static async generateQR(options: QROptions): Promise<string> {
    const { url, logoImage, logoSize = 30, width = 400 } = options

    const canvas = document.createElement("canvas")

    await QRCode.toCanvas(canvas, url, {
      width,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })

    if (logoImage) {
      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Could not get canvas context")

      const img = new Image()
      img.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        img.onload = () => {
          const size = (logoSize / 100) * canvas.width
          const x = (canvas.width - size) / 2
          const y = (canvas.height - size) / 2

          ctx.fillStyle = "white"
          ctx.fillRect(x - 5, y - 5, size + 10, size + 10)
          ctx.drawImage(img, x, y, size, size)
          resolve(null)
        }
        img.onerror = reject
        img.src = logoImage
      })
    }

    return canvas.toDataURL()
  }
}