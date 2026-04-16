'use client'

import type { BillWithStatus } from '@/types/finance.types'

interface Props {
    bills: BillWithStatus[]
    onTogglePaid: (id: string, isPaid: boolean) => void
    onSetAmount: (id: string, amount: number) => void
}

export function BillsList({ bills, onTogglePaid, onSetAmount }: Props) {
    if (bills.length === 0) {
        return (
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                Nenhuma conta cadastrada.
            </div>
        )
    }

    return (
        <div>
            {bills.map((bill) => (
                <BillRow
                    key={bill.id}
                    bill={bill}
                    onTogglePaid={onTogglePaid}
                    onSetAmount={onSetAmount}
                />
            ))}
        </div>
    )
}

function BillRow({ bill, onTogglePaid, onSetAmount }: {
    bill: BillWithStatus
    onTogglePaid: (id: string, isPaid: boolean) => void
    onSetAmount: (id: string, amount: number) => void
}) {
    const isOverdue = !bill.is_paid && bill.days_until_due < 0
    const isDueSoon = !bill.is_paid && bill.days_until_due >= 0 && bill.days_until_due <= 3

    function handleAmountClick() {
        const input = window.prompt(
            `Qual o valor da ${bill.name} esse mês?`,
            bill.this_month_amount?.toString() ?? ''
        )
        if (!input) return
        const amount = parseFloat(input.replace(',', '.'))
        if (isNaN(amount) || amount <= 0) return
        onSetAmount(bill.id, amount)
    }

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderBottom: '0.5px solid var(--color-border-light)',
            opacity: bill.is_paid ? 0.6 : 1,
        }}>

            {/* Paid toggle */}
            <button
                onClick={() => onTogglePaid(bill.id, bill.is_paid)}
                style={{
                    width: 18,
                    height: 18,
                    borderRadius: 4,
                    border: bill.is_paid ? 'none' : '1.5px solid var(--color-border)',
                    background: bill.is_paid ? 'var(--color-green)' : 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                }}
            >
                {bill.is_paid && (
                    <svg width="9" height="9" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            {/* Name + due date */}
            <div style={{ flex: 1 }}>
                <div style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    textDecoration: bill.is_paid ? 'line-through' : 'none',
                }}>
                    {bill.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 1 }}>
                    {bill.is_paid
                        ? 'Pago'
                        : isOverdue
                            ? `Venceu há ${Math.abs(bill.days_until_due)} dia${Math.abs(bill.days_until_due) !== 1 ? 's' : ''}`
                            : bill.days_until_due === 0
                                ? 'Vence hoje'
                                : `Vence em ${bill.days_until_due} dia${bill.days_until_due !== 1 ? 's' : ''}`
                    }
                </div>
            </div>

            {/* Amount */}
            <button
                onClick={handleAmountClick}
                style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: bill.this_month_amount
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-faint)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    borderRadius: 4,
                }}
            >
                {bill.this_month_amount
                    ? `R$ ${Number(bill.this_month_amount).toFixed(2)}`
                    : 'Informar valor'
                }
            </button>

            {/* Status badge */}
            {!bill.is_paid && (isOverdue || isDueSoon) && (
                <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 20,
                    flexShrink: 0,
                    background: isOverdue ? 'var(--color-red-bg)' : 'var(--color-amber-bg)',
                    color: isOverdue ? 'var(--color-red-text)' : 'var(--color-amber)',
                }}>
                    {isOverdue ? 'vencida' : 'vence em breve'}
                </span>
            )}
        </div>
    )
}