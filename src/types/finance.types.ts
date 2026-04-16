import { z } from 'zod'
import type { Database } from './database.types'

// ─── Database row types ───────────────────────────────────────────────────────

export type TransactionRow = Database['public']['Tables']['finance_transactions']['Row']
export type BillRow = Database['public']['Tables']['finance_bills']['Row']
export type BillMonthRow = Database['public']['Tables']['finance_bill_months']['Row']

// ─── Categories ───────────────────────────────────────────────────────────────

export const CATEGORIES = [
    'food',
    'transport',
    'health',
    'education',
    'entertainment',
    'bills',
    'transfer',
    'other',
] as const

export type Category = typeof CATEGORIES[number]

export const CATEGORY_LABELS: Record<Category, string> = {
    food: 'Alimentação',
    transport: 'Transporte',
    health: 'Saúde',
    education: 'Educação',
    entertainment: 'Lazer',
    bills: 'Contas fixas',
    transfer: 'Transferência',
    other: 'Outros',
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

export const createTransactionSchema = z.object({
    type: z.enum(['expense', 'income']),
    amount: z.number().positive('Valor deve ser positivo'),
    category: z.enum(CATEGORIES),
    description: z.string().max(200).optional(),
    transaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato inválido. Use YYYY-MM-DD'),
    raw_input: z.string().optional(),
    counterpart: z.string().max(100).optional(),
})

export const updateBillMonthSchema = z.object({
    amount: z.number().positive().optional(),
    is_paid: z.boolean().optional(),
})

// ─── Parser output schema (what AI returns) ───────────────────────────────────

export const parsedTransactionSchema = z.object({
    type: z.enum(['expense', 'income']),
    amount: z.number().positive(),
    category: z.enum(CATEGORIES),
    description: z.string(),
    transaction_date: z.string(),
    counterpart: z.string().optional(),
})

export type ParsedTransaction = z.infer<typeof parsedTransactionSchema>
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateBillMonthInput = z.infer<typeof updateBillMonthSchema>

export type MonthlySummary = {
    month: string
    total_expense: number
    total_income: number
    by_category: Record<Category, number>
}

export type BillWithStatus = BillRow & {
    this_month_amount: number | null
    is_paid: boolean
    paid_at: string | null
    due_date: string
    days_until_due: number
}

export type ApiResponse<T> = {
    sucesso: boolean
    dados: T | null
    erro: { codigo: string; mensagem: string } | null
}