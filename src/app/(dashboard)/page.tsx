export default function HomePage() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 640, margin: '0 auto' }}>

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--color-text-primary)' }}>Bom dia, Lucas</h1>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 2 }}>Aqui está seu resumo de hoje</p>
                </div>
                <span style={{ fontSize: 10, background: 'var(--color-purple-bg)', color: 'var(--color-purple-text)', borderRadius: 20, padding: '2px 8px', fontWeight: 500, marginTop: 4 }}>IA</span>
            </div>

            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', background: 'var(--color-card)', border: '0.5px solid var(--color-border)', borderRadius: 12, padding: '12px 14px' }}>
                Layout base funcionando. Os cards do briefing serão preenchidos após a implementação dos módulos.
            </p>

        </div>
    )
}