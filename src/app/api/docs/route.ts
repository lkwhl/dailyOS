import { NextResponse } from 'next/server'
import { swaggerSpec } from '@/src/lib/swagger/config'

export function GET() {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            { erro: { codigo: 'NOT_FOUND', mensagem: 'Não encontrado.' } },
            { status: 404 }
        )
    }

    return NextResponse.json(swaggerSpec)
}