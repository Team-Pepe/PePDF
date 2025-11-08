"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Download, X, FileText, GripVertical, Layers } from "lucide-react"
import { saveAs } from "file-saver"
import { saveGeneratedFile, generateFileId, formatFileSize } from "@/lib/file-storage"
import { useToast } from "@/hooks/use-toast"

export function MergePDFScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [isMerging, setIsMerging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const pdfFilesOnly = files.filter((file) => file.type === "application/pdf")
    setPdfFiles((prev) => [...prev, ...pdfFilesOnly])
  }

  const removeFile = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      toast({
        title: "Error",
        description: "Necesitas al menos 2 archivos PDF para unir",
        variant: "destructive",
      })
      return
    }

    setIsMerging(true)
    try {
      const { PDFService } = await import("@/lib/services/pdf-service")
      const blob = await PDFService.merge({ files: pdfFiles })
      const fileName = "merged-document.pdf"

      saveAs(blob, fileName)

      saveGeneratedFile({
        id: generateFileId(),
        name: fileName,
        type: "PDF Unido",
        date: new Date().toLocaleDateString(),
        size: formatFileSize(blob.size),
      })

      toast({
        title: "PDFs unidos exitosamente",
        description: `Se combinaron ${pdfFiles.length} archivos`,
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("[v0] Error merging PDFs:", error)
      toast({
        title: "Error",
        description: "No se pudieron unir los PDFs",
        variant: "destructive",
      })
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label>Seleccionar PDFs</Label>
            <Button
              variant="outline"
              className="w-full h-32 border-dashed bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click para subir archivos PDF</span>
                <span className="text-xs text-muted-foreground">(Puedes seleccionar múltiples archivos)</span>
              </div>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </CardContent>
      </Card>

      {pdfFiles.length > 0 && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="p-6 bg-gradient-to-br from-accent/10 to-chart-2/10 rounded-lg border-2 border-dashed border-accent/20 mb-4">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                    <Layers className="w-8 h-8 text-accent" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">{pdfFiles.length} archivos listos</p>
                    <p className="text-sm text-muted-foreground">Se combinarán en un solo PDF</p>
                  </div>
                </div>
              </div>

              <Label className="mb-4 block">Archivos Seleccionados</Label>
              <div className="space-y-2">
                {pdfFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-secondary rounded-lg group">
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                    <div className="w-10 h-10 bg-background rounded flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={mergePDFs} className="w-full" size="lg" disabled={isMerging}>
            <Download className="w-4 h-4 mr-2" />
            {isMerging ? "Uniendo PDFs..." : "Unir PDFs"}
          </Button>
        </>
      )}
    </div>
  )
}
