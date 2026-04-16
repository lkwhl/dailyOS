'use client'

import { useFinance } from '@/hooks/useFinance'
import { TransactionInput } from '@/components/finance/TransactionInput'
import { TransactionList } from '@/components/finance/TransactionList'
import { BillsList } from '@/components/finance/BillsList'
import { CATEGORY_LABELS } from '@/types/finance.types'
import { StatementImport } from '@/components/finance/StatementImport'

function SectionCard({ title, color, meta, children }: {
    title: string
    color: string
    meta?: string
    children: React.ReactNode
}) {
    return (
        <div style={{
            background: 'var(--color-card)',
            border: '0.5px solid var(--color-border)',
            borderRadius: 12,
            overflow: 'hidden',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 14px',
                borderBottom: '0.5px solid var(--color-border-light)',
            }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                <span style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.04em', flex: 1,
                }}>
                    {title}
                </span>
                {meta && <span style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>{meta}</span>}
            </div>
            {children}
        </div>
    )
}

export default function FinanceiroPage() {
    const {
        transactions, bills, summary, loading, error,
        parseInput, setParseInput, parsePending, parsePreview, parseError,
        parseText, confirmTransaction, cancelParse,
        deleteTransaction, updateBill, importTransactions,
    } = useFinance()

    if (loading) {
        return <div style={{ padding: '2rem', fontSize: 13, color: 'var(--color-text-muted)' }}>Carregando...</div>
    }

    const unpaidBills = bills.filter((b) => !b.is_paid).length

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640, margin: '0 auto' }}>

            <div>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>Financeiro</h1>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </p>
            </div>

            {error && (
                <div style={{ fontSize: 13, padding: '10px 14px', borderRadius: 8, background: 'var(--color-red-bg)', color: 'var(--color-red-text)' }}>
                    {error}
                </div>
            )}

            {/* Summary cards */}
            {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div style={{
                        background: 'var(--color-card)', border: '0.5px solid var(--color-border)',
                        borderRadius: 10, padding: '12px 14px',
                    }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Saídas</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-red-text)' }}>
                            R$ {summary.total_expense.toFixed(2)}
                        </div>
                    </div>
                    <div style={{
                        background: 'var(--color-card)', border: '0.5px solid var(--color-border)',
                        borderRadius: 10, padding: '12px 14px',
                    }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Entradas</div>
                        <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-green)' }}>
                            R$ {summary.total_income.toFixed(2)}
                        </div>
                    </div>
                    <div style={{
                        background: 'var(--color-card)', border: '0.5px solid var(--color-border)',
                        borderRadius: 10, padding: '12px 14px',
                    }}>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 4 }}>Saldo</div>
                        <div style={{
                            fontSize: 18, fontWeight: 600,
                            color: (summary.total_income - summary.total_expense) >= 0
                                ? 'var(--color-green)'
                                : 'var(--color-red-text)',
                        }}>
                            R$ {(summary.total_income - summary.total_expense).toFixed(2)}
                        </div>
                    </div>
                </div>
            )}

            <StatementImport onImport={importTransactions} />

            {/* Transaction input */}
            <SectionCard title="Nova transação" color="var(--color-purple)">
                <TransactionInput
                    value={parseInput}
                    onChange={setParseInput}
                    onSubmit={parseText}
                    pending={parsePending}
                    preview={parsePreview}
                    error={parseError}
                    onConfirm={confirmTransaction}
                    onCancel={cancelParse}
                />
            </SectionCard>

            {/* Transactions */}
            <SectionCard
                title="Transações"
                color="var(--color-blue)"
                meta={`${transactions.length} este mês`}
            >
                <TransactionList
                    transactions={transactions}
                    onDelete={deleteTransaction}
                />
            </SectionCard>

            {/* Bills */}
            <SectionCard
                title="Contas fixas"
                color="var(--color-coral)"
                meta={unpaidBills > 0 ? `${unpaidBills} pendente${unpaidBills > 1 ? 's' : ''}` : 'Em dia'}
            >
                <BillsList
                    bills={bills}
                    onTogglePaid={(id, isPaid) => updateBill(id, { is_paid: !isPaid })}
                    onSetAmount={(id, amount) => updateBill(id, { amount })}
                />
            </SectionCard>

        </div>
    )
}