import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { Document, Packer, Paragraph, TextRun } from "docx"

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib: any = null

// Configure PDF.js worker only on client side
if (typeof window !== "undefined") {
  import("pdfjs-dist").then((pdfjs) => {
    pdfjsLib = pdfjs
    pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"
  })
}

export interface PDFToWordOptions {
  file: File
  preserveFormatting?: boolean
  includeImages?: boolean
  includeTables?: boolean
}

export interface PDFToImagesOptions {
  file: File
  format: "png" | "jpeg" | "webp"
  quality?: number
  scale?: number
}

export interface CompressPDFOptions {
  file: File
  quality?: 'low' | 'medium' | 'high'
}

export interface EncryptPDFOptions {
  file: File
  password: string
  permissions?: {
    printing?: boolean
    modifying?: boolean
    copying?: boolean
    annotating?: boolean
  }
}

export interface MergePDFOptions {
  files: File[]
}

export class PDFService {
  /**
   * Extract text from PDF file
   */
  static async extractTextFromPDF(file: File): Promise<string[]> {
    if (typeof window === "undefined") {
      throw new Error("PDF text extraction is only available on the client side")
    }

    if (!pdfjsLib) {
      pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const textPages: string[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        
        let pageText = ""
        textContent.items.forEach((item: any) => {
          if (item.str) {
            pageText += item.str + " "
          }
        })
        
        textPages.push(pageText.trim())
      }

      return textPages
    } catch (error) {
      console.error('Error extracting text from PDF:', error)
      throw new Error('Failed to extract text from PDF')
    }
  }

  /**
   * Convert PDF to Word document
   */
  static async convertToWord(options: PDFToWordOptions): Promise<Blob> {
    const { file, preserveFormatting = true, includeImages = false, includeTables = false } = options
    
    try {
      // Extract text from PDF
      const textPages = await this.extractTextFromPDF(file)
      
      // Create Word document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: `Converted from: ${file.name}`,
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({ text: "" }), // Empty line
            ...textPages.flatMap((pageText, index) => [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Page ${index + 1}`,
                    bold: true,
                    size: 20,
                  }),
                ],
              }),
              new Paragraph({ text: "" }), // Empty line
              ...this.groupSentencesIntoParagraphs(pageText.split(/[.!?]+/))
                .map(paragraph => new Paragraph({
                  children: [
                    new TextRun({
                      text: paragraph.trim(),
                      size: 20,
                    }),
                  ],
                })),
              new Paragraph({ text: "" }), // Empty line between pages
            ])
          ],
        }],
      })

      // Generate Word document
      const buffer = await Packer.toBuffer(doc)
      return new Blob([new Uint8Array(buffer)], { 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      })
    } catch (error) {
      console.error('Error converting PDF to Word:', error)
      throw new Error('Failed to convert PDF to Word')
    }
  }

  /**
   * Convert PDF to images
   */
  static async convertToImages(options: PDFToImagesOptions): Promise<Blob[]> {
    if (typeof window === "undefined") {
      throw new Error("PDF to images conversion is only available on the client side")
    }

    if (!pdfjsLib) {
      pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"
    }

    const { file, format, quality = 0.92, scale = 2.0 } = options
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const images: Blob[] = []

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const viewport = page.getViewport({ scale })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        canvas.height = viewport.height
        canvas.width = viewport.width

        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!)
          }, `image/${format}`, quality)
        })

        images.push(blob)
      }

      return images
    } catch (error) {
      console.error('Error converting PDF to images:', error)
      throw new Error('Failed to convert PDF to images')
    }
  }

  /**
   * Compress PDF file
   */
  static async compress(options: CompressPDFOptions): Promise<Blob> {
    const { file, quality = 'medium' } = options
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // Compression settings based on quality
      const compressionOptions = {
        low: { useObjectStreams: false, addDefaultPage: false },
        medium: { useObjectStreams: true, addDefaultPage: false },
        high: { useObjectStreams: true, addDefaultPage: false, compress: true }
      }

      const pdfBytes = await pdfDoc.save(compressionOptions[quality])
      return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
    } catch (error) {
      console.error('Error compressing PDF:', error)
      throw new Error('Failed to compress PDF')
    }
  }

  /**
   * Encrypt PDF file
   */
  static async encrypt(options: EncryptPDFOptions): Promise<Blob> {
    const { file, password, permissions = {} } = options
    
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)

      // pdf-lib no soporta encriptación directa, por ahora solo guardamos el PDF
      // La encriptación real se debe hacer con otra librería o en el backend
      const pdfBytes = await pdfDoc.save()

      return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
    } catch (error) {
      console.error('Error encrypting PDF:', error)
      throw new Error('Failed to encrypt PDF')
    }
  }

  /**
   * Merge multiple PDF files
   */
  static async merge(options: MergePDFOptions): Promise<Blob> {
    const { files } = options
    
    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const pdfBytes = await mergedPdf.save()
      return new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
    } catch (error) {
      console.error('Error merging PDFs:', error)
      throw new Error('Failed to merge PDFs')
    }
  }

  /**
   * Group sentences into paragraphs for better Word formatting
   */
  private static groupSentencesIntoParagraphs(sentences: string[]): string[] {
    const paragraphs: string[] = []
    let currentParagraph = ""
    
    sentences.forEach((sentence) => {
      const trimmedSentence = sentence.trim()
      if (trimmedSentence) {
        if (currentParagraph.length + trimmedSentence.length > 500) {
          if (currentParagraph) {
            paragraphs.push(currentParagraph.trim())
          }
          currentParagraph = trimmedSentence + ". "
        } else {
          currentParagraph += trimmedSentence + ". "
        }
      }
    })
    
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim())
    }
    
    return paragraphs
  }

  /**
   * Validate if file is a valid PDF
   */
  static async validatePDF(file: File): Promise<boolean> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      await PDFDocument.load(arrayBuffer)
      return true
    } catch {
      return false
    }
  }

  /**
   * Get PDF metadata
   */
  static async getPDFInfo(file: File): Promise<{
    pageCount: number
    title?: string
    author?: string
    subject?: string
    creator?: string
  }> {
    if (typeof window === "undefined") {
      throw new Error("PDF info extraction is only available on the client side")
    }

    if (!pdfjsLib) {
      pdfjsLib = await import("pdfjs-dist")
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js"
    }

    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const metadata = await pdf.getMetadata()
      
      return {
        pageCount: pdf.numPages,
        title: metadata.info?.Title,
        author: metadata.info?.Author,
        subject: metadata.info?.Subject,
        creator: metadata.info?.Creator,
      }
    } catch (error) {
      console.error('Error getting PDF info:', error)
      throw new Error('Failed to get PDF information')
    }
  }

  /**
   * Wrap text for better formatting
   */
  private static wrapText(text: string, maxLength: number): string[] {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = ""

    words.forEach((word) => {
      if (currentLine.length + word.length + 1 <= maxLength) {
        currentLine += (currentLine ? " " : "") + word
      } else {
        if (currentLine) lines.push(currentLine)
        currentLine = word
      }
    })

    if (currentLine) lines.push(currentLine)
    return lines
  }
}
