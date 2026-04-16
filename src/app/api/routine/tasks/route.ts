import { NextResponse } from 'next/server'
import { createTaskSchema } from '@/types/routine.types'
import * as RoutineService from '@/services/routine.service'

/**
 * @swagger
 * /api/routine/tasks:
 *   get:
 *     tags: [Rotina]
 *     summary: Lista tarefas por data
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Data no formato YYYY-MM-DD (padrão hoje)
 *       - in: query
 *         name: pendentes
 *         schema:
 *           type: boolean
 *         description: Se true, retorna todas as tarefas pendentes até hoje
 *     responses:
 *       200:
 *         description: Lista de tarefas retornada com sucesso
 *       500:
 *         description: Erro interno
 *   post:
 *     tags: [Rotina]
 *     summary: Cria uma nova tarefa avulsa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, task_date]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Lavar a roupa
 *               task_date:
 *                 type: string
 *                 format: date
 *                 example: "2026-04-16"
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const pendentes = searchParams.get('pendentes') === 'true'

        if (pendentes) {
            const data = await RoutineService.getPendingTasks()
            return NextResponse.json({ sucesso: true, dados: data, erro: null })
        }

        const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
        const data = await RoutineService.getTasksByDate(date)
        return NextResponse.json({ sucesso: true, dados: data, erro: null })
    } catch (error) {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'TASK_LIST_ERROR', mensagem: 'Erro ao buscar tarefas.' } },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = createTaskSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'TASK_INVALID', mensagem: parsed.error.issues[0].message } },
                { status: 400 }
            )
        }

        const data = await RoutineService.createTask(parsed.data)
        return NextResponse.json({ sucesso: true, dados: data, erro: null }, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'TASK_CREATE_ERROR', mensagem: 'Erro ao criar tarefa.' } },
            { status: 500 }
        )
    }
}