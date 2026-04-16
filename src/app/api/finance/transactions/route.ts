import { NextResponse } from 'next/server'
import { createTransactionSchema } from '@/types/finance.types'
import * as FinanceService from '@/services/finance.service'

/**
 * @swagger
 * /api/finance/transactions:
 *   get:
 *     tags: [Financeiro]
 *     summary: Lista transações por período
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Data inicial YYYY-MM-DD (padrão primeiro dia do mês)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: Data final YYYY-MM-DD (padrão hoje)
 *     responses:
 *       200:
 *         description: Lista de transações retornada com sucesso
 *       500:
 *         description: Erro interno
 *   post:
 *     tags: [Financeiro]
 *     summary: Cria uma nova transação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, amount, category, transaction_date]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [expense, income]
 *               amount:
 *                 type: number
 *                 example: 35.00
 *               category:
 *                 type: string
 *                 example: food
 *               description:
 *                 type: string
 *                 example: FURB
 *               transaction_date:
 *                 type: string
 *                 format: date
 *               raw_input:
 *                 type: string
 *                 example: gastei 35 reais com comida na furb
 *     responses:
 *       201:
 *         description: Transação criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno
 */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)

        const now = new Date()
        const from = searchParams.get('from')
            ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const to = searchParams.get('to')
            ?? now.toISOString().split('T')[0]

        const data = await FinanceService.getTransactionsByDateRange(from, to)
        return NextResponse.json({ sucesso: true, dados: data, erro: null })
    } catch {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'TRANSACTION_LIST_ERROR', mensagem: 'Erro ao buscar transações.' } },
            { status: 500 }
        )
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = createTransactionSchema.safeParse(body)

        if (!parsed.success) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'TRANSACTION_INVALID', mensagem: parsed.error.issues[0].message } },
                { status: 400 }
            )
        }

        const data = await FinanceService.createTransaction(parsed.data)
        return NextResponse.json({ sucesso: true, dados: data, erro: null }, { status: 201 })
    } catch {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'TRANSACTION_CREATE_ERROR', mensagem: 'Erro ao criar transação.' } },
            { status: 500 }
        )
    }
}