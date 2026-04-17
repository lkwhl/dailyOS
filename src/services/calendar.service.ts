import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/types/database.types'
import type {
    EventRow,
    RecurrenceRuleRow,
    CreateEventInput,
    UpdateEventInput,
    CreateRecurrenceInput,
    JiraCard,
} from '@/types/calendar.types'

async function createRecurrenceRule(
    input: CreateRecurrenceInput
): Promise<RecurrenceRuleRow> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('calendar_recurrence_rules')
        .insert(input)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}

export async function getEventsByDateRange(
    from: string,
    to: string
): Promise<EventRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .gte('event_date', from)
        .lte('event_date', to)
        .eq('is_cancelled', false)
        .order('event_date', { ascending: true })
        .order('starts_at', { ascending: true, nullsFirst: false })

    if (error) throw new Error(error.message)
    return data
}

export async function getEventById(id: string): Promise<EventRow | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

export async function getUpcomingEvents(days = 14): Promise<EventRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('v_upcoming_events')
        .select('*')
        .lte('days_until', days)

    if (error) throw new Error(error.message)
    return data as unknown as EventRow[]
}

export async function createEvent(input: CreateEventInput): Promise<EventRow[]> {
    const supabase = await createClient()

    const { recurrence_rule, ...eventData } = input

    if (!recurrence_rule) {
        const { data, error } = await supabase
            .from('calendar_events')
            .insert({ ...eventData, metadata: eventData.metadata as Json | undefined })
            .select()

        if (error) throw new Error(error.message)
        return data ?? []
    }

    const rule = await createRecurrenceRule({
        frequency: recurrence_rule.frequency,
        days_of_week: recurrence_rule.days_of_week ?? null,
        interval: recurrence_rule.interval ?? 1,
        starts_on: recurrence_rule.starts_on ?? input.event_date,
        ends_on: recurrence_rule.ends_on ?? null,
    })

    const occurrences = expandRecurrenceOccurrences(
        rule,
        input.event_date,
        recurrence_rule.ends_on ?? null
    )

    const rows = occurrences.map((date) => ({
        ...eventData,
        event_date: date,
        recurrence_rule_id: rule.id,
        metadata: eventData.metadata as Json | undefined,
    }))

    const { data, error } = await supabase
        .from('calendar_events')
        .insert(rows)
        .select()

    if (error) throw new Error(error.message)
    return data ?? []
}

export async function updateEvent(
    id: string,
    input: UpdateEventInput
): Promise<EventRow> {
    const supabase = await createClient()

    const { recurrence_rule, ...eventData } = input

    const { data, error } = await supabase
        .from('calendar_events')
        .update({ ...eventData, metadata: eventData.metadata as Json | undefined })
        .eq('id', id)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data!
}

export async function cancelEvent(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('calendar_events')
        .update({ is_cancelled: true })
        .eq('id', id)

    if (error) throw new Error(error.message)
}

export async function deleteEvent(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
}

export async function syncJiraCards(cards: JiraCard[]): Promise<{
    created: number
    updated: number
    skipped: number
}> {
    const supabase = await createClient()
    let created = 0, updated = 0, skipped = 0

    for (const card of cards) {
        const { data: existing } = await supabase
            .from('calendar_events')
            .select('id, event_date')
            .eq('event_type', 'jira_deadline')
            .contains('metadata', { jiraKey: card.key })
            .single()

        const eventData = {
            title: `[${card.key}] ${card.summary}`,
            event_type: 'jira_deadline' as const,
            event_date: card.dueDate,
            all_day: true,
            metadata: {
                jiraKey: card.key,
                priority: card.priority,
                status: card.status,
                url: card.url,
            },
        }

        if (existing) {
            if (existing.event_date !== card.dueDate) {
                await supabase
                    .from('calendar_events')
                    .update({ event_date: card.dueDate, metadata: eventData.metadata })
                    .eq('id', existing.id)
                updated++
            } else {
                skipped++
            }
        } else {
            await supabase
                .from('calendar_events')
                .insert(eventData)
            created++
        }
    }

    return { created, updated, skipped }
}

function expandRecurrenceOccurrences(
    rule: RecurrenceRuleRow,
    startDate: string,
    endDate: string | null
): string[] {
    const dates: string[] = []

    const start = new Date(startDate + 'T12:00:00')
    const end = endDate
        ? new Date(endDate + 'T12:00:00')
        : new Date(start.getFullYear() + 1, start.getMonth(), start.getDate())

    const current = new Date(start)

    let iterations = 0
    const MAX = 500

    while (current <= end && iterations < MAX) {
        iterations++

        if (rule.frequency === 'daily') {
            dates.push(toDateString(current))
            current.setDate(current.getDate() + rule.interval)

        } else if (rule.frequency === 'weekly') {
            const targetDays = rule.days_of_week ?? [current.getDay() || 7]

            for (let d = 0; d < 7 * rule.interval; d++) {
                const dayOfWeek = current.getDay() === 0 ? 7 : current.getDay() // ISO weekday
                if (targetDays.includes(dayOfWeek) && current <= end) {
                    dates.push(toDateString(current))
                }
                current.setDate(current.getDate() + 1)
                if (current > end) break
            }
            continue

        } else if (rule.frequency === 'monthly') {
            dates.push(toDateString(current))
            current.setMonth(current.getMonth() + rule.interval)
        }
    }

    return [...new Set(dates)].sort()
}

function toDateString(date: Date): string {
    return date.toISOString().split('T')[0]
}