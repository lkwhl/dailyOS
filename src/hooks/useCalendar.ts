'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
    EventRow,
    ParsedEvent,
    CreateEventInput,
} from '@/types/calendar.types'

function getMondayOf(date: Date): Date {
    const day = date.getDay()
    const diff = day === 0 ? -6 : 1 - day
    const mon = new Date(date)
    mon.setDate(date.getDate() + diff)
    mon.setHours(0, 0, 0, 0)
    return mon
}

function getWeekRange(monday: Date): { from: string; to: string } {
    const sun = new Date(monday)
    sun.setDate(monday.getDate() + 6)
    return {
        from: monday.toISOString().split('T')[0],
        to: sun.toISOString().split('T')[0],
    }
}

function addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr + 'T12:00:00')
    d.setDate(d.getDate() + days)
    return d.toISOString().split('T')[0]
}

export function useCalendar() {
    const [events, setEvents] = useState<EventRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [syncing, setSyncing] = useState(false)
    const [syncResult, setSyncResult] = useState<string | null>(null)

    const [weekStart, setWeekStart] = useState<Date>(() => getMondayOf(new Date()))

    const [parseInput, setParseInput] = useState('')
    const [parsePending, setParsePending] = useState(false)
    const [parsePreview, setParsePreview] = useState<ParsedEvent | null>(null)
    const [parseError, setParseError] = useState<string | null>(null)

    // Tracks the full date range currently in `events` — stored as ref so
    // updates don't trigger extra effect runs.
    const loadedRef = useRef<{ from: string; to: string } | null>(null)
    // Prevents concurrent fetches from overlapping.
    const fetchingRef = useRef(false)

    const mergeEvents = useCallback((incoming: EventRow[], from: string, to: string) => {
        setEvents(prev => {
            const map = new Map(prev.map(e => [e.id, e]))
            for (const e of incoming) map.set(e.id, e)
            return Array.from(map.values()).sort((a, b) =>
                a.event_date.localeCompare(b.event_date)
            )
        })
        const cur = loadedRef.current
        loadedRef.current = {
            from: cur ? (from < cur.from ? from : cur.from) : from,
            to:   cur ? (to   > cur.to   ? to   : cur.to)   : to,
        }
    }, [])

    const fetchRange = useCallback(async (from: string, to: string) => {
        if (fetchingRef.current) return
        fetchingRef.current = true
        try {
            const res = await fetch(`/api/calendar/events?from=${from}&to=${to}`)
            const json = await res.json()
            if (json.sucesso) mergeEvents(json.dados, from, to)
            else setError('Erro ao buscar eventos.')
        } finally {
            fetchingRef.current = false
        }
    }, [mergeEvents])

    // Replaces events within a range (used after mutations that may delete rows).
    const reloadLoadedRange = useCallback(async () => {
        if (!loadedRef.current) return
        const { from, to } = loadedRef.current
        const res = await fetch(`/api/calendar/events?from=${from}&to=${to}`)
        const json = await res.json()
        if (json.sucesso) {
            setEvents(prev => {
                const outside = prev.filter(e => e.event_date < from || e.event_date > to)
                return [...outside, ...(json.dados as EventRow[])].sort((a, b) =>
                    a.event_date.localeCompare(b.event_date)
                )
            })
        } else {
            setError('Erro ao buscar eventos.')
        }
    }, [])

    // Main loading effect: runs when weekStart changes.
    // • First run (no cache): loads 3 weeks (prev, current, next).
    // • Navigation to buffered week: no fetch.
    // • Approaching boundary (last buffered week): pre-loads 3 more weeks.
    // • Jump outside buffer (e.g. goToToday far away): loads 3 weeks around destination.
    useEffect(() => {
        const { from: weekFrom, to: weekTo } = getWeekRange(weekStart)
        const loaded = loadedRef.current

        if (!loaded) {
            setLoading(true)
            const from = addDays(weekFrom, -7)   // 1 week before
            const to   = addDays(weekFrom, 20)   // current + 2 more weeks
            fetchRange(from, to).finally(() => setLoading(false))
            return
        }

        // Jump to a week completely outside the buffer → reload around destination.
        if (weekFrom < loaded.from || weekTo > loaded.to) {
            setLoading(true)
            const from = addDays(weekFrom, -7)
            const to   = addDays(weekFrom, 20)
            fetchRange(from, to).finally(() => setLoading(false))
            return
        }

        // Approaching forward boundary (on the last buffered week) → pre-load.
        if (weekTo >= addDays(loaded.to, -6)) {
            fetchRange(addDays(loaded.to, 1), addDays(loaded.to, 21))
        }

        // Approaching backward boundary → pre-load.
        if (weekFrom <= addDays(loaded.from, 6)) {
            fetchRange(addDays(loaded.from, -21), addDays(loaded.from, -1))
        }
    }, [weekStart, fetchRange])

    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + i)
        return d
    })

    const goToPrevWeek = useCallback(() => {
        setWeekStart(prev => {
            const d = new Date(prev)
            d.setDate(d.getDate() - 7)
            return d
        })
    }, [])

    const goToNextWeek = useCallback(() => {
        setWeekStart(prev => {
            const d = new Date(prev)
            d.setDate(d.getDate() + 7)
            return d
        })
    }, [])

    const goToToday = useCallback(() => {
        setWeekStart(getMondayOf(new Date()))
    }, [])

    const parseText = useCallback(async () => {
        const text = parseInput.trim()
        if (!text) return

        try {
            setParsePending(true)
            setParseError(null)
            setParsePreview(null)

            const res = await fetch('/api/calendar/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })
            const json = await res.json()

            if (json.sucesso) setParsePreview(json.dados)
            else setParseError(json.erro.mensagem)
        } catch {
            setParseError('Erro ao interpretar texto.')
        } finally {
            setParsePending(false)
        }
    }, [parseInput])

    const confirmEvent = useCallback(async () => {
        if (!parsePreview) return

        try {
            const input: CreateEventInput = {
                title: parsePreview.title,
                event_type: parsePreview.event_type,
                event_date: parsePreview.event_date,
                location: parsePreview.location ?? undefined,
                starts_at: parsePreview.starts_at ?? undefined,
                ends_at: parsePreview.ends_at ?? undefined,
                all_day: parsePreview.all_day,
                recurrence_rule: parsePreview.recurrence_rule ?? undefined,
                metadata: parsePreview.metadata ?? {},
            }

            const res = await fetch('/api/calendar/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            })
            const json = await res.json()

            if (json.sucesso) {
                // Merge saved events directly into cache.
                const saved = json.dados as EventRow[]
                if (saved.length > 0) {
                    const dates = saved.map(e => e.event_date).sort()
                    mergeEvents(saved, dates[0], dates[dates.length - 1])
                }
                // Navigate to the week of the first created event.
                setWeekStart(getMondayOf(new Date(parsePreview.event_date + 'T12:00:00')))
                setParseInput('')
                setParsePreview(null)
            } else {
                setParseError(json.erro.mensagem)
            }
        } catch {
            setParseError('Erro ao salvar evento.')
        }
    }, [parsePreview, mergeEvents])

    const cancelParse = useCallback(() => {
        setParsePreview(null)
        setParseError(null)
    }, [])

    const deleteEvent = useCallback(async (id: string) => {
        setEvents(prev => prev.filter(e => e.id !== id))

        const res = await fetch(`/api/calendar/events/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!json.sucesso) {
            setError('Erro ao remover evento.')
            await reloadLoadedRange()
        }
    }, [reloadLoadedRange])

    const syncJira = useCallback(async () => {
        try {
            setSyncing(true)
            setSyncResult(null)

            const res = await fetch('/api/jira/sync', { method: 'POST' })
            const json = await res.json()

            if (json.sucesso) {
                setSyncResult(json.dados.mensagem)
                await reloadLoadedRange()
            } else {
                setError(json.erro.mensagem)
            }
        } catch {
            setError('Erro ao sincronizar Jira.')
        } finally {
            setSyncing(false)
        }
    }, [reloadLoadedRange])

    return {
        events,
        loading,
        error,
        weekDays,
        weekStart,
        goToPrevWeek,
        goToNextWeek,
        goToToday,
        parseInput,
        setParseInput,
        parsePending,
        parsePreview,
        parseError,
        parseText,
        confirmEvent,
        cancelParse,
        deleteEvent,
        syncing,
        syncResult,
        syncJira,
    }
}
