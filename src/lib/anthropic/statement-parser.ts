import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const client = new Anthropic()

const statementTransactionSchema = z.object({
    date: z.string(), // YYYY-MM-DD
    description: z.string(),
    amount: z.number(),
    type: z.enum(['expense', 'income']),
})

const statementSchema = z.object({
    transactions: z.array(statementTransactionSchema),
})

export type StatementTransaction = z.infer<typeof statementTransactionSchema>

const SYSTEM_PROMPT = `Você é um parser de extrato bancário brasileiro.
Extraia todas as transações do extrato e retorne APENAS um JSON válido, sem texto adicional.

Regras:
- Ignore linhas de "SALDO DO DIA" — não são transações
- Valores negativos = type "expense"
- Valores positivos = type "income"
- Formato de data de saída: YYYY-MM-DD
- Mantenha a descrição original do lançamento como description
- Retorne somente transações a partir de 01/04/2026

Schema de saída:
{
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "descrição original",
      "amount": 35.00,
      "type": "expense" | "income"
    }
  ]
}`

export async function parseStatement(
    pdfBase64: string
): Promise<StatementTransaction[]> {
    const message = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: 'user',
                content: [
                    {
                        type: 'document',
                        source: {
                            type: 'base64',
                            media_type: 'application/pdf',
                            data: pdfBase64,
                        },
                    },
                    {
                        type: 'text',
                        text: 'Extraia todas as transações deste extrato a partir de 01/04/2026.',
                    },
                ],
            },
        ],
    })

    const raw = message.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('')
        .trim()

    const clean = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let parsed: unknown
    try {
        parsed = JSON.parse(clean)
    } catch {
        throw new Error(`Extrato retornou JSON inválido: ${clean}`)
    }

    const result = statementSchema.safeParse(parsed)
    if (!result.success) {
        throw new Error(`Dados do extrato inválidos: ${result.error.issues[0].message}`)
    }

    return result.data.transactions
}