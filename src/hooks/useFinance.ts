'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
    TransactionRow,
    BillWithStatus,
    MonthlySummary,
    ParsedTransaction,
    CreateTransactionInput,
} from '@/types/finance.types'

export function useFinance() {
    const [transactions, setTransactions] = useState<TransactionRow[]>([])
    const [bills, setBills] = useState<BillWithStatus[]>([])
    const [summary, setSummary] = useState<MonthlySummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [parseInput, setParseInput] = useState('')
    const [parsePending, setParsePending] = useState(false)
    const [parsePreview, setParsePreview] = useState<ParsedTransaction | null>(null)
    const [parseError, setParseError] = useState<string | null>(null)

    function currentMonthRange() {
        const now = new Date()
        const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
        const to = now.toISOString().split('T')[0]
        return { from, to }
    }

    const fetchTransactions = useCallback(async () => {
        const { from, to } = currentMonthRange()
        const res = await fetch(`/api/finance/transactions?from=${from}&to=${to}`)
        const json = await res.json()
        if (json.sucesso) setTransactions(json.dados)
    }, [])

    const fetchBills = useCallback(async () => {
        const res = await fetch('/api/finance/bills')
        const json = await res.json()
        if (json.sucesso) setBills(json.dados)
    }, [])

    const fetchSummary = useCallback(async () => {
        const now = new Date()
        const res = await fetch(
            `/api/finance/transactions?from=${currentMonthRange().from}&to=${currentMonthRange().to}`
        )
        const json = await res.json()
        if (!json.sucesso) return

        const rows: TransactionRow[] = json.dados
        const s: MonthlySummary = {
            month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
            total_expense: 0,
            total_income: 0,
            by_category: {} as MonthlySummary['by_category'],
        }

        for (const row of rows) {
            const amount = Number(row.amount)
            if (row.type === 'expense') {
                s.total_expense += amount
                const cat = row.category as keyof MonthlySummary['by_category']
                s.by_category[cat] = (s.by_category[cat] ?? 0) + amount
            } else {
                s.total_income += amount
            }
        }

        s.total_expense = Math.round(s.total_expense * 100) / 100
        s.total_income = Math.round(s.total_income * 100) / 100

        setSummary(s)
    }, [])

    useEffect(() => {
        async function load() {
            try {
                setLoading(true)
                await Promise.all([fetchTransactions(), fetchBills(), fetchSummary()])
            } catch {
                setError('Erro ao carregar financeiro.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [fetchTransactions, fetchBills, fetchSummary])

    const parseText = useCallback(async () => {
        const text = parseInput.trim()
        if (!text) return

        try {
            setParsePending(true)
            setParseError(null)
            setParsePreview(null)

            const res = await fetch('/api/finance/parse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            })
            const json = await res.json()

            if (json.sucesso) {
                setParsePreview(json.dados)
            } else {
                setParseError(json.erro.mensagem)
            }
        } catch {
            setParseError('Erro ao interpretar texto.')
        } finally {
            setParsePending(false)
        }
    }, [parseInput])

    const confirmTransaction = useCallback(async () => {
        if (!parsePreview) return

        try {
            const input: CreateTransactionInput = {
                ...parsePreview,
                raw_input: parseInput,
            }

            const res = await fetch('/api/finance/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            })
            const json = await res.json()

            if (json.sucesso) {
                setTransactions((prev) => [json.dados, ...prev])
                await fetchSummary()
                setParseInput('')
                setParsePreview(null)
            } else {
                setParseError(json.erro.mensagem)
            }
        } catch {
            setParseError('Erro ao salvar transação.')
        }
    }, [parsePreview, parseInput, fetchSummary])

    const cancelParse = useCallback(() => {
        setParsePreview(null)
        setParseError(null)
    }, [])

    const deleteTransaction = useCallback(async (id: string) => {
        setTransactions((prev) => prev.filter((t) => t.id !== id))

        const res = await fetch(`/api/finance/transactions/${id}`, { method: 'DELETE' })
        const json = await res.json()

        if (!json.sucesso) {
            setError('Erro ao remover transação.')
            await fetchTransactions()
        } else {
            await fetchSummary()
        }
    }, [fetchTransactions, fetchSummary])

    const importTransactions = useCallback(async (
        inputs: CreateTransactionInput[]
    ) => {
        const results = await Promise.all(
            inputs.map((input) =>
                fetch('/api/finance/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(input),
                }).then((r) => r.json())
            )
        )

        const saved = results
            .filter((r) => r.sucesso)
            .map((r) => r.dados)

        setTransactions((prev) => [...saved, ...prev])
        await fetchSummary()
    }, [fetchSummary])

    const updateBill = useCallback(async (
        id: string,
        payload: { amount?: number; is_paid?: boolean }
    ) => {
        // Optimistic update
        setBills((prev) =>
            prev.map((b) => b.id === id ? { ...b, ...payload } : b)
        )

        const res = await fetch(`/api/finance/bills/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })
        const json = await res.json()

        if (!json.sucesso) {
            setError('Erro ao atualizar conta.')
            await fetchBills()
        }
    }, [fetchBills])

    return {
        transactions,
        bills,
        summary,
        loading,
        error,
        parseInput,
        setParseInput,
        parsePending,
        parsePreview,
        parseError,
        parseText,
        confirmTransaction,
        cancelParse,
        deleteTransaction,
        updateBill,
        importTransactions
    }

}