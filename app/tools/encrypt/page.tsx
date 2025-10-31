"use client"

import { EncryptScreen } from "@/app/screens/encrypt/encrypt"
import { ToolLayout } from "@/components/tool-layout"

export const dynamic = "force-dynamic"

export default function EncryptPage() {
  return (
    <ToolLayout title="Encriptar PDF" description="Protege tus documentos PDF con contraseña">
      <EncryptScreen />
    </ToolLayout>
  )
}
