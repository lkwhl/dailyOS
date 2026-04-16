import { NextResponse } from 'next/server'
import { createReminderSchema } from '@/types/routine.types'
import * as RoutineService from '@/services/routine.service'

/**
 * @swagger
 * /api/routine/reminders:
 *   get:
 *     tags: [Rotina]
 *     summary: Lista todos os lembretes
 *     responses:
 *       200:
 *         description: Lista de lembretes retornada com sucesso
 *       500:
 *         description: Erro interno
 *   post:
 *     tags: [Rotina]
 *     summary: Cria um novo lembrete recorrente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, reminder_time, days_of_week]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Tomar remédio
 *               reminder_time:
 *                 type: string
 *                 example: "21:00"
 *               days_of_week:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1,2,3,4,5,6,7]
 *     responses:
 *       201:
 *         description: Lembrete criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */

export async function GET() {
    try {
        const data = await RoutineService.getAllReminders()
        return NextResponse.json({ sucesso: true, dados: data, erro: null })
    } catch (error) {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'REMINDER_LIST_ERROR', mensagem: 'Erro ao buscar lembretes.' } },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = createReminderSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'REMINDER_INVALID', mensagem: parsed.error.issues[0].message } },
                { status: 400 }
            )
        }

        const data = await RoutineService.createReminder(parsed.data)
        return NextResponse.json({ sucesso: true, dados: data, erro: null }, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'REMINDER_CREATE_ERROR', mensagem: 'Erro ao criar lembrete.' } },
            { status: 500 }
        )
    }
}