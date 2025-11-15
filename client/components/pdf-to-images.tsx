"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Download, FileText, ImageIcon } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { saveGeneratedFile, generateFileId, formatFileSize } from "@/app/services/file-storage"
import { useToast } from "@/app/hooks/use-toast"

export function PDFToImages() {
  const router = useRouter()
  const { toast } = useToast()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [pageCount, setPageCount] = useState<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

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
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()

      for (let i = 0; i < pageCount; i++) {
        const newPdfDoc = await PDFDocument.create()
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i])
        newPdfDoc.addPage(copiedPage)

        const pdfBytes = await newPdfDoc.save()
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
        const fileName = `${pdfFile.name.replace(".pdf", "")}-page-${i + 1}.pdf`

        saveAs(blob, fileName)

        saveGeneratedFile({
          id: generateFileId(),
          name: fileName,
          type: "Página PDF",
          date: new Date().toLocaleDateString(),
          size: formatFileSize(pdfBytes.length),
        })
      }

      toast({
        title: "Conversión exitosa",
        description: `Se extrajeron ${pageCount} páginas del PDF`,
      })

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
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{pdfFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              {previewUrl && (
                <div className="mt-4 p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border-2 border-dashed border-primary/20">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-lg">{pageCount} páginas detectadas</p>
                      <p className="text-sm text-muted-foreground">Se extraerán como archivos PDF individuales</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={convertToImages} className="w-full" size="lg" disabled={isConverting}>
            <Download className="w-4 h-4 mr-2" />
            {isConverting ? "Convirtiendo..." : "Extraer Páginas"}
          </Button>
        </>
      )}
    </div>
  )
}
