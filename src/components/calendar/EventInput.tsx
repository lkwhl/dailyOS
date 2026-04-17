'use client'

import { EVENT_TYPE_LABELS, type ParsedEvent } from '@/types/calendar.types'

interface Props {
    value: string
    onChange: (v: string) => void
    onSubmit: () => void
    pending: boolean
    preview: ParsedEvent | null
    error: string | null
    onConfirm: () => void
    onCancel: () => void
}

export function EventInput({
    value, onChange, onSubmit, pending,
    preview, error, onConfirm, onCancel,
}: Props) {

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !pending) onSubmit()
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {/* Input */}
            <div style={{
                display: 'flex',
                gap: 8,
                padding: '10px 14px',
                borderBottom: preview || error ? '0.5px solid var(--color-border-light)' : 'none',
            }}>
                <input
                    type="text"
                    placeholder="Ex: Toda terça até junho tenho aula de BD na S432"
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

            {/* Preview */}
            {preview && (
                <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{
                        fontSize: 11,
                        color: 'var(--color-text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontWeight: 500,
                    }}>
                        Confirmar evento
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <PreviewField label="Título" value={preview.title} highlight />
                        <PreviewField label="Tipo" value={EVENT_TYPE_LABELS[preview.event_type]} />
                        <PreviewField label="Data" value={formatDate(preview.event_date)} />
                        {preview.starts_at && (
                            <PreviewField label="Horário" value={preview.starts_at.slice(0, 5)} />
                        )}
                        {preview.location && (
                            <PreviewField label="Local" value={preview.location} />
                        )}
                        {preview.recurrence_rule && (
                            <PreviewField
                                label="Recorrência"
                                value={formatRecurrence(preview.recurrence_rule)}
                            />
                        )}
                    </div>

                    {preview.recurrence_rule && (
                        <div style={{
                            fontSize: 12,
                            background: 'var(--color-purple-bg)',
                            borderRadius: 6,
                            padding: '6px 10px',
                            color: 'var(--color-purple-text)',
                        }}>
                            Serão criadas múltiplas ocorrências no calendário.
                        </div>
                    )}

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

function PreviewField({ label, value, highlight }: {
    label: string
    value: string
    highlight?: boolean
}) {
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

function formatDate(dateStr: string): string {
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
}

function formatRecurrence(rule: ParsedEvent['recurrence_rule']): string {
    if (!rule) return ''

    const freqMap: Record<string, string> = {
        daily: 'Todo dia',
        weekly: 'Toda semana',
        monthly: 'Todo mês',
    }

    const dayMap: Record<number, string> = {
        1: 'seg', 2: 'ter', 3: 'qua',
        4: 'qui', 5: 'sex', 6: 'sáb', 7: 'dom',
    }

    let label = freqMap[rule.frequency] ?? rule.frequency

    if (rule.interval > 1) label = `A cada ${rule.interval} semanas`

    if (rule.days_of_week?.length) {
        label += ` (${rule.days_of_week.map((d) => dayMap[d]).join(', ')})`
    }

    if (rule.ends_on) label += ` até ${formatDate(rule.ends_on)}`

    return label
}