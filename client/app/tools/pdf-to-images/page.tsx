"use client"

import { PDFToImagesScreen } from "@/app/screens/pdf-to-images/pdf-to-images"
import { ToolLayout } from "@/app/components/tool-layout"

export const dynamic = "force-dynamic"

export default function PDFToImagesPage() {
  return (
    <ToolLayout title="PDF a Imágenes" description="Extrae todas las páginas de un PDF como imágenes individuales">
      <PDFToImagesScreen />
    </ToolLayout>
  )
}
