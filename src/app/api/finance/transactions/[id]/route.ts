import { NextResponse } from 'next/server'
import * as FinanceService from '@/services/finance.service'

/**
 * @swagger
 * /api/finance/transactions/{id}:
 *   delete:
 *     tags: [Financeiro]
 *     summary: Remove uma transação
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transação removida com sucesso
 *       500:
 *         description: Erro interno
 */

type Params = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Params) {
    try {
        const { id } = await params
        await FinanceService.deleteTransaction(id)
        return NextResponse.json({ sucesso: true, dados: null, erro: null })
    } catch {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'TRANSACTION_DELETE_ERROR', mensagem: 'Erro ao remover transação.' } },
            { status: 500 }
        )
    }
}