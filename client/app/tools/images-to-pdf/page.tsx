"use client"

import { ImagesToPDFScreen } from "@/app/screens/images-to-pdf/images-to-pdf"
import { ToolLayout } from "@/components/tool-layout"

export const dynamic = "force-dynamic"

export default function ImagesToPDFPage() {
  return (
    <ToolLayout title="Imágenes a PDF" description="Convierte múltiples imágenes en un solo archivo PDF">
      <ImagesToPDFScreen />
    </ToolLayout>
  )
}
