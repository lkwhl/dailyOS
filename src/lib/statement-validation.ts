import { z } from 'zod'
import { CATEGORIES } from '@/types/finance.types'

export const statementTransactionSchema = z.object({
    date: z.string(),
    description: z.string(),
    amount: z.number().positive(),
    type: z.enum(['expense', 'income']),
    category: z.enum(CATEGORIES),
    counterpart: z.string().nullable().optional(),
})

export const dailyBalanceSchema = z.object({
    date: z.string(),
    balance: z.number(),
})

export const statementSchema = z.object({
    transactions: z.array(statementTransactionSchema),
    daily_balances: z.array(dailyBalanceSchema),
})

export type StatementTransaction = z.infer<typeof statementTransactionSchema>
export type DailyBalance = z.infer<typeof dailyBalanceSchema>
export type ParsedStatement = z.infer<typeof statementSchema>

export type BalanceValidation = {
    date: string
    expected: number
    calculated: number
    diff: number
    ok: boolean
}

export function validateBalances(
    transactions: StatementTransaction[],
    dailyBalances: DailyBalance[]
): BalanceValidation[] {
    const sorted = [...dailyBalances].sort((a, b) => a.date.localeCompare(b.date))
    const results: BalanceValidation[] = []

    for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]
        const curr = sorted[i]

        const dayTxs = transactions.filter(t => t.date > prev.date && t.date <= curr.date)
        const txSum = dayTxs.reduce(
            (sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount),
            0
        )

        const calculated = Math.round((prev.balance + txSum) * 100) / 100
        const diff = Math.round((calculated - curr.balance) * 100) / 100

        results.push({
            date: curr.date,
            expected: curr.balance,
            calculated,
            diff,
            ok: Math.abs(diff) < 0.02,
        })
    }

    return results
}
