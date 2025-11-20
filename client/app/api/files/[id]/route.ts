import { NextRequest, NextResponse } from 'next/server'
import { getSignedDownloadUrl } from '@/lib/s3'
import { query } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = params.id

        // Obtener información del archivo de la base de datos
        const result = await query(
            'SELECT id, user_id, name, type, size, s3_key, status, created_at FROM files WHERE id = $1',
            [fileId]
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Archivo no encontrado' },
                { status: 404 }
            )
        }

        const file = result.rows[0]

        // Generar URL firmada para descarga
        const downloadUrl = await getSignedDownloadUrl(file.s3_key)

        return NextResponse.json({
            success: true,
            file: {
                id: file.id,
                name: file.name,
                type: file.type,
                size: file.size,
                status: file.status,
                created_at: file.created_at,
                downloadUrl,
            },
        })
    } catch (error: any) {
        console.error('Error al obtener archivo:', error)
        return NextResponse.json(
            { error: 'Error al obtener archivo', details: error.message },
            { status: 500 }
        )
    }
}

// DELETE para eliminar archivo
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = params.id

        // Obtener archivo para verificar que existe
        const result = await query(
            'SELECT s3_key FROM files WHERE id = $1',
            [fileId]
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Archivo no encontrado' },
                { status: 404 }
            )
        }

        // TODO: Eliminar de S3 (opcional, puedes implementar lifecycle policies en S3)
        // const s3Key = result.rows[0].s3_key
        // await deleteFileFromS3(s3Key)

        // Eliminar de base de datos
        await query('DELETE FROM files WHERE id = $1', [fileId])

        return NextResponse.json({
            success: true,
            message: 'Archivo eliminado correctamente',
        })
    } catch (error: any) {
        console.error('Error al eliminar archivo:', error)
        return NextResponse.json(
            { error: 'Error al eliminar archivo', details: error.message },
            { status: 500 }
        )
    }
}
