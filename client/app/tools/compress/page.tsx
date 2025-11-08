"use client"

import { CompressScreen } from "@/app/screens/compress/compress"
import { ToolLayout } from "@/components/tool-layout"

export const dynamic = "force-dynamic"

export default function CompressPage() {
  return (
    <ToolLayout title="Comprimir Archivos" description="Reduce el tamaño de imágenes y PDFs manteniendo la calidad">
      <CompressScreen />
    </ToolLayout>
  )
}
