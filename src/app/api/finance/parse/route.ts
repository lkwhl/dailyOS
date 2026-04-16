import { NextResponse } from 'next/server'
import { parseTransaction } from '@/lib/anthropic/finance-parser'

/**
 * @swagger
 * /api/finance/parse:
 *   post:
 *     tags: [Financeiro]
 *     summary: Interpreta texto livre e extrai dados de transação via IA
 *     description: Não salva a transação — apenas retorna os dados extraídos para confirmação do usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text:
 *                 type: string
 *                 example: gastei 35 reais com comida na furb dia 09/04/2026
 *     responses:
 *       200:
 *         description: Dados extraídos com sucesso — aguardando confirmação do usuário
 *       400:
 *         description: Texto não fornecido
 *       422:
 *         description: Não foi possível interpretar o texto
 *       500:
 *         description: Erro interno
 */

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const text = body.text?.trim()

        if (!text) {
            return NextResponse.json(
                { sucesso: false, dados: null, erro: { codigo: 'PARSE_TEXT_REQUIRED', mensagem: 'Texto é obrigatório.' } },
                { status: 400 }
            )
        }

        const parsed = await parseTransaction(text)
        return NextResponse.json({ sucesso: true, dados: parsed, erro: null })
    } catch (error) {
        const isParseError = error instanceof Error && error.message.includes('inválido')

        return NextResponse.json(
            {
                sucesso: false,
                dados: null,
                erro: {
                    codigo: isParseError ? 'PARSE_FAILED' : 'PARSE_ERROR',
                    mensagem: isParseError
                        ? 'Não foi possível interpretar o texto. Tente ser mais específico.'
                        : 'Erro ao processar transação.',
                },
            },
            { status: isParseError ? 422 : 500 }
        )
    }
}