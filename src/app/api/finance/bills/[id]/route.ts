import { NextResponse } from 'next/server'
import { updateBillMonthSchema } from '@/types/finance.types'
import * as FinanceService from '@/services/finance.service'

/**
 * @swagger
 * /api/finance/bills/{id}:
 *   put:
 *     tags: [Financeiro]
 *     summary: Atualiza valor ou status de pagamento de uma conta no mês
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da conta fixa (finance_bills)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 320.00
 *               is_paid:
 *                 type: boolean
 *                 example: true
 *               reference_month:
 *                 type: string
 *                 example: "2026-04-01"
 *     responses:
 *       200:
 *         description: Conta atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */

type Params = { params: Promise<{ id: string }> }

export async function PUT(request: Request, { params }: Params) {
    try {
        const { id } = await params
        const body = await request.json()

        const now = new Date()
        const referenceMonth = body.reference_month
            ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

        const parsed = updateBillMonthSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'BILL_INVALID', mensagem: parsed.error.issues[0].message } },
                { status: 400 }
            )
        }

        const data = await FinanceService.upsertBillMonth(id, referenceMonth, parsed.data)
        return NextResponse.json({ sucesso: true, dados: data, erro: null })
    } catch {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'BILL_UPDATE_ERROR', mensagem: 'Erro ao atualizar conta.' } },
            { status: 500 }
        )
    }
}