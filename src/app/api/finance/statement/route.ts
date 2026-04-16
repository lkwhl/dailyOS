import { NextResponse } from 'next/server'
import { parseStatement } from '@/lib/anthropic/statement-parser'

/**
 * @swagger
 * /api/finance/statement:
 *   post:
 *     tags: [Financeiro]
 *     summary: Importa transações de um extrato bancário em PDF
 *     description: Recebe PDF em base64, extrai transações via IA e retorna preview para confirmação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [pdf]
 *             properties:
 *               pdf:
 *                 type: string
 *                 description: PDF do extrato em base64
 *     responses:
 *       200:
 *         description: Transações extraídas com sucesso
 *       400:
 *         description: PDF não fornecido
 *       422:
 *         description: Não foi possível interpretar o extrato
 *       500:
 *         description: Erro interno
 */

export async function POST(request: Request) {
    try {
        const body = await request.json()

        if (!body.pdf) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'STATEMENT_PDF_REQUIRED', mensagem: 'PDF do extrato é obrigatório.' } },
                { status: 400 }
            )
        }

        const transactions = await parseStatement(body.pdf)

        return NextResponse.json({
            sucesso: true,
            dados: { transactions, total: transactions.length },
            erro: null,
        })
    } catch (error) {
        const isParseError = error instanceof Error && error.message.includes('inválido')

        return NextResponse.json(
            {
                sucesso: false,
                dados: null,
                erro: {
                    codigo: isParseError ? 'STATEMENT_PARSE_FAILED' : 'STATEMENT_ERROR',
                    mensagem: isParseError
                        ? 'Não foi possível interpretar o extrato. Verifique se o PDF é um extrato bancário válido.'
                        : 'Erro ao processar extrato.',
                },
            },
            { status: isParseError ? 422 : 500 }
        )
    }
}