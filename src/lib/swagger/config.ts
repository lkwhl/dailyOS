import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Daily Helper API',
            version: '1.0.0',
            description: 'Documentação das rotas da API do Daily Helper App',
        },
        tags: [
            { name: 'Rotina', description: 'Lembretes e tarefas do dia' },
            { name: 'Financeiro', description: 'Transações e contas fixas' },
            { name: 'Calendário', description: 'Eventos e aulas' },
            { name: 'Briefing', description: 'Geração do briefing diário' },
            { name: 'Jira', description: 'Sincronização com o Jira' },
            { name: 'SoftDesk', description: 'Webhook de chamados' },
        ],
    },
    // Where to look for @swagger JSDoc blocks
    apis: ['./src/app/api/**/*.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)