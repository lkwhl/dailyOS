import Link from 'next/link'
import { type ReactNode } from 'react'

const navItems = [
    {
        href: '/',
        label: 'Início',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
                <rect x="10" y="2" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4" />
                <rect x="10" y="10" width="6" height="6" rx="1.5" fill="currentColor" opacity=".4" />
            </svg>
        ),
    },
    {
        href: '/calendario',
        label: 'Calendário',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <line x1="6" y1="1.5" x2="6" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="12" y1="1.5" x2="12" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                <line x1="2" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="1.2" />
            </svg>
        ),
    },
    {
        href: '/rotina',
        label: 'Rotina',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.2" />
                <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        href: '/financeiro',
        label: 'Financeiro',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 13 Q9 3 15 13" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                <circle cx="9" cy="13" r="1.5" fill="currentColor" />
            </svg>
        ),
    },
    {
        href: '/softdesk',
        label: 'SoftDesk',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                <path d="M5 8h8M5 11h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
        ),
    },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '56px 1fr',
            gridTemplateRows: 'auto 1fr',
            minHeight: '100dvh',
            background: 'var(--color-surface)',
        }}>

            {/* Topbar */}
            <header style={{
                gridColumn: '1 / -1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '0.5px solid var(--color-border)',
                background: 'var(--color-surface)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: 24, height: 24, background: 'var(--color-purple)', borderRadius: 6 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>Daily OS</span>
                    <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                </div>
            </header>

            {/* Sidebar — desktop only */}
            <nav style={{
                borderRight: '0.5px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 0',
                gap: 4,
                background: 'var(--color-surface)',
            }}
                className="hidden-mobile"
            >
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        title={item.label}
                        style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--color-text-secondary)',
                            textDecoration: 'none',
                        }}
                    >
                        {item.icon}
                    </Link>
                ))}
            </nav>

            {/* Main content */}
            <main style={{
                overflowY: 'auto',
                padding: '20px 16px',
                paddingBottom: '80px',
            }}>
                {children}
            </main>

            {/* Bottom nav — mobile only */}
            <nav style={{
                gridColumn: '1 / -1',
                display: 'flex',
                borderTop: '0.5px solid var(--color-border)',
                background: 'var(--color-surface)',
            }}
                className="show-mobile"
            >
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 3,
                            padding: '8px 0',
                            fontSize: 10,
                            color: 'var(--color-text-muted)',
                            textDecoration: 'none',
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </Link>
                ))}
            </nav>

        </div>
    )
}