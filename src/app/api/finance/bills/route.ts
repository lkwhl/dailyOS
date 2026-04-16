import { NextResponse } from 'next/server'
import * as FinanceService from '@/services/finance.service'

/**
 * @swagger
 * /api/finance/bills:
 *   get:
 *     tags: [Financeiro]
 *     summary: Lista contas fixas do mês atual com status de pagamento
 *     responses:
 *       200:
 *         description: Lista de contas retornada com sucesso
 *       500:
 *         description: Erro interno
 */

export async function GET() {
    try {
        const data = await FinanceService.getBillsThisMonth()
        return NextResponse.json({ sucesso: true, dados: data, erro: null })
    } catch {
        return NextResponse.json(
            { sucesso: false, dados: null, erro: { codigo: 'BILLS_LIST_ERROR', mensagem: 'Erro ao buscar contas.' } },
            { status: 500 }
        )
    }
}