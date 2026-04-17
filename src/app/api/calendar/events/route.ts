import { NextResponse } from 'next/server'
import { createEventSchema } from '@/types/calendar.types'
import * as CalendarService from '@/services/calendar.service'

/**
 * @swagger
 * /api/calendar/events:
 *   get:
 *     tags: [Calendário]
 *     summary: Lista eventos por período
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial YYYY-MM-DD (padrão hoje)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final YYYY-MM-DD (padrão +14 dias)
 *     responses:
 *       200:
 *         description: Lista de eventos retornada com sucesso
 *       500:
 *         description: Erro interno
 *   post:
 *     tags: [Calendário]
 *     summary: Cria um novo evento (único ou recorrente)
 *     responses:
 *       201:
 *         description: Evento(s) criado(s) com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        const today = new Date().toISOString().split('T')[0]
        const in14 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0]

        const from = searchParams.get('from') ?? today
        const to = searchParams.get('to') ?? in14

        const data = await CalendarService.getEventsByDateRange(from, to)
        return NextResponse.json({ sucesso: true, dados: data, erro: null })
    } catch {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'CALENDAR_LIST_ERROR', mensagem: 'Erro ao buscar eventos.' } },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = createEventSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'CALENDAR_INVALID', mensagem: parsed.error.issues[0].message } },
                { status: 400 }
            )
        }

        const data = await CalendarService.createEvent(parsed.data)
        return NextResponse.json({ sucesso: true, dados: data, erro: null }, { status: 201 })
    } catch {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'CALENDAR_CREATE_ERROR', mensagem: 'Erro ao criar evento.' } },
            { status: 500 }
        )
    }
}