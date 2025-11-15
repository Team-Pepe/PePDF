"use client"

import { MergePDFScreen } from "@/app/screens/merge-pdf/merge-pdf"
import { ToolLayout } from "@/app/components/tool-layout"

export const dynamic = "force-dynamic"

export default function MergePDFPage() {
  return (
    <ToolLayout title="Unir PDFs" description="Combina múltiples archivos PDF en uno solo">
      <MergePDFScreen />
    </ToolLayout>
  )
}
