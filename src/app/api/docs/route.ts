import { NextResponse } from 'next/server'
import { swaggerSpec } from '@/lib/swagger/config'

export function GET() {
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('swaggerSpec type:', typeof swaggerSpec)
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { erro: { codigo: 'NOT_FOUND', mensagem: 'Não encontrado.' } },
            { status: 404 }
        )
    }

    return NextResponse.json(swaggerSpec)
}