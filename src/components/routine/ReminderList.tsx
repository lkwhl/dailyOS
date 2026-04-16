'use client'

import { useState } from 'react'
import type { ReminderRow, CreateReminderInput } from '@/types/routine.types'

const DAY_LABELS = ['', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const ALL_DAYS = [1, 2, 3, 4, 5, 6, 7]

interface Props {
    reminders: ReminderRow[]
    onToggle: (id: string, current: boolean) => void
    onDelete: (id: string) => void
    onCreate: (input: CreateReminderInput) => void
}

export function ReminderList({ reminders, onToggle, onDelete, onCreate }: Props) {
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState('')
    const [time, setTime] = useState('08:00')
    const [days, setDays] = useState<number[]>(ALL_DAYS)

    function toggleDay(day: number) {
        setDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        )
    }

    async function handleCreate() {
        if (!title.trim() || days.length === 0) return
        await onCreate({ title: title.trim(), reminder_time: time, days_of_week: days })
        setTitle('')
        setTime('08:00')
        setDays(ALL_DAYS)
        setShowForm(false)
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            {reminders.length === 0 && !showForm && (
                <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Nenhum lembrete cadastrado.
                </div>
            )}

            {reminders.map((reminder) => (
                <div
                    key={reminder.id}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '10px 14px',
                        borderBottom: '0.5px solid var(--color-border-light)',
                    }}
                >
                    <button
                        onClick={() => onToggle(reminder.id, reminder.is_active)}
                        style={{
                            width: 32,
                            height: 18,
                            borderRadius: 9,
                            border: 'none',
                            background: reminder.is_active ? 'var(--color-purple)' : 'var(--color-border)',
                            cursor: 'pointer',
                            position: 'relative',
                            flexShrink: 0,
                            transition: 'background 0.2s',
                            padding: 0,
                        }}
                    >
                        <span style={{
                            position: 'absolute',
                            top: 2,
                            left: reminder.is_active ? 16 : 2,
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: '#fff',
                            transition: 'left 0.2s',
                        }} />
                    </button>

                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: 13,
                            fontWeight: 500,
                            color: reminder.is_active
                                ? 'var(--color-text-primary)'
                                : 'var(--color-text-faint)',
                        }}>
                            {reminder.title}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                            {reminder.reminder_time.slice(0, 5)} ·{' '}
                            {reminder.days_of_week.length === 7
                                ? 'todo dia'
                                : reminder.days_of_week.map((d) => DAY_LABELS[d]).join(', ')}
                        </div>
                    </div>

                    <button
                        onClick={() => onDelete(reminder.id)}
                        style={{
                            fontSize: 11,
                            color: 'var(--color-text-faint)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px 4px',
                        }}
                    >
                        ✕
                    </button>
                </div>
            ))}

            {showForm && (
                <div style={{
                    padding: '12px 14px',
                    borderBottom: '0.5px solid var(--color-border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                }}>
                    <input
                        type="text"
                        placeholder="Nome do lembrete"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{
                            fontSize: 13,
                            border: '0.5px solid var(--color-border)',
                            borderRadius: 6,
                            padding: '6px 10px',
                            outline: 'none',
                            color: 'var(--color-text-primary)',
                        }}
                    />
                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        style={{
                            fontSize: 13,
                            border: '0.5px solid var(--color-border)',
                            borderRadius: 6,
                            padding: '6px 10px',
                            outline: 'none',
                            color: 'var(--color-text-primary)',
                        }}
                    />
                    <div style={{ display: 'flex', gap: 4 }}>
                        {ALL_DAYS.map((d) => (
                            <button
                                key={d}
                                onClick={() => toggleDay(d)}
                                style={{
                                    flex: 1,
                                    fontSize: 11,
                                    padding: '4px 0',
                                    borderRadius: 6,
                                    border: '0.5px solid var(--color-border)',
                                    background: days.includes(d) ? 'var(--color-purple)' : 'transparent',
                                    color: days.includes(d) ? '#fff' : 'var(--color-text-muted)',
                                    cursor: 'pointer',
                                    fontWeight: days.includes(d) ? 500 : 400,
                                }}
                            >
                                {DAY_LABELS[d]}
                            </button>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={handleCreate}
                            disabled={!title.trim() || days.length === 0}
                            style={{
                                flex: 1,
                                fontSize: 13,
                                padding: '7px',
                                borderRadius: 6,
                                border: 'none',
                                background: 'var(--color-purple)',
                                color: '#fff',
                                cursor: 'pointer',
                                opacity: !title.trim() || days.length === 0 ? 0.5 : 1,
                            }}
                        >
                            Salvar
                        </button>
                        <button
                            onClick={() => setShowForm(false)}
                            style={{
                                fontSize: 13,
                                padding: '7px 14px',
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

            {!showForm && (
                <button
                    onClick={() => setShowForm(true)}
                    style={{
                        margin: '10px 14px',
                        fontSize: 12,
                        padding: '6px',
                        borderRadius: 6,
                        border: '0.5px dashed var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        textAlign: 'center',
                    }}
                >
                    + Novo lembrete
                </button>
            )}
        </div>
    )
}