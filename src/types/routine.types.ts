import { z } from 'zod'
import type { Database } from './database.types'

export type ReminderRow = Database['public']['Tables']['routine_reminders']['Row']
export type TaskRow = Database['public']['Tables']['routine_tasks']['Row']
export type PendingTaskRow = Database['public']['Views']['v_pending_tasks']['Row']

export const createReminderSchema = z.object({
    title: z.string().min(1, 'Título obrigatório').max(100),
    reminder_time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato inválido. Use HH:MM'),
    days_of_week: z.array(z.number().min(1).max(7)).min(1, 'Selecione ao menos um dia'),
    snooze_options: z.array(z.number()).optional().default([15, 60]),
})

export const updateReminderSchema = createReminderSchema.partial().extend({
    is_active: z.boolean().optional(),
})

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Título obrigatório').max(200),
    task_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
})

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    is_completed: z.boolean().optional(),
})

export type CreateReminderInput = z.input<typeof createReminderSchema>
export type UpdateReminderInput = z.infer<typeof updateReminderSchema>
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export type ApiResponse<T> = {
    sucesso: boolean
    dados: T | null
    erro: { codigo: string; mensagem: string } | null
}