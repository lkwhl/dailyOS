'use client'

import { EventCard } from './EventCard'
import type { EventRow } from '@/types/calendar.types'

const DAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTH_LABELS = [
    'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
    'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

interface Props {
    weekDays: Date[]
    events: EventRow[]
    onDelete: (id: string) => void
}

export function WeekView({ weekDays, events, onDelete }: Props) {
    const today = new Date().toISOString().split('T')[0]

    function getEventsForDay(date: Date): EventRow[] {
        const dateStr = date.toISOString().split('T')[0]
        return events.filter((e) => e.event_date === dateStr)
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: 6,
        }}>
            {weekDays.map((day) => {
                const dateStr = day.toISOString().split('T')[0]
                const isToday = dateStr === today
                const dayEvents = getEventsForDay(day)
                const isWeekend = day.getDay() === 0 || day.getDay() === 6

                return (
                    <div
                        key={dateStr}
                        style={{
                            background: isWeekend ? '#fafaf8' : 'var(--color-card)',
                            border: `0.5px solid ${isToday ? 'var(--color-purple)' : 'var(--color-border)'}`,
                            borderRadius: 8,
                            padding: '8px 6px',
                            minHeight: 100,
                        }}
                    >
                        {/* Day header */}
                        <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginBottom: 8,
                            paddingBottom: 6,
                            borderBottom: '0.5px solid var(--color-border-light)',
                        }}>
                            <span style={{
                                fontSize: 10,
                                color: isWeekend ? 'var(--color-text-faint)' : 'var(--color-text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}>
                                {DAY_LABELS[day.getDay()]}
                            </span>
                            <span style={{
                                fontSize: 14,
                                fontWeight: isToday ? 600 : 400,
                                color: isToday ? 'var(--color-purple)' : 'var(--color-text-primary)',
                                width: 24,
                                height: 24,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                                background: isToday ? 'var(--color-purple-bg)' : 'transparent',
                                marginTop: 2,
                            }}>
                                {day.getDate()}
                            </span>
                            <span style={{ fontSize: 9, color: 'var(--color-text-faint)' }}>
                                {MONTH_LABELS[day.getMonth()]}
                            </span>
                        </div>

                        {/* Events */}
                        {dayEvents.length === 0 ? (
                            <div style={{ fontSize: 10, color: 'var(--color-text-faint)', textAlign: 'center', paddingTop: 4 }}>
                                —
                            </div>
                        ) : (
                            dayEvents.map((event) => (
                                <EventCard key={event.id} event={event} onDelete={onDelete} />
                            ))
                        )}
                    </div>
                )
            })}
        </div>
    )
}