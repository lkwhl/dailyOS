import { NextResponse } from 'next/server'
import { updateReminderSchema } from '@/types/routine.types'
import * as RoutineService from '@/services/routine.service'

/**
 * @swagger
 * /api/routine/reminders/{id}:
 *   put:
 *     tags: [Rotina]
 *     summary: Atualiza um lembrete
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lembrete atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Lembrete não encontrado
 *       500:
 *         description: Erro interno
 *   delete:
 *     tags: [Rotina]
 *     summary: Remove um lembrete
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lembrete removido com sucesso
 *       404:
 *         description: Lembrete não encontrado
 *       500:
 *         description: Erro interno
 */

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json()
        const parsed = updateReminderSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'REMINDER_INVALID', mensagem: parsed.error.issues[0].message } },
                { status: 400 }
            )
        }

        const existing = await RoutineService.getReminderById(id)
        if (!existing) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'REMINDER_NOT_FOUND', mensagem: 'Lembrete não encontrado.' } },
                { status: 404 }
            )
        }

        const data = await RoutineService.updateReminder(id, parsed.data)
        return NextResponse.json({ sucesso: true, dados: data, erro: null })
    } catch (error) {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'REMINDER_UPDATE_ERROR', mensagem: 'Erro ao atualizar lembrete.' } },
            { status: 500 }
        )
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { id } = await params

        const existing = await RoutineService.getReminderById(id)
        if (!existing) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'REMINDER_NOT_FOUND', mensagem: 'Lembrete não encontrado.' } },
                { status: 404 }
            )
        }

        await RoutineService.deleteReminder(id)
        return NextResponse.json({ sucesso: true, dados: null, erro: null })
    } catch (error) {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'REMINDER_DELETE_ERROR', mensagem: 'Erro ao remover lembrete.' } },
            { status: 500 }
        )
    }
}