"use client"

import { PDFToWordScreen } from "@/app/screens/pdf-to-word/pdf-to-word"
import { ToolLayout } from "@/app/components/tool-layout"

export const dynamic = "force-dynamic"

export default function PDFToWordPage() {
  return (
    <ToolLayout title="PDF a Word" description="Convierte documentos PDF a formato Word editable">
      <PDFToWordScreen />
    </ToolLayout>
  )
}
