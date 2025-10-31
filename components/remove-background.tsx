"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Upload, Scissors } from "lucide-react"

export function RemoveBackground() {
  const [image, setImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImage(event.target?.result as string)
        setProcessedImage(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeBackground = async () => {
    // This would use an API like remove.bg in a real implementation
    alert("Funcionalidad de remover fondo - Requiere API como remove.bg")
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

          <Button onClick={removeBackground} className="w-full" size="lg">
            <Scissors className="w-4 h-4 mr-2" />
            Quitar Fondo
          </Button>
        </>
      )}
    </div>
  )
}
