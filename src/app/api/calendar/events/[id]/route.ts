import { NextResponse } from 'next/server'
import { updateEventSchema } from '@/types/calendar.types'
import * as CalendarService from '@/services/calendar.service'

/**
 * @swagger
 * /api/calendar/events/{id}:
 *   put:
 *     tags: [Calendário]
 *     summary: Atualiza um evento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento atualizado com sucesso
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro interno
 *   delete:
 *     tags: [Calendário]
 *     summary: Remove um evento
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Evento removido com sucesso
 *       404:
 *         description: Evento não encontrado
 *       500:
 *         description: Erro interno
 */

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json()
        const parsed = updateEventSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'CALENDAR_INVALID', mensagem: parsed.error.issues[0].message } },
                { status: 400 }
            )
        }

        const existing = await CalendarService.getEventById(id)
        if (!existing) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'CALENDAR_NOT_FOUND', mensagem: 'Evento não encontrado.' } },
                { status: 404 }
            )
        }

        const data = await CalendarService.updateEvent(id, parsed.data)
        return NextResponse.json({ sucesso: true, dados: data, erro: null })
    } catch {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'CALENDAR_UPDATE_ERROR', mensagem: 'Erro ao atualizar evento.' } },
            { status: 500 }
        )
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { id } = await params

        const existing = await CalendarService.getEventById(id)
        if (!existing) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'CALENDAR_NOT_FOUND', mensagem: 'Evento não encontrado.' } },
                { status: 404 }
            )
        }

        await CalendarService.deleteEvent(id)
        return NextResponse.json({ sucesso: true, dados: null, erro: null })
    } catch {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'CALENDAR_DELETE_ERROR', mensagem: 'Erro ao remover evento.' } },
            { status: 500 }
        )
    }
}