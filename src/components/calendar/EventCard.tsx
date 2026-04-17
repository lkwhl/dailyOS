'use client'

import { useState } from 'react'
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, type EventRow } from '@/types/calendar.types'

interface Props {
    event: EventRow
    onDelete: (id: string) => void
}

export function EventCard({ event, onDelete }: Props) {
    const [hovered, setHovered] = useState(false)

    const color = EVENT_TYPE_COLORS[event.event_type as keyof typeof EVENT_TYPE_COLORS] ?? '#5f5e5a'
    const label = EVENT_TYPE_LABELS[event.event_type as keyof typeof EVENT_TYPE_LABELS] ?? 'Outro'
    const isJira = event.event_type === 'jira_deadline'
    const meta = event.metadata as Record<string, string> | null

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 6,
                padding: '6px 8px',
                borderRadius: 6,
                background: hovered ? '#f5f4f0' : 'transparent',
                borderLeft: `2.5px solid ${color}`,
                marginBottom: 4,
                cursor: 'default',
                position: 'relative',
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: 'var(--color-text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {event.title}
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginTop: 2,
                    flexWrap: 'wrap',
                }}>
                    <span style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 20,
                        background: `${color}22`,
                        color,
                        fontWeight: 500,
                    }}>
                        {label}
                    </span>

                    {event.starts_at && (
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                            {event.starts_at.slice(0, 5)}
                        </span>
                    )}

                    {event.location && (
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                            · {event.location}
                        </span>
                    )}

                    {isJira && meta?.url && (
                        <a
                            href={meta.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                fontSize: 10,
                                color: 'var(--color-blue)',
                                textDecoration: 'none',
                            }}
                        >
                            ↗ {meta.jiraKey}
                        </a>
                    )}
                </div>
            </div>

            {hovered && (
                <button
                    onClick={() => onDelete(event.id)}
                    style={{
                        fontSize: 10,
                        color: 'var(--color-text-faint)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '1px 4px',
                        flexShrink: 0,
                    }}
                >
                    ✕
                </button>
            )}
        </div>
    )
}
