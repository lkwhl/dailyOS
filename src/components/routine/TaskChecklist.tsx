'use client'

import { useState } from 'react'
import type { TaskRow, CreateTaskInput } from '@/types/routine.types'

interface Props {
    tasks: TaskRow[]
    onToggle: (id: string, current: boolean) => void
    onDelete: (id: string) => void
    onCreate: (input: CreateTaskInput) => void
}

export function TaskChecklist({ tasks, onToggle, onDelete, onCreate }: Props) {
    const [newTitle, setNewTitle] = useState('')

    function handleAdd() {
        const title = newTitle.trim()
        if (!title) return
        onCreate({
            title,
            task_date: new Date().toISOString().split('T')[0],
        })
        setNewTitle('')
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') handleAdd()
    }

    const pending = tasks.filter((t) => !t.is_completed)
    const completed = tasks.filter((t) => t.is_completed)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

            <div style={{
                display: 'flex',
                gap: 8,
                padding: '10px 14px',
                borderBottom: '0.5px solid var(--color-border-light)',
            }}>
                <input
                    type="text"
                    placeholder="Adicionar tarefa para hoje..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    style={{
                        flex: 1,
                        fontSize: 13,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        color: 'var(--color-text-primary)',
                    }}
                />
                <button
                    onClick={handleAdd}
                    disabled={!newTitle.trim()}
                    style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '0.5px solid var(--color-border)',
                        background: 'transparent',
                        color: 'var(--color-text-secondary)',
                        cursor: newTitle.trim() ? 'pointer' : 'not-allowed',
                        opacity: newTitle.trim() ? 1 : 0.4,
                    }}
                >
                    Adicionar
                </button>
            </div>

            {pending.length === 0 && completed.length === 0 && (
                <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--color-text-muted)' }}>
                    Nenhuma tarefa para hoje.
                </div>
            )}

            {pending.map((task) => (
                <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                />
            ))}

            {completed.length > 0 && (
                <>
                    <div style={{
                        padding: '6px 14px',
                        fontSize: 11,
                        color: 'var(--color-text-faint)',
                        borderTop: pending.length > 0 ? '0.5px solid var(--color-border-light)' : 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontWeight: 500,
                    }}>
                        Concluídas
                    </div>
                    {completed.map((task) => (
                        <TaskRow
                            key={task.id}
                            task={task}
                            onToggle={onToggle}
                            onDelete={onDelete}
                        />
                    ))}
                </>
            )}
        </div>
    )
}

function TaskRow({
    task,
    onToggle,
    onDelete,
}: {
    task: TaskRow
    onToggle: (id: string, current: boolean) => void
    onDelete: (id: string) => void
}) {
    const [hovered, setHovered] = useState(false)

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
                transition: 'background 0.1s',
            }}
        >
            <button
                onClick={() => onToggle(task.id, task.is_completed)}
                style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: task.is_completed
                        ? 'none'
                        : '1.5px solid var(--color-border)',
                    background: task.is_completed ? 'var(--color-green)' : 'transparent',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                }}
            >
                {task.is_completed && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1 4l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </button>

            <span style={{
                flex: 1,
                fontSize: 13,
                color: task.is_completed ? 'var(--color-text-faint)' : 'var(--color-text-primary)',
                textDecoration: task.is_completed ? 'line-through' : 'none',
            }}>
                {task.title}
            </span>

            {!task.is_completed && task.task_date < new Date().toISOString().split('T')[0] && (
                <span style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 20,
                    background: 'var(--color-red-bg)',
                    color: 'var(--color-red-text)',
                    flexShrink: 0,
                }}>
                    atrasada
                </span>
            )}

            {hovered && (
                <button
                    onClick={() => onDelete(task.id)}
                    style={{
                        fontSize: 11,
                        color: 'var(--color-text-faint)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '2px 4px',
                        borderRadius: 4,
                    }}
                >
                    ✕
                </button>
            )}
        </div>
    )
}