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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { QRService } from "@/app/services/qr-service"
import { saveGeneratedFile, generateFileId } from "@/app/services/file-storage"
import { useToast } from "@/app/hooks/use-toast"

export function QRGeneratorScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [url, setUrl] = useState("")
  const [logoImage, setLogoImage] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState([30])
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [shape, setShape] = useState<'circle' | 'rounded'>('circle')
  const [margin, setMargin] = useState([4])
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H')
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

    setIsGenerating(true)
    try {
      const qrDataUrl = await QRService.generateQR({
        url,
        logoImage,
        logoSize: logoSize[0],
        shape,
        margin: margin[0],
        errorCorrectionLevel: errorLevel,
      })
      setQrImage(qrDataUrl)
    } catch (error) {
      console.error("[v0] Error generating QR:", error)
      toast({
        title: "Error",
        description: "No se pudo generar el código QR",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadQR = () => {
    if (!qrImage) return

    const link = document.createElement("a")
    link.download = "qr-code.png"
    link.href = qrImage
    link.click()

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

    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
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

          <div className="space-y-2">
            <Label>Forma del contorno</Label>
            <Select value={shape} onValueChange={(v) => setShape(v as 'circle' | 'rounded')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona la forma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="circle">Circular (PNG)</SelectItem>
                <SelectItem value="rounded">Rectángulo redondeado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Margen del QR: {margin[0]}px</Label>
            <Slider value={margin} onValueChange={setMargin} min={0} max={12} step={1} />
          </div>

          <div className="space-y-2">
            <Label>Corrección de errores</Label>
            <Select value={errorLevel} onValueChange={(v) => setErrorLevel(v as 'L' | 'M' | 'Q' | 'H')}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="L">L (baja)</SelectItem>
                <SelectItem value="M">M (media)</SelectItem>
                <SelectItem value="Q">Q (alta)</SelectItem>
                <SelectItem value="H">H (máxima)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generateQR} className="w-full" size="lg" disabled={isGenerating}>
            {isGenerating ? "Generando..." : "Generar Código QR"}
          </Button>
        </CardContent>
      </Card>

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
        </CardContent>
      </Card>
    </div>
  )
}
