import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QrCode, FileImage, FileText, ImageIcon, Scissors, Archive, Lock, FilePlus } from "lucide-react"

export default function HomePage() {
  const tools = [
    {
      title: "Generador de QR",
      description: "Crea códigos QR personalizados con tu logo o imagen",
      icon: QrCode,
      href: "/tools/qr-generator",
      color: "text-accent",
    },
    {
      title: "Imágenes a PDF",
      description: "Convierte múltiples imágenes en un solo archivo PDF",
      icon: FileImage,
      href: "/tools/images-to-pdf",
      color: "text-chart-2",
    },
    {
      title: "PDF a Imágenes",
      description: "Extrae todas las páginas de un PDF como imágenes",
      icon: ImageIcon,
      href: "/tools/pdf-to-images",
      color: "text-chart-3",
    },
    {
      title: "PDF a Word",
      description: "Convierte documentos PDF a formato Word editable",
      icon: FileText,
      href: "/tools/pdf-to-word",
      color: "text-chart-4",
    },
    {
      title: "Quitar Fondo",
      description: "Elimina el fondo de tus imágenes automáticamente",
      icon: Scissors,
      href: "/tools/remove-background",
      color: "text-chart-5",
    },
    {
      title: "Comprimir Archivos",
      description: "Reduce el tamaño de imágenes y PDFs sin perder calidad",
      icon: Archive,
      href: "/tools/compress",
      color: "text-primary",
    },
    {
      title: "Encriptar PDF",
      description: "Protege tus documentos con contraseña",
      icon: Lock,
      href: "/tools/encrypt",
      color: "text-destructive",
    },
    {
      title: "Unir PDFs",
      description: "Combina múltiples archivos PDF en uno solo",
      icon: FilePlus,
      href: "/tools/merge-pdf",
      color: "text-accent",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">ToolBox</h1>
          </div>
          <Link href="/login">
            <Button variant="outline">Iniciar Sesión</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
          Herramientas Rápidas para tu Día a Día
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 text-pretty">
          Convierte, edita y optimiza tus archivos de forma rápida y sencilla. Todas las herramientas que necesitas en
          un solo lugar.
        </p>
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${tool.color}`}
                    >
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">{tool.title}</CardTitle>
                    <CardDescription className="text-sm">{tool.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
          <p>© 2025 ToolBox. Todas las herramientas funcionan en tu navegador.</p>
        </div>
      </footer>
    </div>
  )
}
