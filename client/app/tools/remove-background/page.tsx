"use client"

import { RemoveBackgroundScreen } from "@/app/screens/remove-background/remove-background"
import { ToolLayout } from "@/app/components/tool-layout"

export const dynamic = "force-dynamic"

export default function RemoveBackgroundPage() {
  return (
    <ToolLayout title="Quitar Fondo" description="Elimina el fondo de tus imágenes automáticamente">
      <RemoveBackgroundScreen />
    </ToolLayout>
  )
}
