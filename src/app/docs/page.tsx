'use client'

import { useEffect, useState } from 'react'
import SwaggerUI from 'swagger-ui-react'
import 'swagger-ui-react/swagger-ui.css'

export default function DocsPage() {
    const [spec, setSpec] = useState(null)

    useEffect(() => {
        fetch('/api/docs')
            .then((res) => res.json())
            .then(setSpec)
    }, [])

    if (!spec) {
        return (
            <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
                Carregando documentação...
            </div>
        )
    }

    return <SwaggerUI spec={spec} />
}