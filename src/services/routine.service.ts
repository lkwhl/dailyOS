import { createClient } from '@/lib/supabase/server'
import type {
    ReminderRow,
    TaskRow,
    PendingTaskRow,
    CreateReminderInput,
    UpdateReminderInput,
    CreateTaskInput,
    UpdateTaskInput,
} from '@/types/routine.types'

export async function getAllReminders(): Promise<ReminderRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('routine_reminders')
        .select('*')
        .order('reminder_time', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function getReminderById(id: string): Promise<ReminderRow | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('routine_reminders')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return null
    return data
}

export async function createReminder(input: CreateReminderInput): Promise<ReminderRow> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('routine_reminders')
        .insert(input)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}

export async function updateReminder(
    id: string,
    input: UpdateReminderInput
): Promise<ReminderRow> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('routine_reminders')
        .update(input)
        .eq('id', id)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}

export async function deleteReminder(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('routine_reminders')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
}


export async function getTasksByDate(date: string): Promise<TaskRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('routine_tasks')
        .select('*')
        .eq('task_date', date)
        .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function getPendingTasks(): Promise<PendingTaskRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('v_pending_tasks')
        .select('*')

    if (error) throw new Error(error.message)
    return data
}

export async function createTask(input: CreateTaskInput): Promise<TaskRow> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('routine_tasks')
        .insert(input)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}

export async function updateTask(
    id: string,
    input: UpdateTaskInput
): Promise<TaskRow> {
    const supabase = await createClient()

    const payload = {
        ...input,
        ...(input.is_completed === true && { completed_at: new Date().toISOString() }),
        ...(input.is_completed === false && { completed_at: null }),
    }

    const { data, error } = await supabase
        .from('routine_tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}

export async function deleteTask(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('routine_tasks')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
}