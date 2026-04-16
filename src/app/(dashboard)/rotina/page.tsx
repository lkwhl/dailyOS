'use client'

import { useRoutine } from '@/hooks/useRoutine'
import { TaskChecklist } from '@/components/routine/TaskChecklist'
import { ReminderList } from '@/components/routine/ReminderList'

function SectionCard({
    title,
    color,
    meta,
    children,
}: {
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
                <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: color,
                    flexShrink: 0,
                }} />
                <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--color-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    flex: 1,
                }}>
                    {title}
                </span>
                {meta && (
                    <span style={{ fontSize: 11, color: 'var(--color-text-faint)' }}>{meta}</span>
                )}
            </div>
            {children}
        </div>
    )
}

export default function RotinaPage() {
    const {
        reminders,
        tasks,
        loading,
        error,
        createTask,
        toggleTask,
        deleteTask,
        createReminder,
        toggleReminder,
        deleteReminder,
    } = useRoutine()

    if (loading) {
        return (
            <div style={{ padding: '2rem', fontSize: 13, color: 'var(--color-text-muted)' }}>
                Carregando rotina...
            </div>
        )
    }

    const pendingCount = tasks.filter((t) => !t.is_completed).length

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxWidth: 640,
            margin: '0 auto',
        }}>

            <div>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    Rotina
                </h1>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
            </div>

            {error && (
                <div style={{
                    fontSize: 13,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--color-red-bg)',
                    color: 'var(--color-red-text)',
                }}>
                    {error}
                </div>
            )}

            <SectionCard
                title="Tarefas de hoje"
                color="var(--color-coral)"
                meta={pendingCount > 0 ? `${pendingCount} pendente${pendingCount > 1 ? 's' : ''}` : undefined}
            >
                <TaskChecklist
                    tasks={tasks}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onCreate={createTask}
                />
            </SectionCard>

            <SectionCard
                title="Lembretes"
                color="var(--color-purple)"
                meta={`${reminders.filter((r) => r.is_active).length} ativo${reminders.filter((r) => r.is_active).length !== 1 ? 's' : ''}`}
            >
                <ReminderList
                    reminders={reminders}
                    onToggle={toggleReminder}
                    onDelete={deleteReminder}
                    onCreate={createReminder}
                />
            </SectionCard>

        </div>
    )
}