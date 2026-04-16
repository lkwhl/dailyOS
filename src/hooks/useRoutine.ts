'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
    ReminderRow,
    TaskRow,
    CreateReminderInput,
    CreateTaskInput,
} from '@/types/routine.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayISO() {
    return new Date().toISOString().split('T')[0]
}

export function useRoutine() {
    const [reminders, setReminders] = useState<ReminderRow[]>([])
    const [tasks, setTasks] = useState<TaskRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)


    const fetchReminders = useCallback(async () => {
        const res = await fetch('/api/routine/reminders')
        const json = await res.json()
        if (json.sucesso) setReminders(json.dados)
    }, [])

    const fetchTasks = useCallback(async (date = todayISO()) => {
        const res = await fetch(`/api/routine/tasks?date=${date}`)
        const json = await res.json()
        if (json.sucesso) setTasks(json.dados)
    }, [])

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                await Promise.all([fetchReminders(), fetchTasks()])
            } catch {
                setError('Erro ao carregar rotina.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [fetchReminders, fetchTasks])


    const createTask = useCallback(async (input: CreateTaskInput) => {
        const res = await fetch('/api/routine/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        })
        const json = await res.json()
        if (json.sucesso) setTasks((prev) => [...prev, json.dados])
        return json
    }, [])

    const toggleTask = useCallback(async (id: string, current: boolean) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, is_completed: !current } : t))
        )

        const res = await fetch(`/api/routine/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_completed: !current }),
        })
        const json = await res.json()

        if (!json.sucesso) {
            setTasks((prev) =>
                prev.map((t) => (t.id === id ? { ...t, is_completed: current } : t))
            )
            setError('Erro ao atualizar tarefa.')
        }
    }, [])

    const deleteTask = useCallback(async (id: string) => {
        setTasks((prev) => prev.filter((t) => t.id !== id))

        const res = await fetch(`/api/routine/tasks/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!json.sucesso) {
            setError('Erro ao remover tarefa.')
            await fetchTasks()
        }
    }, [fetchTasks])

    const createReminder = useCallback(async (input: CreateReminderInput) => {
        const res = await fetch('/api/routine/reminders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        })
        const json = await res.json()
        if (json.sucesso) setReminders((prev) => [...prev, json.dados])
        return json
    }, [])

    const toggleReminder = useCallback(async (id: string, current: boolean) => {
        setReminders((prev) =>
            prev.map((r) => (r.id === id ? { ...r, is_active: !current } : r))
        )

        const res = await fetch(`/api/routine/reminders/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ is_active: !current }),
        })
        const json = await res.json()

        if (!json.sucesso) {
            setReminders((prev) =>
                prev.map((r) => (r.id === id ? { ...r, is_active: current } : r))
            )
            setError('Erro ao atualizar lembrete.')
        }
    }, [])

    const deleteReminder = useCallback(async (id: string) => {
        setReminders((prev) => prev.filter((r) => r.id !== id))

        const res = await fetch(`/api/routine/reminders/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!json.sucesso) {
            setError('Erro ao remover lembrete.')
            await fetchReminders()
        }
    }, [fetchReminders])

    return {
        reminders,
        tasks,
        loading,
        error,
        createTask,
        toggleTask,
        deleteTask,
        createReminder,
        toggleReminder,
        deleteReminder,
        refetchTasks: fetchTasks,
    }
}