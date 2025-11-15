"use client"

import React, { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Upload, Download, FileText, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { saveAs } from "file-saver"
import { useToast } from "@/app/hooks/use-toast"
import { formatBytes } from "@/lib/utils/file-utils"

export function PDFToWord() {
  const router = useRouter()
  const { toast } = useToast()
  const [pdfFiles, setPdfFiles] = useState<File[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState(0)
  const [currentFile, setCurrentFile] = useState<string>("")
  const [extractedText, setExtractedText] = useState<string>("")
  const [conversionResults, setConversionResults] = useState<Array<{
    fileName: string
    status: 'success' | 'error'
    message: string
  }>>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const pdfFiles = files.filter(file => file.type === "application/pdf")
    
    if (pdfFiles.length !== files.length) {
      toast({
        title: "Archivos filtrados",
        description: "Solo se procesarán los archivos PDF",
        variant: "destructive",
      })
    }
    
    setPdfFiles(pdfFiles)
    setConversionResults([])
    setExtractedText("")
    
    // Preview text from first file
    if (pdfFiles.length > 0) {
      try {
        // Dynamic import to avoid SSR issues
        const { PDFService } = await import("@/app/services/pdf-service")
        const text = await PDFService.extractTextFromPDF(pdfFiles[0])
        setExtractedText(text.join(" ").substring(0, 500) + (text.join(" ").length > 500 ? "..." : ""))
      } catch (error) {
        console.error("Error extracting preview text:", error)
      }
    }
  }

  const convertToWord = async () => {
    if (pdfFiles.length === 0) return

    setIsConverting(true)
    setConversionProgress(0)
    setConversionResults([])

    try {
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i]
        setCurrentFile(file.name)
        setConversionProgress((i / pdfFiles.length) * 100)

        try {
          // Dynamic import to avoid SSR issues
          const { PDFService } = await import("@/app/services/pdf-service")
          
          const result = await PDFService.convertToWord({
            file,
            preserveFormatting: true,
            includeImages: true,
            includeTables: true
          })

          // Generate filename
          const fileName = file.name.replace('.pdf', '.docx')
          
          // Save the Word document
          saveAs(result, fileName)

          setConversionResults(prev => [...prev, {
            fileName: file.name,
            status: 'success',
            message: `Convertido exitosamente a ${fileName}`
          }])

        } catch (fileError) {
          console.error(`Error converting ${file.name}:`, fileError)
          setConversionResults(prev => [...prev, {
            fileName: file.name,
            status: 'error',
            message: `Error: ${fileError instanceof Error ? fileError.message : 'Error desconocido'}`
          }])
        }
      }

      setConversionProgress(100)
      
      const successCount = conversionResults.filter(r => r.status === 'success').length
      toast({
        title: "Conversión completada",
        description: `${successCount} de ${pdfFiles.length} archivos convertidos exitosamente`,
      })
    } catch (error) {
      console.error("Error in conversion process:", error)
      toast({
        title: "Error",
        description: "Error durante el proceso de conversión",
        variant: "destructive",
      })
    } finally {
      setIsConverting(false)
      setCurrentFile("")
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
                <span className="text-sm text-muted-foreground">
                  Click para subir archivos PDF (múltiples archivos soportados)
                </span>
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
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Archivos seleccionados ({pdfFiles.length})</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  PDF → Word
                </div>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto">
                {pdfFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                    <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatBytes(file.size)} • PDF
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {extractedText && (
                <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Vista previa del texto</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {extractedText}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {isConverting && (
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progreso de conversión</span>
                  <span className="text-sm text-muted-foreground">{Math.round(conversionProgress)}%</span>
                </div>
                <Progress value={conversionProgress} className="w-full" />
                {currentFile && (
                  <p className="text-sm text-muted-foreground">
                    Procesando: {currentFile}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {conversionResults.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-medium mb-4">Resultados de conversión</h3>
                <div className="space-y-3">
                  {conversionResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                      {result.status === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.fileName}</p>
                        <p className={`text-sm ${result.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                          {result.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Button 
            onClick={convertToWord} 
            className="w-full" 
            size="lg" 
            disabled={isConverting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isConverting ? "Convirtiendo..." : `Convertir ${pdfFiles.length} archivo${pdfFiles.length > 1 ? 's' : ''} a Word`}
          </Button>
        </>
      )}
    </div>
  )
}
