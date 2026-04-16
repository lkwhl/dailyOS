import { createClient } from '@/lib/supabase/server'
import type {
    TransactionRow,
    BillRow,
    BillMonthRow,
    BillWithStatus,
    MonthlySummary,
    CreateTransactionInput,
    UpdateBillMonthInput,
    Category,
} from '@/types/finance.types'

export async function getTransactionsByMonth(
    year: number,
    month: number
): Promise<TransactionRow[]> {
    const supabase = await createClient()

    const from = `${year}-${String(month).padStart(2, '0')}-01`
    const to = new Date(year, month, 0).toISOString().slice(0, 10)

    const { data, error } = await supabase
        .from('finance_transactions')
        .select('*')
        .gte('transaction_date', from)
        .lte('transaction_date', to)
        .order('transaction_date', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function getTransactionsByDateRange(
    from: string,
    to: string
): Promise<TransactionRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('finance_transactions')
        .select('*')
        .gte('transaction_date', from)
        .lte('transaction_date', to)
        .order('transaction_date', { ascending: false })

    if (error) throw new Error(error.message)
    return data
}

export async function createTransaction(
    input: CreateTransactionInput
): Promise<TransactionRow> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('finance_transactions')
        .insert(input)
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}

export async function deleteTransaction(id: string): Promise<void> {
    const supabase = await createClient()

    const { error } = await supabase
        .from('finance_transactions')
        .delete()
        .eq('id', id)

    if (error) throw new Error(error.message)
}

export async function getMonthlySummary(
    year: number,
    month: number
): Promise<MonthlySummary> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('finance_transactions')
        .select('type, amount, category')
        .gte('transaction_date', `${year}-${String(month).padStart(2, '0')}-01`)
        .lte('transaction_date', `${year}-${String(month).padStart(2, '0')}-31`)

    if (error) throw new Error(error.message)

    const summary: MonthlySummary = {
        month: `${year}-${String(month).padStart(2, '0')}`,
        total_expense: 0,
        total_income: 0,
        by_category: {} as Record<Category, number>,
    }

    for (const row of data) {
        const amount = Number(row.amount)

        if (row.type === 'expense') {
            summary.total_expense += amount
            const cat = row.category as Category
            summary.by_category[cat] = (summary.by_category[cat] ?? 0) + amount
        } else {
            summary.total_income += amount
        }
    }

    // Round all values to 2 decimal places
    summary.total_expense = Math.round(summary.total_expense * 100) / 100
    summary.total_income = Math.round(summary.total_income * 100) / 100

    return summary
}

export async function getAllBills(): Promise<BillRow[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('finance_bills')
        .select('*')
        .eq('is_active', true)
        .order('due_day', { ascending: true })

    if (error) throw new Error(error.message)
    return data
}

export async function getBillsThisMonth(): Promise<BillWithStatus[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('v_bills_this_month')
        .select('*')

    if (error) throw new Error(error.message)
    return data as BillWithStatus[]
}

export async function getBillMonth(
    billId: string,
    referenceMonth: string
): Promise<BillMonthRow | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('finance_bill_months')
        .select('*')
        .eq('bill_id', billId)
        .eq('reference_month', referenceMonth)
        .single()

    if (error) return null
    return data
}

export async function upsertBillMonth(
    billId: string,
    referenceMonth: string,
    input: UpdateBillMonthInput
): Promise<BillMonthRow> {
    const supabase = await createClient()

    const payload = {
        bill_id: billId,
        reference_month: referenceMonth,
        ...input,
        ...(input.is_paid === true && { paid_at: new Date().toISOString() }),
        ...(input.is_paid === false && { paid_at: null }),
    }

    const { data, error } = await supabase
        .from('finance_bill_months')
        .upsert(payload, { onConflict: 'bill_id,reference_month' })
        .select()
        .single()

    if (error) throw new Error(error.message)
    return data
}