import QRCode from "qrcode"

export interface QROptions {
  url: string
  logoImage?: string | null
  logoSize?: number
  width?: number
  shape?: 'circle' | 'rounded'
  margin?: number
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

export class QRService {
  static async generateQR(options: QROptions): Promise<string> {
    const { url, logoImage, logoSize = 30, width = 400, shape = 'circle', margin = 4, errorCorrectionLevel = 'H' } = options

    const SAFE_LOGO_RATIO = 0.25
    const requestedRatio = Math.max(0.1, Math.min(logoSize / 100, 0.6))

    const adaptiveWidth = requestedRatio > SAFE_LOGO_RATIO
      ? Math.round(width * (requestedRatio / SAFE_LOGO_RATIO))
      : width

    const canvas = document.createElement("canvas")

    await QRCode.toCanvas(canvas, url, {
      width: adaptiveWidth,
      margin,
      errorCorrectionLevel,
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
          const maxSafeSize = SAFE_LOGO_RATIO * canvas.width
          const desiredSize = requestedRatio * canvas.width
          const size = Math.min(desiredSize, maxSafeSize)
          const x = (canvas.width - size) / 2
          const y = (canvas.height - size) / 2

          const isPNG = logoImage.startsWith("data:image/png")
          const padding = Math.max(6, Math.round(size * 0.06))

          if (shape === 'circle' && isPNG) {
            const cx = canvas.width / 2
            const cy = canvas.height / 2
            const r = size / 2 + padding

            ctx.save()
            ctx.beginPath()
            ctx.arc(cx, cy, r, 0, Math.PI * 2)
            ctx.fillStyle = "#FFFFFF"
            ctx.fill()

            ctx.beginPath()
            ctx.arc(cx, cy, size / 2, 0, Math.PI * 2)
            ctx.clip()
            ctx.drawImage(img, x, y, size, size)
            ctx.restore()
          } else {
            const radius = Math.round(size * 0.12)
            ctx.save()
            ctx.beginPath()
            ctx.moveTo(x + radius, y)
            ctx.lineTo(x + size - radius, y)
            ctx.quadraticCurveTo(x + size, y, x + size, y + radius)
            ctx.lineTo(x + size, y + size - radius)
            ctx.quadraticCurveTo(x + size, y + size, x + size - radius, y + size)
            ctx.lineTo(x + radius, y + size)
            ctx.quadraticCurveTo(x, y + size, x, y + size - radius)
            ctx.lineTo(x, y + radius)
            ctx.quadraticCurveTo(x, y, x + radius, y)
            ctx.closePath()
            ctx.fillStyle = "#FFFFFF"
            ctx.fill()
            ctx.clip()
            ctx.drawImage(img, x, y, size, size)
            ctx.restore()
          }
          resolve(null)
        }
        img.onerror = reject
        img.src = logoImage
      })
    }

    return canvas.toDataURL()
  }
}