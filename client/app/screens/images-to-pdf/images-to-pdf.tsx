"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, X, Download } from "lucide-react"
import { jsPDF } from "jspdf"
import { saveGeneratedFile, generateFileId, formatFileSize } from "@/app/services/file-storage"
import { useToast } from "@/app/hooks/use-toast"

export function ImagesToPDFScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [images, setImages] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImages((prev) => [...prev, event.target?.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const convertToPDF = async () => {
    if (images.length === 0) return

    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < images.length; i++) {
        if (i > 0) {
          pdf.addPage()
        }

        const img = images[i]
        const imgProps = pdf.getImageProperties(img)
        const imgWidth = pageWidth - 20
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width

        const x = 10
        const y = (pageHeight - imgHeight) / 2

        pdf.addImage(img, "JPEG", x, y, imgWidth, imgHeight)
      }

      const pdfBlob = pdf.output("blob")
      const pdfUrl = URL.createObjectURL(pdfBlob)

      const link = document.createElement("a")
      link.download = "images-to-pdf.pdf"
      link.href = pdfUrl
      link.click()

      saveGeneratedFile({
        id: generateFileId(),
        name: "images-to-pdf.pdf",
        type: "PDF",
        date: new Date().toLocaleDateString(),
        size: formatFileSize(pdfBlob.size),
        downloadUrl: pdfUrl,
      })

      toast({
        title: "PDF creado exitosamente",
        description: "El archivo se guardó en tu dashboard",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("[v0] Error converting to PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el PDF",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <Label>Seleccionar Imágenes</Label>
            <Button
              variant="outline"
              className="w-full h-32 border-dashed bg-transparent"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Click para subir imágenes</span>
              </div>
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </CardContent>
      </Card>

      {images.length > 0 && (
        <>
          <Card>
            <CardContent className="pt-6">
              <Label className="mb-4 block">Imágenes Seleccionadas ({images.length})</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img || "/placeholder.svg"}
                      alt={`Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={convertToPDF} className="w-full" size="lg">
            <Download className="w-4 h-4 mr-2" />
            Convertir a PDF
          </Button>
        </>
      )}
    </div>
  )
}
