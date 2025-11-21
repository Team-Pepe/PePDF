"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Scissors, Download } from "lucide-react"
import { ImageService } from "@/app/services/image-service"
import { saveAs } from "file-saver"
import { uploadToS3AndSave, formatFileSize } from "@/app/services/file-storage"
import { useToast } from "@/app/hooks/use-toast"

export function RemoveBackgroundScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [image, setImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setOriginalFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setProcessedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeBackground = async () => {
    if (!originalFile) return

    setIsProcessing(true)
    try {
      const blob = await ImageService.removeBackground({ file: originalFile })
      const url = URL.createObjectURL(blob)
      setProcessedImage(url)

      toast({
        title: "Fondo removido",
        description: "La imagen ha sido procesada exitosamente",
      })
    } catch (error) {
      console.error("[v0] Error removing background:", error)
      toast({
        title: "Error",
        description: "No se pudo procesar la imagen",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadImage = async () => {
    if (!processedImage) return

    try {
      const res = await fetch(processedImage)
      const blob = await res.blob()
      const fileName = originalFile?.name.replace(/\.(jpg|jpeg|png|webp)$/i, "-no-bg.png") || "image-no-bg.png"
      saveAs(blob, fileName)

      const toDataURL = (b: Blob) => new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onloadend = () => resolve(r.result as string)
        r.onerror = reject
        r.readAsDataURL(b)
      })

      try {
        const dataUrl = await toDataURL(blob)
        const saved = await uploadToS3AndSave(dataUrl, fileName, "image/png", "image")
        toast({
          title: "Descargada y guardada en S3",
          description: `Tamaño: ${formatFileSize(blob.size)} · Archivo: ${saved.name}`,
        })
      } catch (e) {
        toast({
          title: "Descargada, pero fallo al subir a S3",
          description: `Tamaño: ${formatFileSize(blob.size)}. Intenta de nuevo más tarde.`,
          variant: "destructive",
        })
      }

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch {}
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label>Seleccionar Imagen</Label>
            <Button
              variant="outline"
              className="w-full h-32 border-dashed bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click para subir imagen</span>
              </div>
            </Button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
        </CardContent>
      </Card>

      {image && (
        <>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <Label className="mb-4 block">Original</Label>
                <img
                  src={image || "/placeholder.svg"}
                  alt="Original"
                  className="w-full rounded-lg border border-border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Label className="mb-4 block">Sin Fondo</Label>
                <div className="w-full aspect-square bg-muted rounded-lg border border-border flex items-center justify-center">
                  {processedImage ? (
                    <img src={processedImage || "/placeholder.svg"} alt="Processed" className="w-full rounded-lg" />
                  ) : (
                    <p className="text-muted-foreground text-sm">La imagen procesada aparecerá aquí</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4">
            <Button onClick={removeBackground} className="flex-1" size="lg" disabled={isProcessing}>
              <Scissors className="w-4 h-4 mr-2" />
              {isProcessing ? "Procesando..." : "Quitar Fondo"}
            </Button>
            {processedImage && (
              <Button onClick={downloadImage} variant="outline" className="flex-1 bg-transparent" size="lg">
                <Download className="w-4 h-4 mr-2" />
                Descargar y Guardar en S3
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
