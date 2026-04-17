'use client'

import { useState } from 'react'
import { CATEGORY_LABELS, type TransactionRow } from '@/types/finance.types'

interface Props {
    transactions: TransactionRow[]
    onDelete: (id: string) => void
}

export function TransactionList({ transactions, onDelete }: Props) {
    if (transactions.length === 0) {
        return (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                Nenhuma transação este mês.
            </div>
        )
    }

    // Group by date
    const grouped = transactions.reduce<Record<string, TransactionRow[]>>((acc, t) => {
        const date = t.transaction_date
        if (!acc[date]) acc[date] = []
        acc[date].push(t)
        return acc
    }, {})

    return (
        <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {Object.entries(grouped).map(([date, rows]) => (
                <div key={date}>
                    <div style={{
                        padding: '5px 14px',
                        fontSize: 11,
                        color: 'var(--color-text-faint)',
                        background: 'var(--color-bg)',
                        borderBottom: '0.5px solid var(--color-border-light)',
                        fontWeight: 500,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                    }}>
                        {formatDateLabel(date)}
                    </div>
                    {rows.map((t) => (
                        <TransactionRow key={t.id} transaction={t} onDelete={onDelete} />
                    ))}
                </div>
            ))}
        </div>
    )
}

function TransactionRow({
    transaction: t,
    onDelete,
}: {
    transaction: TransactionRow
    onDelete: (id: string) => void
}) {
    const [hovered, setHovered] = useState(false)
    const isExpense = t.type === 'expense'

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 14px',
                borderBottom: '0.5px solid var(--color-border-light)',
                background: hovered ? '#fafaf8' : 'transparent',
            }}
        >
            {/* Category dot */}
            <div style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'var(--color-bg)',
                border: '0.5px solid var(--color-border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                flexShrink: 0,
            }}>
                {getCategoryEmoji(t.category)}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 13,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {t.description ?? CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS]}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                    {CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS]}
                    {t.counterpart ? ` · ${t.counterpart}` : ''}
                </div>
            </div>

            {/* Amount */}
            <span style={{
                fontSize: 13,
                fontWeight: 500,
                color: isExpense ? 'var(--color-red-text)' : 'var(--color-green)',
                flexShrink: 0,
            }}>
                {isExpense ? '-' : '+'}R$ {Number(t.amount).toFixed(2)}
            </span>

            {/* Delete */}
            {hovered && (
                <button
                    onClick={() => onDelete(t.id)}
                    style={{
                        fontSize: 11,
                        color: 'var(--color-text-faint)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        flexShrink: 0,
                    }}
                >
                    ✕
                </button>
            )}
        </div>
    )
}

function getCategoryEmoji(category: string): string {
    const map: Record<string, string> = {
        food: '🍽',
        transport: '🚌',
        health: '💊',
        education: '📚',
        entertainment: '🎮',
        bills: '📄',
        transfer: '💸',
        other: '📦',
    }
    return map[category] ?? '📦'
}

function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr + 'T12:00:00')
    const today = new Date()
    const diff = Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diff === 0) return 'Hoje'
    if (diff === 1) return 'Ontem'

    return date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}