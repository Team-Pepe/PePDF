import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    tools: [
      { id: 1, name: 'Compress PDF', route: '/tools/compress' },
      { id: 2, name: 'Merge PDF', route: '/tools/merge-pdf' },
      { id: 3, name: 'Images to PDF', route: '/tools/images-to-pdf' },
      { id: 4, name: 'PDF to Images', route: '/tools/pdf-to-images' },
      { id: 5, name: 'PDF to Word', route: '/tools/pdf-to-word' },
      { id: 6, name: 'QR Generator', route: '/tools/qr-generator' },
      { id: 7, name: 'Remove Background', route: '/tools/remove-background' }
    ]
  })
}