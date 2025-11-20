import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { name, email, password } = body

        // Validación básica
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            )
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Email inválido' },
                { status: 400 }
            )
        }

        // Verificar si el email ya existe
        const existingUser = await query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        )

        if (existingUser.rows.length > 0) {
            return NextResponse.json(
                { error: 'El email ya está registrado' },
                { status: 409 }
            )
        }

        // Insertar nuevo usuario (SIN encriptación como solicitaste)
        const result = await query(
            `INSERT INTO users (name, email, password, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING id, name, email, created_at`,
            [name, email, password]
        )

        const newUser = result.rows[0]

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    created_at: newUser.created_at,
                },
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error en registro:', error)
        return NextResponse.json(
            { error: 'Error al registrar usuario', details: error.message },
            { status: 500 }
        )
    }
}
