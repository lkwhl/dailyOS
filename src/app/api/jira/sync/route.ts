import { NextResponse } from 'next/server'
import { fetchAssignedCardsWithDueDate } from '@/lib/jira/client'
import * as CalendarService from '@/services/calendar.service'

/**
 * @swagger
 * /api/jira/sync:
 *   post:
 *     tags: [Jira]
 *     summary: Sincroniza cards do Jira com o calendário
 *     description: Busca todos os cards atribuídos ao usuário com due date e cria/atualiza eventos no calendário
 *     responses:
 *       200:
 *         description: Sync realizado com sucesso
 *       500:
 *         description: Erro ao conectar com o Jira
 */

export async function POST() {
    try {
        const cards = await fetchAssignedCardsWithDueDate()
        const result = await CalendarService.syncJiraCards(cards)

        return NextResponse.json({
            sucesso: true,
            dados: {
                mensagem: `Sync concluído: ${result.created} criados, ${result.updated} atualizados, ${result.skipped} sem alteração.`,
                ...result,
                total: cards.length,
            },
            erro: null,
        })
    } catch (error) {
        console.error('Jira sync error:', error)
        const isJiraError = error instanceof Error && error.message.includes('Jira API error')
        console.log(error);
        return NextResponse.json(
            {
                sucesso: false,
                dados: null,
                erro: {
                    codigo: isJiraError ? 'JIRA_API_ERROR' : 'JIRA_SYNC_ERROR',
                    mensagem: isJiraError
                        ? 'Erro ao conectar com o Jira. Verifique as credenciais.'
                        : 'Erro ao sincronizar com o Jira.',
                },
            },
            { status: 500 }
        )
    }
}