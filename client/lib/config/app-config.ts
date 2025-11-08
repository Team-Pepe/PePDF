/**
 * Configuración centralizada de la aplicación
 */

export const APP_CONFIG = {
  // Configuración de PDF.js
  PDF: {
    WORKER_SRC: '/pdf.worker.min.js',
    MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
    SUPPORTED_FORMATS: ['application/pdf'],
    FALLBACK_WORKERS: [
      '/pdf.worker.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js'
    ]
  },

  // Configuración de compresión
  COMPRESSION: {
    IMAGE: {
      MAX_SIZE_MB: 10,
      DEFAULT_QUALITY: 0.8,
      SUPPORTED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
      OUTPUT_FORMAT: 'image/jpeg'
    },
    PDF: {
      DEFAULT_QUALITY: 1.2,
      MIN_QUALITY: 0.1,
      MAX_QUALITY: 2.0
    },
    ZIP: {
      COMPRESSION_LEVEL: 6,
      MAX_FILES: 100
    }
  },

  // Configuración de encriptación
  ENCRYPTION: {
    ALGORITHM: 'AES-GCM',
    KEY_LENGTH: 256,
    IV_LENGTH: 12,
    TAG_LENGTH: 16,
    PASSWORD: {
      MIN_LENGTH: 8,
      REQUIRE_UPPERCASE: true,
      REQUIRE_LOWERCASE: true,
      REQUIRE_NUMBERS: true,
      REQUIRE_SYMBOLS: false
    }
  },

  // Configuración de archivos
  FILES: {
    MAX_UPLOAD_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_BATCH_SIZE: 20,
    ALLOWED_EXTENSIONS: [
      '.pdf', '.doc', '.docx', '.txt', '.rtf',
      '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp',
      '.zip', '.rar', '.7z'
    ],
    TEMP_CLEANUP_INTERVAL: 5 * 60 * 1000 // 5 minutos
  },

  // Configuración de UI
  UI: {
    TOAST_DURATION: 5000,
    PROGRESS_UPDATE_INTERVAL: 100,
    DEBOUNCE_DELAY: 300,
    ANIMATION_DURATION: 200
  },

  // Configuración de almacenamiento
  STORAGE: {
    LOCAL_STORAGE_PREFIX: 'toolsapp_',
    MAX_HISTORY_ITEMS: 50,
    CLEANUP_INTERVAL: 24 * 60 * 60 * 1000 // 24 horas
  },

  // URLs y endpoints
  URLS: {
    DASHBOARD: '/dashboard',
    HELP: '/help',
    PRIVACY: '/privacy',
    TERMS: '/terms'
  }
} as const

// Tipos derivados de la configuración
export type AppConfig = typeof APP_CONFIG
export type PDFConfig = typeof APP_CONFIG.PDF
export type CompressionConfig = typeof APP_CONFIG.COMPRESSION
export type EncryptionConfig = typeof APP_CONFIG.ENCRYPTION

// Utilidades de configuración
export const getMaxFileSize = (type: 'pdf' | 'image' | 'general' = 'general') => {
  switch (type) {
    case 'pdf':
      return APP_CONFIG.PDF.MAX_FILE_SIZE
    case 'image':
      return APP_CONFIG.COMPRESSION.IMAGE.MAX_SIZE_MB * 1024 * 1024
    default:
      return APP_CONFIG.FILES.MAX_UPLOAD_SIZE
  }
}

export const isFileTypeSupported = (mimeType: string, category: 'pdf' | 'image' | 'general' = 'general') => {
  switch (category) {
    case 'pdf':
      return APP_CONFIG.PDF.SUPPORTED_FORMATS.includes(mimeType as any)
    case 'image':
      return APP_CONFIG.COMPRESSION.IMAGE.SUPPORTED_FORMATS.includes(mimeType as any)
    default:
      return true // Para archivos generales, permitimos todo por ahora
  }
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}