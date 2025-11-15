import imageCompression from "browser-image-compression"
import { PDFDocument } from "pdf-lib"
import JSZip from "jszip"

declare module "pdf-compressor" {
  interface CompressionOptions {
    quality?: number
    level?: 'low' | 'medium' | 'high'
  }
  class PDFCompressor {
    compress(buffer: ArrayBuffer, options?: CompressionOptions): Promise<ArrayBuffer>
  }
  const pdfCompressor: PDFCompressor
}

import * as pdfCompressorModule from "pdf-compressor"

export interface CompressionOptions {
  quality?: number
  maxSizeMB?: number
  maxWidthOrHeight?: number
  pdfCompressionLevel?: 'low' | 'medium' | 'high'
}

export interface CompressionResult {
  blob: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

export class CompressionService {
  static async compressImage(
    file: File, 
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const {
      quality = 80,
      maxSizeMB = 2,
      maxWidthOrHeight = 1920
    } = options

    try {
      const compressionOptions = {
        maxSizeMB: (quality / 100) * maxSizeMB,
        maxWidthOrHeight,
        useWebWorker: true,
        fileType: file.type as any,
      }

      const compressedFile = await imageCompression(file, compressionOptions)
      
      return {
        blob: compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        compressionRatio: ((file.size - compressedFile.size) / file.size) * 100
      }
    } catch (error) {
      console.error('Error compressing image:', error)
      throw new Error('Failed to compress image')
    }
  }

  static async compressPDF(
    file: File, 
    options: CompressionOptions = {}
  ): Promise<CompressionResult> {
    const { 
      quality = 70,
      pdfCompressionLevel = 'medium'
    } = options

    try {
      const arrayBuffer = await file.arrayBuffer()
      
      try {
        const compressedBuffer = await (pdfCompressorModule as any).compress(arrayBuffer, {
          quality: quality / 100,
          level: pdfCompressionLevel
        })
        
        const blob = new Blob([compressedBuffer], { type: "application/pdf" })
        
        return {
          blob,
          originalSize: file.size,
          compressedSize: blob.size,
          compressionRatio: ((file.size - blob.size) / file.size) * 100
        }
      } catch (compressorError) {
        console.warn('pdf-compressor failed, falling back to pdf-lib:', compressorError)
        
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const compressedPdfBytes = await pdfDoc.save({
          useObjectStreams: true,
          addDefaultPage: false,
          objectsPerTick: 50,
          updateFieldAppearances: false,
        })

        const blob = new Blob([new Uint8Array(compressedPdfBytes)], { type: "application/pdf" })
        
        return {
          blob,
          originalSize: file.size,
          compressedSize: blob.size,
          compressionRatio: ((file.size - blob.size) / file.size) * 100
        }
      }
    } catch (error) {
      console.error('Error compressing PDF:', error)
      throw new Error('Failed to compress PDF')
    }
  }

  static async compressToZip(
    files: File[], 
    zipName: string = 'compressed-files.zip'
  ): Promise<Blob> {
    try {
      const zip = new JSZip()
      
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const compressed = await this.compressImage(file, { quality: 70 })
          const fileName = file.name.replace(/\.(jpg|jpeg|png|webp)$/i, '-compressed.$1')
          zip.file(fileName, compressed.blob)
        } else if (file.type === 'application/pdf') {
          const compressed = await this.compressPDF(file)
          const fileName = file.name.replace('.pdf', '-compressed.pdf')
          zip.file(fileName, compressed.blob)
        } else {
          zip.file(file.name, file)
        }
      }

      return await zip.generateAsync({ type: 'blob' })
    } catch (error) {
      console.error('Error creating ZIP:', error)
      throw new Error('Failed to create compressed ZIP file')
    }
  }

  static isCompressible(file: File): boolean {
    return file.type.startsWith('image/') || file.type === 'application/pdf'
  }

  static getEstimatedCompression(file: File, quality: number): number {
    if (file.type.startsWith('image/')) {
      return Math.max(10, 100 - quality)
    } else if (file.type === 'application/pdf') {
      return 20
    }
    return 0
  }
}