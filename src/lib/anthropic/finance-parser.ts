import anthropic from './client'
import {
    parsedTransactionSchema,
    type ParsedTransaction,
} from '@/types/finance.types'

const SYSTEM_PROMPT = `Você é um parser de transações financeiras.
Sua única função é extrair dados de um texto em português e retornar um JSON válido.

Regras:
- Retorne APENAS o JSON, sem texto adicional, sem markdown, sem explicações
- Datas sem ano assumem o ano atual
- Datas sem dia assumem o dia de hoje
- Formato da data de saída: YYYY-MM-DD
- Valores sempre positivos — o campo "type" define se é entrada ou saída
- Se o texto mencionar que alguém pagou ou mandou dinheiro para o usuário, type = "income"
- Caso contrário, type = "expense"

Categorias disponíveis:
- food        → alimentação, comida, restaurante, lanche, mercado
- transport   → uber, ônibus, combustível, estacionamento
- health      → remédio, farmácia, consulta, academia, plano de saúde
- education   → faculdade, curso, livro, material escolar
- entertainment → lazer, cinema, jogo, streaming, bar
- bills       → conta de luz, água, internet, celular, aluguel
- transfer    → pix, transferência, depósito
- other       → qualquer coisa que não se encaixe acima

Schema de saída:
{
  "type": "expense" | "income",
  "amount": number,
  "category": string,
  "description": string,
  "transaction_date": "YYYY-MM-DD",
  "counterpart": string | null
}`

export async function parseTransaction(
    input: string,
    referenceDate?: string
): Promise<ParsedTransaction> {
    const today = referenceDate ?? new Date().toISOString().split('T')[0]

    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: 'user',
                content: `Data de hoje: ${today}\n\nTexto: ${input}`,
            },
        ],
    })

    const raw = message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('')
        .trim()

    const clean = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let parsed: unknown
    try {
        parsed = JSON.parse(clean)
    } catch {
        throw new Error(`Parser retornou JSON inválido: ${clean}`)
    }

    const result = parsedTransactionSchema.safeParse(parsed)
    if (!result.success) {
        throw new Error(`Dados extraídos inválidos: ${result.error.issues[0].message}`)
    }

    return result.data
}