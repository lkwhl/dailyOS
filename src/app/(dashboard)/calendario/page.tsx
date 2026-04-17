'use client'

import { useCalendar } from '@/hooks/useCalendar'
import { WeekView } from '@/components/calendar/WeekView'
import { EventInput } from '@/components/calendar/EventInput'

function SectionCard({ title, color, children, action }: {
    title: string
    color: string
    children: React.ReactNode
    action?: React.ReactNode
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
                {action}
            </div>
            {children}
        </div>
    )
}

export default function CalendarioPage() {
    const {
        events, loading, error,
        weekDays, weekStart,
        goToPrevWeek, goToNextWeek, goToToday,
        parseInput, setParseInput, parsePending, parsePreview, parseError,
        parseText, confirmEvent, cancelParse,
        deleteEvent,
        syncing, syncResult, syncJira,
    } = useCalendar()

    if (loading) {
        return (
            <div style={{ padding: '2rem', fontSize: 13, color: 'var(--color-text-muted)' }}>
                Carregando calendário...
            </div>
        )
    }

    const weekLabel = (() => {
        const start = weekDays[0]
        const end = weekDays[6]
        const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']
        if (start.getMonth() === end.getMonth()) {
            return `${start.getDate()} – ${end.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}`
        }
        return `${start.getDate()} ${MONTHS[start.getMonth()]} – ${end.getDate()} ${MONTHS[end.getMonth()]} ${start.getFullYear()}`
    })()

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 900, margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>Calendário</h1>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>{weekLabel}</p>
                </div>

                {/* Week navigation */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button
                        onClick={goToPrevWeek}
                        style={{
                            fontSize: 13, padding: '6px 10px', borderRadius: 6,
                            border: '0.5px solid var(--color-border)', background: 'transparent',
                            color: 'var(--color-text-secondary)', cursor: 'pointer',
                        }}
                    >
                        ←
                    </button>
                    <button
                        onClick={goToToday}
                        style={{
                            fontSize: 12, padding: '6px 12px', borderRadius: 6,
                            border: '0.5px solid var(--color-border)', background: 'transparent',
                            color: 'var(--color-text-secondary)', cursor: 'pointer',
                        }}
                    >
                        Hoje
                    </button>
                    <button
                        onClick={goToNextWeek}
                        style={{
                            fontSize: 13, padding: '6px 10px', borderRadius: 6,
                            border: '0.5px solid var(--color-border)', background: 'transparent',
                            color: 'var(--color-text-secondary)', cursor: 'pointer',
                        }}
                    >
                        →
                    </button>
                </div>
            </div>

            {error && (
                <div style={{
                    fontSize: 13, padding: '10px 14px', borderRadius: 8,
                    background: 'var(--color-red-bg)', color: 'var(--color-red-text)',
                }}>
                    {error}
                </div>
            )}

            {/* Week grid */}
            <WeekView weekDays={weekDays} events={events} onDelete={deleteEvent} />

            {/* Add event via NL */}
            <SectionCard title="Adicionar evento" color="var(--color-purple)">
                <EventInput
                    value={parseInput}
                    onChange={setParseInput}
                    onSubmit={parseText}
                    pending={parsePending}
                    preview={parsePreview}
                    error={parseError}
                    onConfirm={confirmEvent}
                    onCancel={cancelParse}
                />
            </SectionCard>

            {/* Jira sync */}
            <SectionCard
                title="Jira"
                color="var(--color-blue)"
                action={
                    <button
                        onClick={syncJira}
                        disabled={syncing}
                        style={{
                            fontSize: 11, padding: '3px 10px', borderRadius: 6,
                            border: '0.5px solid var(--color-border)', background: 'transparent',
                            color: 'var(--color-text-secondary)', cursor: syncing ? 'not-allowed' : 'pointer',
                            opacity: syncing ? 0.5 : 1,
                        }}
                    >
                        {syncing ? 'Sincronizando...' : '↻ Sincronizar'}
                    </button>
                }
            >
                <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--color-text-secondary)' }}>
                    {syncResult
                        ? syncResult
                        : 'Clique em sincronizar para importar os cards do Jira com deadline.'
                    }
                </div>
            </SectionCard>

        </div>
    )
}