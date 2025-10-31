"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  QrCode,
  FileImage,
  FileText,
  ImageIcon,
  Archive,
  Lock,
  FilePlus,
  Download,
  Trash2,
  LogOut,
  User,
  Scissors,
} from "lucide-react"

interface GeneratedFile {
  id: string
  name: string
  type: string
  date: string
  size: string
  downloadUrl?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string; name?: string } | null>(null)
  const [files, setFiles] = useState<GeneratedFile[]>([])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))

    // Load generated files from localStorage
    const savedFiles = localStorage.getItem("generatedFiles")
    if (savedFiles) {
      setFiles(JSON.parse(savedFiles))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  const handleDeleteFile = (id: string) => {
    const updatedFiles = files.filter((file) => file.id !== id)
    setFiles(updatedFiles)
    localStorage.setItem("generatedFiles", JSON.stringify(updatedFiles))
  }

  const tools = [
    { title: "Generador de QR", icon: QrCode, href: "/tools/qr-generator", color: "text-primary" },
    { title: "Imágenes a PDF", icon: FileImage, href: "/tools/images-to-pdf", color: "text-secondary" },
    { title: "PDF a Imágenes", icon: ImageIcon, href: "/tools/pdf-to-images", color: "text-muted-foreground" },
    { title: "PDF a Word", icon: FileText, href: "/tools/pdf-to-word", color: "text-accent" },
    { title: "Quitar Fondo", icon: Scissors, href: "/tools/remove-background", color: "text-chart-5" },
    { title: "Comprimir", icon: Archive, href: "/tools/compress", color: "text-primary" },
    { title: "Encriptar PDF", icon: Lock, href: "/tools/encrypt", color: "text-secondary" },
    { title: "Unir PDFs", icon: FilePlus, href: "/tools/merge-pdf", color: "text-muted-foreground" },
  ]

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">ToolBox</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{user.name || user.email}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Bienvenido, {user.name || "Usuario"}</h2>
          <p className="text-muted-foreground">Gestiona tus archivos y accede a todas tus herramientas</p>
        </div>

        {/* Quick Access Tools */}
        <section className="mb-12">
          <h3 className="text-xl font-semibold text-foreground mb-4">Herramientas Rápidas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {tools.map((tool) => {
              const Icon = tool.icon
              return (
                <Link key={tool.href} href={tool.href}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer group hover:scale-105">
                    <CardHeader className="p-4 text-center">
                      <div
                        className={`w-10 h-10 mx-auto rounded-lg bg-secondary/20 flex items-center justify-center mb-2 ${tool.color}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <CardTitle className="text-xs leading-tight">{tool.title}</CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Generated Files */}
        <section>
          <h3 className="text-xl font-semibold text-foreground mb-4">Archivos Generados</h3>
          {files.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileImage className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Aún no has generado ningún archivo</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Usa las herramientas de arriba para comenzar a crear archivos
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <Card key={file.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base mb-1">{file.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {file.type} • {file.size}
                        </CardDescription>
                        <p className="text-xs text-muted-foreground mt-1">{file.date}</p>
                      </div>
                      <div className="flex gap-2">
                        {file.downloadUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={file.downloadUrl} download>
                              <Download className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFile(file.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
