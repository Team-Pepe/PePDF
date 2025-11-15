"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Download, Upload, X } from "lucide-react"
import QRCode from "qrcode"
import { saveGeneratedFile, generateFileId } from "@/app/services/file-storage"
import { useToast } from "@/app/hooks/use-toast"

export function QRGenerator() {
  const router = useRouter()
  const { toast } = useToast()
  const [url, setUrl] = useState("")
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState([30])
  const [qrImage, setQrImage] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setLogoImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateQR = async () => {
    if (!url) return

    try {
      const canvas = canvasRef.current
      if (!canvas) return

      // Generate QR code
      await QRCode.toCanvas(canvas, url, {
        width: 400,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })

      // Add logo if exists
      if (logoImage) {
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          const size = (logoSize[0] / 100) * canvas.width
          const x = (canvas.width - size) / 2
          const y = (canvas.height - size) / 2

          // Draw white background for logo
          ctx.fillStyle = "white"
          ctx.fillRect(x - 5, y - 5, size + 10, size + 10)

          // Draw logo
          ctx.drawImage(img, x, y, size, size)

          // Update QR image
          setQrImage(canvas.toDataURL())
        }
        img.src = logoImage
      } else {
        setQrImage(canvas.toDataURL())
      }
    } catch (error) {
      console.error("[v0] Error generating QR:", error)
    }
  }

  const downloadQR = () => {
    if (!qrImage) return

    const link = document.createElement("a")
    link.download = "qr-code.png"
    link.href = qrImage
    link.click()

    // Save to localStorage
    saveGeneratedFile({
      id: generateFileId(),
      name: "qr-code.png",
      type: "Código QR",
      date: new Date().toLocaleDateString(),
      size: "~50 KB",
      downloadUrl: qrImage,
    })

    toast({
      title: "QR generado exitosamente",
      description: "El archivo se guardó en tu dashboard",
    })

    // Redirect to dashboard after 1 second
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Configuration Panel */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="url">URL o Texto</Label>
            <Input
              id="url"
              type="text"
              placeholder="https://ejemplo.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Logo o Imagen (Opcional)</Label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Subir Imagen
              </Button>
              {logoImage && (
                <Button variant="outline" size="icon" onClick={() => setLogoImage(null)}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {logoImage && (
              <div className="mt-4">
                <img
                  src={logoImage || "/placeholder.svg"}
                  alt="Logo preview"
                  className="w-20 h-20 object-contain border border-border rounded-lg"
                />
              </div>
            )}
          </div>

          {logoImage && (
            <div className="space-y-2">
              <Label>Tamaño del Logo: {logoSize[0]}%</Label>
              <Slider value={logoSize} onValueChange={setLogoSize} min={10} max={40} step={1} />
            </div>
          )}

          <Button onClick={generateQR} className="w-full" size="lg">
            Generar Código QR
          </Button>
        </CardContent>
      </Card>

      {/* Preview Panel */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label>Vista Previa</Label>
            <div className="bg-muted rounded-lg p-8 flex items-center justify-center min-h-[400px]">
              {qrImage ? (
                <img src={qrImage || "/placeholder.svg"} alt="QR Code" className="max-w-full" />
              ) : (
                <p className="text-muted-foreground text-center">El código QR aparecerá aquí</p>
              )}
            </div>
            {qrImage && (
              <Button onClick={downloadQR} className="w-full bg-transparent" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Descargar QR
              </Button>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  )
}
