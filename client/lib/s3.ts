import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Upload } from '@aws-sdk/lib-storage'

// Configuración del cliente S3
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: process.env.AWS_ACCESS_KEY_ID
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        }
        : undefined, // Si no hay credenciales, usará IAM Role de EC2
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'pepdf-files'

export interface UploadFileOptions {
    fileName: string
    fileBuffer: Buffer
    fileType: string
    userId: number
    category?: 'qr' | 'pdf' | 'word' | 'image' | 'other'
}

/**
 * Genera una key única para S3
 * Formato: user_{userId}/{category}/{timestamp}_{randomId}_{fileName}
 */
export function generateS3Key(
    userId: number,
    fileName: string,
    category: string = 'other'
): string {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 9)
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    return `user_${userId}/${category}/${timestamp}_${randomId}_${sanitizedFileName}`
}

/**
 * Sube un archivo a S3
 */
export async function uploadFileToS3(options: UploadFileOptions): Promise<string> {
    const { fileName, fileBuffer, fileType, userId, category = 'other' } = options

    const s3Key = generateS3Key(userId, fileName, category)

    try {
        // Para archivos pequeños (< 5MB), usar PutObjectCommand
        if (fileBuffer.length < 5 * 1024 * 1024) {
            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Body: fileBuffer,
                ContentType: fileType,
                ServerSideEncryption: 'AES256',
            })

            await s3Client.send(command)
        } else {
            // Para archivos grandes, usar multipart upload
            const upload = new Upload({
                client: s3Client,
                params: {
                    Bucket: BUCKET_NAME,
                    Key: s3Key,
                    Body: fileBuffer,
                    ContentType: fileType,
                    ServerSideEncryption: 'AES256',
                },
            })

            await upload.done()
        }

        console.log(`File uploaded successfully to S3: ${s3Key}`)
        return s3Key
    } catch (error) {
        console.error('Error uploading file to S3:', error)
        throw new Error('Failed to upload file to S3')
    }
}

/**
 * Genera una URL firmada para descargar un archivo de S3
 * La URL expira en 15 minutos
 */
export async function getSignedDownloadUrl(s3Key: string): Promise<string> {
    try {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
        })

        const url = await getSignedUrl(s3Client, command, { expiresIn: 900 }) // 15 minutos
        return url
    } catch (error) {
        console.error('Error generating signed URL:', error)
        throw new Error('Failed to generate download URL')
    }
}

/**
 * Convierte un data URL (base64) a Buffer
 */
export function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
        throw new Error('Invalid data URL format')
    }

    const mimeType = matches[1]
    const base64Data = matches[2]
    const buffer = Buffer.from(base64Data, 'base64')

    return { buffer, mimeType }
}

/**
 * Convierte un Blob a Buffer (para uso en Node.js/API Routes)
 */
export async function blobToBuffer(blob: Blob): Promise<Buffer> {
    const arrayBuffer = await blob.arrayBuffer()
    return Buffer.from(arrayBuffer)
}
