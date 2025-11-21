"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, FileText, ImageIcon } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { uploadToS3AndSave } from "@/app/services/file-storage"
import { useToast } from "@/app/hooks/use-toast"
import JSZip from "jszip"

export function PDFToImagesScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png")
  const [isConverting, setIsConverting] = useState(false)
  const [pageCount, setPageCount] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)

      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        setPageCount(pdfDoc.getPageCount())
      } catch (error) {
        console.error("[v0] Error loading PDF:", error)
      }
    }
  }

  const convertToImages = async () => {
    if (!pdfFile) return

    setIsConverting(true)
    try {
      // Dynamic import to avoid SSR issues
      const { PDFService } = await import("@/app/services/pdf-service")
      
      const images = await PDFService.convertToImages({
        file: pdfFile,
        format,
        quality: 0.92,
      })

      const zip = new JSZip()
      const baseName = pdfFile.name.replace(".pdf", "")

      images.forEach((blob, index) => {
        zip.file(`${baseName}-page-${index + 1}.${format}`, blob)
      })

      const zipBlob = await zip.generateAsync({ type: "blob" })
      const zipFileName = `${baseName}-images.zip`

      saveAs(zipBlob, zipFileName)

      const toDataURL = (b: Blob) => new Promise<string>((resolve, reject) => {
        const r = new FileReader()
        r.onloadend = () => resolve(r.result as string)
        r.onerror = reject
        r.readAsDataURL(b)
      })

      try {
        const dataUrl = await toDataURL(zipBlob)
        const saved = await uploadToS3AndSave(dataUrl, zipFileName, "application/zip", "image")
        toast({
          title: "Extraído y guardado en S3",
          description: `Se extrajeron ${pageCount} páginas como imágenes ${format.toUpperCase()} · Archivo: ${saved.name}`,
        })
      } catch (e) {
        toast({
          title: "Descargado, pero fallo al subir a S3",
          description: `Imágenes ${format.toUpperCase()} extraídas. Intenta subir más tarde.`,
          variant: "destructive",
        })
      }

      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (error) {
      console.error("[v0] Error converting PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo convertir el PDF",
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label>Seleccionar PDF</Label>
            <Button
              variant="outline"
              className="w-full h-32 border-dashed bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click para subir archivo PDF</span>
              </div>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>

      {pdfFile && (
        <>
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{pdfFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Formato de Imagen</Label>
                <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG (Alta calidad, sin pérdida)</SelectItem>
                    <SelectItem value="jpeg">JPEG (Menor tamaño, con compresión)</SelectItem>
                    <SelectItem value="webp">WebP (Moderno, equilibrado)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border-2 border-dashed border-primary/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">{pageCount} páginas detectadas</p>
                    <p className="text-sm text-muted-foreground">Se extraerán como imágenes {format.toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={convertToImages} className="w-full" size="lg" disabled={isConverting}>
            <Download className="w-4 h-4 mr-2" />
            {isConverting ? "Convirtiendo..." : "Extraer, Descargar y Guardar en S3"}
          </Button>
        </>
      )}
    </div>
  )
}
