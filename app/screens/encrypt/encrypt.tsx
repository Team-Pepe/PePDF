"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Lock, FileText, Shield } from "lucide-react"
import { saveAs } from "file-saver"
import { saveGeneratedFile, generateFileId, formatFileSize } from "@/lib/file-storage"
import { useToast } from "@/hooks/use-toast"

export function EncryptScreen() {
  const router = useRouter()
  const { toast } = useToast()
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isEncrypting, setIsEncrypting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
    }
  }

  const encryptPDF = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      })
      return
    }

    if (!pdfFile) return

    setIsEncrypting(true)
    try {
      const { PDFService } = await import("@/lib/services/pdf-service")
      const blob = await PDFService.encrypt({
        file: pdfFile,
        password,
      })

      const fileName = pdfFile.name.replace(".pdf", "-encrypted.pdf")
      saveAs(blob, fileName)

      saveGeneratedFile({
        id: generateFileId(),
        name: fileName,
        type: "PDF Encriptado",
        date: new Date().toLocaleDateString(),
        size: formatFileSize(blob.size),
      })

      toast({
        title: "PDF encriptado exitosamente",
        description: "El archivo se guardó en tu dashboard",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error) {
      console.error("[v0] Error encrypting PDF:", error)
      toast({
        title: "Error",
        description: "No se pudo encriptar el PDF",
        variant: "destructive",
      })
    } finally {
      setIsEncrypting(false)
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

              <div className="p-6 bg-gradient-to-br from-destructive/10 to-primary/10 rounded-lg border-2 border-dashed border-destructive/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-destructive/20 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-destructive" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-lg">Protección con contraseña</p>
                    <p className="text-sm text-muted-foreground">El PDF será encriptado de forma segura</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa una contraseña segura"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Confirma la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={encryptPDF}
            className="w-full"
            size="lg"
            disabled={!password || !confirmPassword || isEncrypting}
          >
            <Lock className="w-4 h-4 mr-2" />
            {isEncrypting ? "Encriptando..." : "Encriptar PDF"}
          </Button>
        </>
      )}
    </div>
  )
}
