"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Upload, Download, Archive } from "lucide-react"
import { saveAs } from "file-saver"
import { ImageService } from "@/app/services/image-service"
import { saveGeneratedFile, generateFileId, formatFileSize } from "@/app/services/file-storage"
import { useToast } from "@/app/hooks/use-toast"

export function CompressScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [quality, setQuality] = useState([80])
  const [isCompressing, setIsCompressing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (uploadedFile) {
      setFile(uploadedFile)
      const url = URL.createObjectURL(uploadedFile)
      setPreviewUrl(url)
    }
  }

  const compressFile = async () => {
    if (!file) return

    setIsCompressing(true)
    try {
      let compressedBlob: Blob
      let fileName: string
      let fileType: string

      if (file.type.startsWith("image/")) {
        compressedBlob = await ImageService.compress({
          file,
          quality: quality[0],
        })
        fileName = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, "-compressed.$1")
        fileType = "Imagen Comprimida"
      } else if (file.type === "application/pdf") {
        const { PDFService } = await import("@/app/services/pdf-service")
        compressedBlob = await PDFService.compress({ file })
        fileName = file.name.replace(".pdf", "-compressed.pdf")
        fileType = "PDF Comprimido"
      } else {
        throw new Error("Tipo de archivo no soportado")
      }

      saveAs(compressedBlob, fileName)

      saveGeneratedFile({
        id: generateFileId(),
        name: fileName,
        type: fileType,
        date: new Date().toLocaleDateString(),
        size: formatFileSize(compressedBlob.size),
      })

      toast({
        title: "Archivo comprimido",
        description: `Reducido de ${formatFileSize(file.size)} a ${formatFileSize(compressedBlob.size)}`,
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("[v0] Error compressing file:", error)
      toast({
        title: "Error",
        description: "No se pudo comprimir el archivo",
        variant: "destructive",
      })
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label>Seleccionar Archivo</Label>
            <Button
              variant="outline"
              className="w-full h-32 border-dashed bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click para subir imagen o PDF</span>
              </div>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>

      {file && (
        <>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <Archive className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Tamaño original: {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              {file.type.startsWith("image/") && previewUrl && (
                <div className="relative w-full h-48 bg-secondary rounded-lg overflow-hidden">
                  <img src={previewUrl || "/placeholder.svg"} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}

              {file.type.startsWith("image/") && (
                <div className="space-y-2">
                  <Label>Calidad de Compresión: {quality[0]}%</Label>
                  <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={5} />
                  <p className="text-xs text-muted-foreground">Mayor calidad = archivo más grande</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={compressFile} className="w-full" size="lg" disabled={isCompressing}>
            <Download className="w-4 h-4 mr-2" />
            {isCompressing ? "Comprimiendo..." : "Comprimir y Descargar"}
          </Button>
        </>
      )}
    </div>
  )
}
