"use client"

import { QRGeneratorScreen } from "@/app/screens/qr-generator/qr-generator"
import { ToolLayout } from "@/app/components/tool-layout"

export const dynamic = "force-dynamic"

export default function QRGeneratorPage() {
  return (
    <ToolLayout title="Generador de QR" description="Crea códigos QR personalizados con tu logo o imagen en el centro">
      <QRGeneratorScreen />
    </ToolLayout>
  )
}
