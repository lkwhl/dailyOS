'use client'

import { useState } from 'react'
import type { StatementTransaction } from '@/lib/anthropic/statement-parser'
import type { CreateTransactionInput } from '@/types/finance.types'

interface Props {
    onImport: (transactions: CreateTransactionInput[]) => Promise<void>
}

export function StatementImport({ onImport }: Props) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [preview, setPreview] = useState<StatementTransaction[] | null>(null)
    const [selected, setSelected] = useState<Set<number>>(new Set())
    const [saving, setSaving] = useState(false)

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setLoading(true)
        setError(null)
        setPreview(null)

        try {
            // Convert PDF to base64
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve((reader.result as string).split(',')[1])
                reader.onerror = () => reject(new Error('Erro ao ler arquivo'))
                reader.readAsDataURL(file)
            })

            const res = await fetch('/api/finance/statement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdf: base64 }),
            })
            const json = await res.json()

            if (!json.sucesso) {
                setError(json.erro.mensagem)
                return
            }

            const transactions: StatementTransaction[] = json.dados.transactions
            setPreview(transactions)
            // Select all by default
            setSelected(new Set(transactions.map((_, i) => i)))
        } catch {
            setError('Erro ao processar o arquivo.')
        } finally {
            setLoading(false)
        }
    }

    function toggleRow(index: number) {
        setSelected((prev) => {
            const next = new Set(prev)
            next.has(index) ? next.delete(index) : next.add(index)
            return next
        })
    }

    function toggleAll() {
        if (!preview) return
        setSelected((prev) =>
            prev.size === preview.length
                ? new Set()
                : new Set(preview.map((_, i) => i))
        )
    }

    async function handleConfirm() {
        if (!preview) return
        setSaving(true)

        const toImport: CreateTransactionInput[] = preview
            .filter((_, i) => selected.has(i))
            .map((t) => ({
                type: t.type,
                amount: Math.abs(t.amount),
                category: t.type === 'income' ? 'transfer' : 'other',
                description: t.description,
                transaction_date: t.date,
                raw_input: `importado do extrato: ${t.description}`,
            }))

        await onImport(toImport)
        setPreview(null)
        setSelected(new Set())
        setOpen(false)
        setSaving(false)
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                style={{
                    fontSize: 12,
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '0.5px solid var(--color-border)',
                    background: 'transparent',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                }}
            >
                Importar extrato PDF
            </button>
        )
    }

    return (
        <div style={{
            background: 'var(--color-card)',
            border: '0.5px solid var(--color-border)',
            borderRadius: 12,
            overflow: 'hidden',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderBottom: '0.5px solid var(--color-border-light)',
            }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
                    Importar extrato
                </span>
                <button
                    onClick={() => { setOpen(false); setPreview(null); setError(null) }}
                    style={{ fontSize: 11, color: 'var(--color-text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                    ✕
                </button>
            </div>

            <div style={{ padding: '14px' }}>

                {/* File input — only show if no preview */}
                {!preview && (
                    <>
                        <label style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            padding: '24px',
                            borderRadius: 8,
                            border: '1px dashed var(--color-border)',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                        }}>
                            <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                                {loading ? 'Interpretando extrato...' : 'Clique para selecionar o PDF do extrato'}
                            </span>
                            <span style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>
                                Apenas arquivos .pdf
                            </span>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFile}
                                disabled={loading}
                                style={{ display: 'none' }}
                            />
                        </label>

                        {error && (
                            <div style={{
                                marginTop: 10,
                                fontSize: 13,
                                padding: '8px 12px',
                                borderRadius: 6,
                                background: 'var(--color-red-bg)',
                                color: 'var(--color-red-text)',
                            }}>
                                {error}
                            </div>
                        )}
                    </>
                )}

                {/* Preview table */}
                {preview && (
                    <>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: 10,
                        }}>
                            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                {selected.size} de {preview.length} selecionadas
                            </span>
                            <button
                                onClick={toggleAll}
                                style={{
                                    fontSize: 11,
                                    color: 'var(--color-text-info)',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                {selected.size === preview.length ? 'Desmarcar todas' : 'Selecionar todas'}
                            </button>
                        </div>

                        <div style={{
                            maxHeight: 320,
                            overflowY: 'auto',
                            border: '0.5px solid var(--color-border-light)',
                            borderRadius: 8,
                            marginBottom: 12,
                        }}>
                            {preview.map((t, i) => (
                                <div
                                    key={i}
                                    onClick={() => toggleRow(i)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        padding: '8px 12px',
                                        borderBottom: i < preview.length - 1 ? '0.5px solid var(--color-border-light)' : 'none',
                                        cursor: 'pointer',
                                        opacity: selected.has(i) ? 1 : 0.4,
                                        background: selected.has(i) ? 'transparent' : 'var(--color-bg)',
                                    }}
                                >
                                    {/* Checkbox */}
                                    <div style={{
                                        width: 14,
                                        height: 14,
                                        borderRadius: 3,
                                        border: selected.has(i) ? 'none' : '1.5px solid var(--color-border)',
                                        background: selected.has(i) ? 'var(--color-purple)' : 'transparent',
                                        flexShrink: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        {selected.has(i) && (
                                            <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                                                <path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                                            </svg>
                                        )}
                                    </div>

                                    {/* Date */}
                                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)', flexShrink: 0, minWidth: 70 }}>
                                        {formatDate(t.date)}
                                    </span>

                                    {/* Description */}
                                    <span style={{
                                        fontSize: 12,
                                        color: 'var(--color-text-primary)',
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {t.description}
                                    </span>

                                    {/* Amount */}
                                    <span style={{
                                        fontSize: 12,
                                        fontWeight: 500,
                                        color: t.type === 'expense' ? 'var(--color-red-text)' : 'var(--color-green)',
                                        flexShrink: 0,
                                    }}>
                                        {t.type === 'expense' ? '-' : '+'}R$ {Math.abs(t.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                onClick={handleConfirm}
                                disabled={selected.size === 0 || saving}
                                style={{
                                    flex: 1,
                                    fontSize: 13,
                                    padding: '8px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: 'var(--color-purple)',
                                    color: '#fff',
                                    cursor: selected.size === 0 || saving ? 'not-allowed' : 'pointer',
                                    opacity: selected.size === 0 || saving ? 0.5 : 1,
                                    fontWeight: 500,
                                }}
                            >
                                {saving ? 'Salvando...' : `Importar ${selected.size} transações`}
                            </button>
                            <button
                                onClick={() => { setPreview(null); setSelected(new Set()) }}
                                style={{
                                    fontSize: 13,
                                    padding: '8px 14px',
                                    borderRadius: 6,
                                    border: '0.5px solid var(--color-border)',
                                    background: 'transparent',
                                    color: 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                }}
                            >
                                Voltar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
}