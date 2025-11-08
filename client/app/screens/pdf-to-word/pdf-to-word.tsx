"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Download, FileText, FileType } from "lucide-react"
import { PDFDocument } from "pdf-lib"
import { saveAs } from "file-saver"
import { saveGeneratedFile, generateFileId, formatFileSize } from "@/lib/file-storage"
import { useToast } from "@/hooks/use-toast"

export function PDFToWordScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
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

  const convertToWord = async () => {
    if (!pdfFile) return

    setIsConverting(true)
    try {
      const { PDFService } = await import("@/lib/services/pdf-service")
      const blob = await PDFService.convertToWord({ file: pdfFile })
      const fileName = pdfFile.name.replace(".pdf", ".docx")

      saveAs(blob, fileName)

      saveGeneratedFile({
        id: generateFileId(),
        name: fileName,
        type: "Documento Convertido",
        date: new Date().toLocaleDateString(),
        size: formatFileSize(blob.size),
      })

      toast({
        title: "Conversión exitosa",
        description: "El documento se ha convertido con el texto extraído",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("[v0] Error converting to Word:", error)
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
              <div className="mt-4 p-6 bg-gradient-to-br from-chart-4/10 to-chart-2/10 rounded-lg border-2 border-dashed border-chart-4/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-chart-4/20 rounded-full flex items-center justify-center">
                    <FileType className="w-8 h-8 text-chart-4" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">PDF con {pageCount} páginas</p>
                    <p className="text-sm text-muted-foreground">Se extraerá el texto y se convertirá</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={convertToWord} className="w-full" size="lg" disabled={isConverting}>
            <Download className="w-4 h-4 mr-2" />
            {isConverting ? "Convirtiendo..." : "Convertir a Documento"}
          </Button>
        </>
      )}
    </div>
  )
}
