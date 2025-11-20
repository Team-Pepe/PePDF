import { NextRequest, NextResponse } from 'next/server'
import { uploadFileToS3, dataUrlToBuffer } from '@/lib/s3'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { fileName, fileData, fileType, userId, category } = body

        // Validación básica
        if (!fileName || !fileData || !fileType || !userId) {
            return NextResponse.json(
                { error: 'fileName, fileData, fileType y userId son requeridos' },
                { status: 400 }
            )
        }

        // Validar tipo de archivo
        const allowedTypes = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/webp',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]

        if (!allowedTypes.includes(fileType)) {
            return NextResponse.json(
                { error: 'Tipo de archivo no permitido' },
                { status: 400 }
            )
        }

        // Convertir data URL a Buffer
        const { buffer, mimeType } = dataUrlToBuffer(fileData)

        // Validar tamaño (máximo 50MB)
        const maxSize = 50 * 1024 * 1024 // 50MB
        if (buffer.length > maxSize) {
            return NextResponse.json(
                { error: 'El archivo excede el tamaño máximo de 50MB' },
                { status: 400 }
            )
        }

        // Subir a S3
        const s3Key = await uploadFileToS3({
            fileName,
            fileBuffer: buffer,
            fileType: mimeType,
            userId,
            category: category || 'other',
        })

        // Guardar en base de datos
        const result = await query(
            `INSERT INTO files (user_id, name, type, size, s3_key, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING id, user_id, name, type, size, s3_key, status, created_at`,
            [userId, fileName, fileType, buffer.length, s3Key, 'uploaded']
        )

        const file = result.rows[0]

        return NextResponse.json(
            {
                success: true,
                file: {
                    id: file.id,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    s3_key: file.s3_key,
                    status: file.status,
                    created_at: file.created_at,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error en upload de archivo:', error)
        return NextResponse.json(
            { error: 'Error al subir archivo', details: error.message },
            { status: 500 }
        )
    }
}

// GET para listar archivos del usuario
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { error: 'userId es requerido' },
                { status: 400 }
            )
        }

        const result = await query(
            `SELECT id, user_id, name, type, size, s3_key, status, created_at 
       FROM files 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 100`,
            [userId]
        )

        return NextResponse.json({
            success: true,
            files: result.rows,
        })
    } catch (error: any) {
        console.error('Error al obtener archivos:', error)
        return NextResponse.json(
            { error: 'Error al obtener archivos', details: error.message },
            { status: 500 }
        )
    }
}
