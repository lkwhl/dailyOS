import { z } from 'zod'
import type { Database } from './database.types'

export type EventRow = Database['public']['Tables']['calendar_events']['Row']
export type RecurrenceRuleRow = Database['public']['Tables']['calendar_recurrence_rules']['Row']

export const EVENT_TYPES = [
    'class',
    'exam',
    'assignment',
    'appointment',
    'jira_deadline',
    'other',
] as const

export type EventType = typeof EVENT_TYPES[number]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
    class: 'Aula',
    exam: 'Prova',
    assignment: 'Trabalho',
    appointment: 'Consulta',
    jira_deadline: 'Jira',
    other: 'Outro',
}

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
    class: '#534ab7',
    exam: '#a32d2d',
    assignment: '#854f0b',
    appointment: '#0f6e56',
    jira_deadline: '#185fa5',
    other: '#5f5e5a',
}

export const createRecurrenceRuleSchema = z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    days_of_week: z.array(z.number().min(1).max(7)).nullable().optional(),
    interval: z.number().min(1).default(1),
    starts_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    ends_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
})

export const createEventSchema = z.object({
    title: z.string().min(1, 'Título obrigatório').max(200),
    description: z.string().max(500).optional(),
    event_type: z.enum(EVENT_TYPES),
    location: z.string().max(100).optional(),
    event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
    starts_at: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    ends_at: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
    all_day: z.boolean().default(false),
    recurrence_rule: createRecurrenceRuleSchema.optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export const updateEventSchema = createEventSchema.partial().extend({
    is_cancelled: z.boolean().optional(),
})

export const parsedEventSchema = z.object({
    title: z.string(),
    event_type: z.enum(EVENT_TYPES),
    location: z.string().optional().nullable(),
    event_date: z.string(),
    starts_at: z.string().optional().nullable(),
    ends_at: z.string().optional().nullable(),
    all_day: z.boolean().default(false),
    recurrence_rule: createRecurrenceRuleSchema.optional().nullable(),
    metadata: z.record(z.string(), z.unknown()).optional().default({}),
})

export type ParsedEvent = z.infer<typeof parsedEventSchema>
export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type CreateRecurrenceInput = z.infer<typeof createRecurrenceRuleSchema>

export type JiraCard = {
    key: string
    summary: string
    dueDate: string
    priority: string
    status: string
    url: string
}

export type ApiResponse<T> = {
    sucesso: boolean
    dados: T | null
    erro: { codigo: string; mensagem: string } | null
}