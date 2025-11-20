import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = body

        // Validación básica
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email y contraseña son requeridos' },
                { status: 400 }
            )
        }

        // Buscar usuario con email y password (comparación directa, sin hash)
        const result = await query(
            `SELECT id, name, email, created_at, last_access 
       FROM users 
       WHERE email = $1 AND password = $2`,
            [email, password]
        )

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Credenciales inválidas' },
                { status: 401 }
            )
        }

        const user = result.rows[0]

        // Actualizar last_access
        await query(
            'UPDATE users SET last_access = NOW() WHERE id = $1',
            [user.id]
        )

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                created_at: user.created_at,
            },
        })
    } catch (error: any) {
        console.error('Error en login:', error)
        return NextResponse.json(
            { error: 'Error al iniciar sesión', details: error.message },
            { status: 500 }
        )
    }
}
