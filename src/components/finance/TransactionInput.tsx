'use client'

import { CATEGORY_LABELS, type ParsedTransaction } from '@/types/finance.types'

interface Props {
    value: string
    onChange: (v: string) => void
    onSubmit: () => void
    pending: boolean
    preview: ParsedTransaction | null
    error: string | null
    onConfirm: () => void
    onCancel: () => void
}

export function TransactionInput({
    value, onChange, onSubmit, pending,
    preview, error, onConfirm, onCancel,
}: Props) {

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !pending) onSubmit()
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Input row */}
            <div style={{
                display: 'flex',
                gap: 8,
                padding: '10px 14px',
                borderBottom: preview || error ? '0.5px solid var(--color-border-light)' : 'none',
            }}>
                <input
                    type="text"
                    placeholder='Ex: gastei 35 reais com comida na furb'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={pending || !!preview}
                    style={{
                        flex: 1,
                        fontSize: 13,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: 'var(--color-text-primary)',
                        opacity: pending || !!preview ? 0.5 : 1,
                    }}
                />
                <button
                    onClick={onSubmit}
                    disabled={!value.trim() || pending || !!preview}
                    style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '0.5px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                        cursor: !value.trim() || pending || !!preview ? 'not-allowed' : 'pointer',
                        opacity: !value.trim() || pending || !!preview ? 0.4 : 1,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {pending ? 'Interpretando...' : 'Interpretar'}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '10px 14px',
                    fontSize: 13,
                    color: 'var(--color-red-text)',
                    background: 'var(--color-red-bg)',
                }}>
                    {error}
                </div>
            )}

            {/* Preview — confirm before saving */}
            {preview && (
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 500 }}>
                        Confirmar transação
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <PreviewField label="Tipo" value={preview.type === 'expense' ? 'Gasto' : 'Receita'} />
                        <PreviewField label="Valor" value={`R$ ${preview.amount.toFixed(2)}`} highlight />
                        <PreviewField label="Categoria" value={CATEGORY_LABELS[preview.category]} />
                        <PreviewField label="Data" value={formatDate(preview.transaction_date)} />
                        {preview.description && (
                            <PreviewField label="Descrição" value={preview.description} />
                        )}
                        {preview.counterpart && (
                            <PreviewField label="Pessoa/Local" value={preview.counterpart} />
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={onConfirm}
                            style={{
                                flex: 1,
                                fontSize: 13,
                                padding: '8px',
                                borderRadius: 6,
                                border: 'none',
                                background: 'var(--color-purple)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontWeight: 500,
                            }}
                        >
                            Salvar
                        </button>
                        <button
                            onClick={onCancel}
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
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function PreviewField({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
    return (
        <div style={{ background: 'var(--color-bg)', borderRadius: 6, padding: '6px 10px' }}>
            <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginBottom: 2 }}>{label}</div>
            <div style={{
                fontSize: 13,
                fontWeight: highlight ? 600 : 400,
                color: highlight ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            }}>
                {value}
            </div>
        </div>
    )
}

function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
}