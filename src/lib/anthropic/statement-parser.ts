import Anthropic from '@anthropic-ai/sdk'
import {
    statementSchema,
    type StatementTransaction,
    type DailyBalance,
    type ParsedStatement,
} from '@/lib/statement-validation'

export type { StatementTransaction, DailyBalance, ParsedStatement }

const client = new Anthropic()

const SYSTEM_PROMPT = `Você é um parser de extrato bancário do Itaú (banco brasileiro).

Formato do extrato Itaú:
- Colunas: data (DD/MM/YYYY) | lançamentos | valor (R$) | saldo (R$)
- Valores negativos = saída → type "expense"
- Valores positivos = entrada → type "income"
- Linhas "SALDO DO DIA": NÃO são transações — extraia separadamente em daily_balances
- Formato numérico BR: ponto = separador de milhar, vírgula = decimal
  Ex: "1.000,13" → 1000.13 | "2.895,50" → 2895.50 | "-33,00" → 33.00

Regras:
- date: converter DD/MM/YYYY → YYYY-MM-DD
- amount: sempre positivo (o type já indica entrada/saída)
- description: descrição original do lançamento, sem alteração
- counterpart: nome/entidade extraído da descrição quando identificável
  Ex: "PIX TRANSF MARILEA 15/04" → "MARILEA" | "PAY POSTO 10/04" → null
- category:
  • food         → mercado, supermercado, restaurante, delivery, lanche, padaria
  • transport    → posto, gasolina, uber, taxi, estacionamento, combustível
  • health       → farmácia, farma, unimed, plano de saúde, médico, clínica
  • education    → escola, curso, faculdade, livro
  • entertainment → streaming, google play, sympla, show, evento, lazer, cinema
  • bills        → celesc, samae, água, luz, energia, internet, seguro, condomínio, pagseguro
  • transfer     → pagto salario, salário, pix transf (pessoas), resgate cdb, aplicacao cofrinhos
  • other        → tudo que não se encaixa acima

Retorne APENAS JSON válido, sem texto adicional:
{
  "transactions": [...],
  "daily_balances": [{ "date": "YYYY-MM-DD", "balance": 58.00 }]
}`

// ─── Passo 1: descobrir meses presentes no extrato ────────────────────────────

async function discoverMonths(pdfBase64: string): Promise<string[]> {
    const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 256,
        messages: [{
            role: 'user',
            content: [
                {
                    type: 'document',
                    source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
                },
                {
                    type: 'text',
                    text: 'Liste todos os meses presentes neste extrato como JSON array no formato YYYY-MM, ordenados do mais antigo ao mais recente. Retorne APENAS o array JSON, sem texto adicional. Exemplo: ["2026-01","2026-02","2026-03"]',
                },
            ],
        }],
    })

    const raw = message.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('')
        .trim()
        .replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    const months = JSON.parse(raw) as string[]
    if (!Array.isArray(months) || months.length === 0) {
        throw new Error('Dados do extrato inválidos: não foi possível identificar os meses do extrato')
    }
    return months
}

// ─── Passo 2: extrair um mês por vez ─────────────────────────────────────────

async function parseMonth(pdfBase64: string, yearMonth: string): Promise<ParsedStatement> {
    const [year, month] = yearMonth.split('-')
    const label = `${month}/${year}`

    const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8096,
        system: SYSTEM_PROMPT,
        messages: [{
            role: 'user',
            content: [
                {
                    type: 'document',
                    source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
                },
                {
                    type: 'text',
                    text: `Extraia APENAS as transações e saldos do dia do mês ${label} (datas entre ${year}-${month}-01 e ${year}-${month}-31).`,
                },
            ],
        }],
    })

    if (message.stop_reason === 'max_tokens') {
        throw new Error(`Dados do extrato inválidos: resposta truncada para o mês ${label}. Tente novamente.`)
    }

    const raw = message.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('')
        .trim()

    const clean = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()

    let parsed: unknown
    try {
        parsed = JSON.parse(clean)
    } catch {
        throw new Error(`Extrato retornou JSON inválido para ${label}: ${clean.slice(0, 200)}`)
    }

    const result = statementSchema.safeParse(parsed)
    if (!result.success) {
        throw new Error(`Dados do extrato inválidos para ${label}: ${result.error.issues[0].message}`)
    }

    return result.data
}

// ─── Exportação principal ─────────────────────────────────────────────────────

export async function parseStatement(pdfBase64: string): Promise<ParsedStatement> {
    const months = await discoverMonths(pdfBase64)

    const chunks: ParsedStatement[] = []
    for (const m of months) {
        chunks.push(await parseMonth(pdfBase64, m))
    }

    // Merge transactions de todos os meses
    const transactions: StatementTransaction[] = chunks.flatMap(c => c.transactions)

    // Merge daily_balances sem duplicatas (pode haver o mesmo dia em chunks sobrepostos)
    const balanceMap = new Map<string, DailyBalance>()
    for (const chunk of chunks) {
        for (const b of chunk.daily_balances) {
            if (!balanceMap.has(b.date)) balanceMap.set(b.date, b)
        }
    }
    const daily_balances = Array.from(balanceMap.values())
        .sort((a, b) => a.date.localeCompare(b.date))

    return { transactions, daily_balances }
}
