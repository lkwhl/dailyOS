import { NextResponse } from 'next/server'
import { updateTaskSchema } from '@/types/routine.types'
import * as RoutineService from '@/services/routine.service'

/**
 * @swagger
 * /api/routine/tasks/{id}:
 *   put:
 *     tags: [Rotina]
 *     summary: Atualiza uma tarefa (incluindo marcar como concluída)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               is_completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Tarefa não encontrada
 *       500:
 *         description: Erro interno
 *   delete:
 *     tags: [Rotina]
 *     summary: Remove uma tarefa
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tarefa removida com sucesso
 *       404:
 *         description: Tarefa não encontrada
 *       500:
 *         description: Erro interno
 */

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json()
        const parsed = updateTaskSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'TASK_INVALID', mensagem: parsed.error.issues[0].message } },
                { status: 400 }
            )
        }

        const data = await RoutineService.updateTask(id, parsed.data)
        return NextResponse.json({ sucesso: true, dados: data, erro: null })
    } catch (error) {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'TASK_UPDATE_ERROR', mensagem: 'Erro ao atualizar tarefa.' } },
            { status: 500 }
        )
    }
}

export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { id } = await params

        await RoutineService.deleteTask(id)
        return NextResponse.json({ sucesso: true, dados: null, erro: null })
    } catch (error) {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'TASK_DELETE_ERROR', mensagem: 'Erro ao remover tarefa.' } },
            { status: 500 }
        )
    }
}