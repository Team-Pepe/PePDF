import { APP_CONFIG } from '@/lib/config/app-config'

/**
 * Utilidades para manejo de archivos
 */

export interface FileValidationResult {
  isValid: boolean
  error?: string
  warnings?: string[]
}

export interface FileInfo {
  name: string
  size: number
  type: string
  extension: string
  lastModified: number
}

/**
 * Valida un archivo según las reglas de la aplicación
 */
export const validateFile = (
  file: File, 
  options: {
    maxSize?: number
    allowedTypes?: string[]
    category?: 'pdf' | 'image' | 'general'
  } = {}
): FileValidationResult => {
  const { maxSize, allowedTypes, category = 'general' } = options
  const warnings: string[] = []

  // Validar tamaño
  const maxFileSize = maxSize || getMaxFileSizeForCategory(category)
  if (file.size > maxFileSize) {
    return {
      isValid: false,
      error: `El archivo es demasiado grande. Máximo permitido: ${formatBytes(maxFileSize)}`
    }
  }

  // Validar tipo
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipo de archivo no soportado: ${file.type}`
    }
  }

  // Validar extensión
  const extension = getFileExtension(file.name)
  if (!APP_CONFIG.FILES.ALLOWED_EXTENSIONS.includes(extension as any)) {
    warnings.push(`La extensión ${extension} podría no ser completamente soportada`)
  }

  // Advertencias adicionales
  if (file.size > 10 * 1024 * 1024) { // 10MB
    warnings.push('Archivo grande, el procesamiento podría tomar más tiempo')
  }

  return {
    isValid: true,
    warnings: warnings.length > 0 ? warnings : undefined
  }
}

/**
 * Valida múltiples archivos
 */
export const validateFiles = (
  files: File[], 
  options: Parameters<typeof validateFile>[1] = {}
): { valid: File[], invalid: Array<{ file: File, error: string }>, warnings: string[] } => {
  const valid: File[] = []
  const invalid: Array<{ file: File, error: string }> = []
  const allWarnings: string[] = []

  // Validar cantidad
  if (files.length > APP_CONFIG.FILES.MAX_BATCH_SIZE) {
    invalid.push({
      file: files[0],
      error: `Demasiados archivos. Máximo permitido: ${APP_CONFIG.FILES.MAX_BATCH_SIZE}`
    })
    return { valid, invalid, warnings: allWarnings }
  }

  files.forEach(file => {
    const result = validateFile(file, options)
    if (result.isValid) {
      valid.push(file)
      if (result.warnings) {
        allWarnings.push(...result.warnings)
      }
    } else {
      invalid.push({ file, error: result.error || 'Error desconocido' })
    }
  })

  return { valid, invalid, warnings: [...new Set(allWarnings)] }
}

/**
 * Obtiene información detallada de un archivo
 */
export const getFileInfo = (file: File): FileInfo => ({
  name: file.name,
  size: file.size,
  type: file.type,
  extension: getFileExtension(file.name),
  lastModified: file.lastModified
})

/**
 * Obtiene la extensión de un archivo
 */
export const getFileExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.')
  return lastDot !== -1 ? fileName.substring(lastDot).toLowerCase() : ''
}

/**
 * Genera un nombre de archivo único
 */
export const generateUniqueFileName = (originalName: string, suffix?: string): string => {
  const extension = getFileExtension(originalName)
  const baseName = originalName.substring(0, originalName.lastIndexOf('.'))
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  
  const uniqueSuffix = suffix || `${timestamp}-${random}`
  return `${baseName}-${uniqueSuffix}${extension}`
}

/**
 * Convierte bytes a formato legible
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Obtiene el tamaño máximo de archivo para una categoría
 */
const getMaxFileSizeForCategory = (category: 'pdf' | 'image' | 'general'): number => {
  switch (category) {
    case 'pdf':
      return APP_CONFIG.PDF.MAX_FILE_SIZE
    case 'image':
      return APP_CONFIG.COMPRESSION.IMAGE.MAX_SIZE_MB * 1024 * 1024
    default:
      return APP_CONFIG.FILES.MAX_UPLOAD_SIZE
  }
}

/**
 * Convierte un archivo a ArrayBuffer
 */
export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('Error reading file'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Convierte un archivo a texto
 */
export const fileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Error reading file as text'))
    reader.readAsText(file)
  })
}

/**
 * Crea un archivo Blob desde datos
 */
export const createFileBlob = (data: any, type: string): Blob => {
  return new Blob([data], { type })
}

/**
 * Descarga un archivo
 */
export const downloadFile = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Limpia URLs de objeto creadas
 */
export const cleanupObjectURL = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Verifica si un archivo es una imagen
 */
export const isImageFile = (file: File): boolean => {
  return file.type.startsWith('image/')
}

/**
 * Verifica si un archivo es un PDF
 */
export const isPDFFile = (file: File): boolean => {
  return file.type === 'application/pdf'
}

/**
 * Verifica si un archivo es comprimible
 */
export const isCompressibleFile = (file: File): boolean => {
  return isImageFile(file) || isPDFFile(file)
}