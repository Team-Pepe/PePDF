export interface GeneratedFile {
  id: string
  name: string
  type: string
  date: string
  size: string
  downloadUrl?: string
  s3Key?: string
  fileId?: number // ID de la base de datos
}

export function saveGeneratedFile(file: GeneratedFile) {
  const savedFiles = localStorage.getItem("generatedFiles")
  const files: GeneratedFile[] = savedFiles ? JSON.parse(savedFiles) : []
  files.unshift(file)
  localStorage.setItem("generatedFiles", JSON.stringify(files))
}

export function getGeneratedFiles(): GeneratedFile[] {
  const savedFiles = localStorage.getItem("generatedFiles")
  return savedFiles ? JSON.parse(savedFiles) : []
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export function generateFileId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * Sube un archivo a S3 y lo guarda en la base de datos
 * @param fileData - Data URL del archivo (base64)
 * @param fileName - Nombre del archivo
 * @param fileType - MIME type del archivo
 * @param category - Categoría del archivo (qr, pdf, word, image, other)
 * @returns Información del archivo guardado
 */
export async function uploadToS3AndSave(
  fileData: string,
  fileName: string,
  fileType: string,
  category: 'qr' | 'pdf' | 'word' | 'image' | 'other' = 'other'
): Promise<GeneratedFile> {
  try {
    // Obtener userId del localStorage (del usuario logueado)
    const userStr = localStorage.getItem("user")
    if (!userStr) {
      throw new Error("Usuario no autenticado")
    }
    const user = JSON.parse(userStr)
    const userId = user.id

    // Llamar a la API para subir el archivo
    const response = await fetch("/api/files/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileName,
        fileData,
        fileType,
        userId,
        category,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || "Error al subir archivo")
    }

    const data = await response.json()
    const file = data.file

    // Crear objeto GeneratedFile
    const generatedFile: GeneratedFile = {
      id: generateFileId(),
      name: file.name,
      type: file.type,
      date: new Date(file.created_at).toLocaleDateString(),
      size: formatFileSize(file.size),
      s3Key: file.s3_key,
      fileId: file.id,
    }

    // Guardar en localStorage para acceso rápido
    saveGeneratedFile(generatedFile)

    return generatedFile
  } catch (error: any) {
    console.error("Error uploading to S3:", error)
    throw error
  }
}

/**
 * Obtiene la URL de descarga firmada para un archivo
 */
export async function getDownloadUrl(fileId: number): Promise<string> {
  try {
    const response = await fetch(`/api/files/${fileId}`)

    if (!response.ok) {
      throw new Error("Error al obtener URL de descarga")
    }

    const data = await response.json()
    return data.file.downloadUrl
  } catch (error: any) {
    console.error("Error getting download URL:", error)
    throw error
  }
}