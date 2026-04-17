import anthropic from './client'
import { parsedEventSchema, type ParsedEvent } from '@/types/calendar.types'

const SYSTEM_PROMPT = `Você é um parser de eventos de calendário.
Sua única função é extrair dados de um texto em português e retornar um JSON válido.

Retorne APENAS o JSON, sem texto adicional, sem markdown, sem explicações.

Tipos de evento disponíveis:
- class       → aula, disciplina, matéria
- exam        → prova, avaliação, teste
- assignment  → trabalho, TP, seminário, entrega
- appointment → consulta, médico, psicólogo, psiquiatra
- other       → qualquer outro evento

Dias da semana (ISO):
1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado, 7=Domingo

Regras de recorrência:
- "toda terça" → frequency: "weekly", days_of_week: [2], interval: 1
- "toda segunda e quarta" → frequency: "weekly", days_of_week: [1, 3], interval: 1
- "todo dia" → frequency: "daily", interval: 1
- "quinzenal" → frequency: "weekly", interval: 2
- "até junho" → ends_on: último dia de junho do ano atual
- "até 30/06" → ends_on: "YYYY-06-30"
- Sem data de fim → ends_on: null

Regras gerais:
- Horários no formato HH:MM
- Datas no formato YYYY-MM-DD
- Se não mencionar horário → starts_at: null
- Se não mencionar local/sala → location: null
- Se o evento for recorrente → preencher recurrence_rule
- Se for evento único → recurrence_rule: null
- event_date é sempre a primeira ocorrência do evento
- metadata pode conter: { subject: "nome da matéria" } para aulas

Schema de saída:
{
  "title": string,
  "event_type": "class" | "exam" | "assignment" | "appointment" | "other",
  "location": string | null,
  "event_date": "YYYY-MM-DD",
  "starts_at": "HH:MM" | null,
  "ends_at": "HH:MM" | null,
  "all_day": boolean,
  "recurrence_rule": {
    "frequency": "daily" | "weekly" | "monthly",
    "days_of_week": number[] | null,
    "interval": number,
    "starts_on": "YYYY-MM-DD",
    "ends_on": "YYYY-MM-DD" | null
  } | null,
  "metadata": {}
}`

export async function parseCalendarEvent(
    input: string,
    referenceDate?: string
): Promise<ParsedEvent> {
    const today = referenceDate ?? new Date().toISOString().split('T')[0]
    const year = today.split('-')[0]

    const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: SYSTEM_PROMPT,
        messages: [
            {
                role: 'user',
                content: `Data de hoje: ${today}\nAno atual: ${year}\n\nTexto: ${input}`,
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

    const result = parsedEventSchema.safeParse(parsed)
    if (!result.success) {
        throw new Error(`Dados extraídos inválidos: ${result.error.issues[0].message}`)
    }

    return result.data
}