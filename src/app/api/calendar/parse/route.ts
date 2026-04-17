import { NextResponse } from 'next/server'
import { parseCalendarEvent } from '@/lib/anthropic/calendar-parser'

/**
 * @swagger
 * /api/calendar/parse:
 *   post:
 *     tags: [Calendário]
 *     summary: Interpreta texto livre e extrai dados de evento via IA
 *     description: Não salva o evento — retorna dados extraídos para confirmação
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
 *                 example: Toda terça até junho tenho aula de BD Avançado na S432
 *     responses:
 *       200:
 *         description: Evento extraído com sucesso
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

        const parsed = await parseCalendarEvent(text)
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
                        : 'Erro ao processar evento.',
                },
            },
            { status: isParseError ? 422 : 500 }
        )
    }
}