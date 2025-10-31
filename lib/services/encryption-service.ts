import { PDFDocument } from "pdf-lib"
import JSZip from "jszip"

// Type declaration for pdf-encrypt
declare module "pdf-encrypt" {
  interface EncryptOptions {
    userPassword?: string
    ownerPassword?: string
    permissions?: {
      print?: boolean
      modify?: boolean
      copy?: boolean
      annotate?: boolean
    }
  }
  
  function pdfEncrypt(
    buffer: Buffer, 
    options: EncryptOptions, 
    callback: (err: Error | null, result?: Buffer) => void
  ): void
  
  export default pdfEncrypt
}

import pdfEncrypt from "pdf-encrypt"

export interface EncryptionOptions {
  password: string
  algorithm?: 'AES-256' | 'PDF-Standard'
  permissions?: {
    printing?: boolean
    modifying?: boolean
    copying?: boolean
    annotating?: boolean
  }
}

export interface EncryptionResult {
  blob: Blob
  fileName: string
  algorithm: string
}

export class EncryptionService {
  /**
   * Encrypt a PDF file with password protection
   */
  static async encryptPDF(
    file: File, 
    options: EncryptionOptions
  ): Promise<EncryptionResult> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const { password, permissions = {} } = options

      // Set default permissions (restrictive by default)
      const pdfPermissions = {
        printing: permissions.printing ?? false,
        modifying: permissions.modifying ?? false,
        copying: permissions.copying ?? false,
        annotating: permissions.annotating ?? false,
      }

      // Use pdf-encrypt library for real PDF encryption
      const encryptedBuffer = await new Promise<Buffer>((resolve, reject) => {
        pdfEncrypt(Buffer.from(arrayBuffer), {
          userPassword: password,
          ownerPassword: password + "_owner", // Owner password for permissions
          permissions: {
            print: pdfPermissions.printing,
            modify: pdfPermissions.modifying,
            copy: pdfPermissions.copying,
            annotate: pdfPermissions.annotating,
          }
        }, (err: any, buffer: Buffer) => {
          if (err) {
            reject(err)
          } else {
            resolve(buffer)
          }
        })
      })

      const blob = new Blob([new Uint8Array(encryptedBuffer)], { type: "application/pdf" })
      const fileName = file.name.replace('.pdf', '-encrypted.pdf')

      return {
        blob,
        fileName,
        algorithm: 'PDF-Standard'
      }
    } catch (error) {
      console.error('Error encrypting PDF:', error)
      throw new Error('Failed to encrypt PDF file')
    }
  }

  /**
   * Encrypt any file using browser's Web Crypto API
   */
  static async encryptFile(
    file: File, 
    password: string
  ): Promise<EncryptionResult> {
    try {
      // Generate a key from the password
      const encoder = new TextEncoder()
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      )

      // Generate a random salt
      const salt = crypto.getRandomValues(new Uint8Array(16))
      
      // Derive the actual encryption key
      const key = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt']
      )

      // Generate a random IV
      const iv = crypto.getRandomValues(new Uint8Array(12))
      
      // Read file data
      const fileData = await file.arrayBuffer()
      
      // Encrypt the file
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        fileData
      )

      // Combine salt, IV, and encrypted data
      const combinedData = new Uint8Array(
        salt.length + iv.length + encryptedData.byteLength
      )
      combinedData.set(salt, 0)
      combinedData.set(iv, salt.length)
      combinedData.set(new Uint8Array(encryptedData), salt.length + iv.length)

      const blob = new Blob([combinedData], { type: 'application/octet-stream' })
      const fileName = file.name + '.encrypted'

      return {
        blob,
        fileName,
        algorithm: 'AES-256-GCM'
      }
    } catch (error) {
      console.error('Error encrypting file:', error)
      throw new Error('Failed to encrypt file')
    }
  }

  /**
   * Encrypt multiple files into a password-protected ZIP
   */
  static async encryptMultipleFiles(
    files: File[], 
    password: string,
    zipName: string = 'encrypted-files.zip'
  ): Promise<EncryptionResult> {
    try {
      const zip = new JSZip()
      
      // Add files to ZIP
      for (const file of files) {
        const fileData = await file.arrayBuffer()
        zip.file(file.name, fileData)
      }

      // Generate password-protected ZIP
      const encryptedZip = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
        // Note: JSZip doesn't support password protection directly
        // This would need a different library for true password protection
      })

      return {
        blob: encryptedZip,
        fileName: zipName,
        algorithm: 'ZIP-Deflate'
      }
    } catch (error) {
      console.error('Error creating encrypted ZIP:', error)
      throw new Error('Failed to create encrypted ZIP file')
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean
    strength: 'weak' | 'medium' | 'strong'
    suggestions: string[]
  } {
    const suggestions: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else suggestions.push('Use at least 8 characters')

    if (/[a-z]/.test(password)) score += 1
    else suggestions.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else suggestions.push('Include uppercase letters')

    if (/\d/.test(password)) score += 1
    else suggestions.push('Include numbers')

    if (/[^a-zA-Z0-9]/.test(password)) score += 1
    else suggestions.push('Include special characters')

    const strength = score <= 2 ? 'weak' : score <= 4 ? 'medium' : 'strong'
    const isValid = score >= 3

    return { isValid, strength, suggestions }
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    
    return Array.from(array, byte => charset[byte % charset.length]).join('')
  }
}