// Utility functions for managing generated files in localStorage

export interface GeneratedFile {
  id: string
  name: string
  type: string
  date: string
  size: string
  downloadUrl?: string
}

export function saveGeneratedFile(file: GeneratedFile) {
  const savedFiles = localStorage.getItem("generatedFiles")
  const files: GeneratedFile[] = savedFiles ? JSON.parse(savedFiles) : []
  files.unshift(file) // Add to beginning
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
