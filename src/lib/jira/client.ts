import type { JiraCard } from '@/types/calendar.types'

const BASE_URL = process.env.JIRA_BASE_URL?.replace(/\/$/, '')
const USER_EMAIL = process.env.JIRA_USER_EMAIL
const API_TOKEN = process.env.JIRA_API_TOKEN

function getAuthHeader(): string {
    const credentials = Buffer.from(`${USER_EMAIL}:${API_TOKEN}`).toString('base64')
    return `Basic ${credentials}`
}

async function jiraFetch<T>(path: string): Promise<T> {
    if (!BASE_URL || !USER_EMAIL || !API_TOKEN) {
        throw new Error('Configurações do Jira ausentes. Verifique as variáveis de ambiente.')
    }

    const response = await fetch(`${BASE_URL}/rest/api/3${path}`, {
        headers: {
            'Authorization': getAuthHeader(),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        // Disable Next.js cache — always fetch fresh data
        cache: 'no-store',
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(`Jira API error ${response.status}: ${error}`)
    }

    return response.json()
}

type JiraIssueResponse = {
    issues: Array<{
        key: string
        fields: {
            summary: string
            duedate: string | null
            priority: { name: string } | null
            status: { name: string }
            assignee: { emailAddress: string } | null
        }
    }>
    total: number
    maxResults: number
    startAt: number
}

export async function fetchAssignedCardsWithDueDate(): Promise<JiraCard[]> {
    const jql = encodeURIComponent(
        'assignee = currentUser() AND due is not EMPTY AND statusCategory != Done ORDER BY due ASC'
    )

    const fields = 'summary,duedate,priority,status,assignee'
    const data = await jiraFetch<JiraIssueResponse>(
        `/search/jql?jql=${jql}&fields=${fields}&maxResults=50`
    )

    return data.issues
        .filter((issue) => issue.fields.duedate !== null)
        .map((issue) => ({
            key: issue.key,
            summary: issue.fields.summary,
            dueDate: issue.fields.duedate!,
            priority: issue.fields.priority?.name ?? 'Medium',
            status: issue.fields.status.name,
            url: `${BASE_URL}/browse/${issue.key}`,
        }))
}

export async function fetchCardsDueSoon(days = 7): Promise<JiraCard[]> {
    const jql = encodeURIComponent(
        `assignee = currentUser() AND due <= ${days}d AND due >= -1d AND statusCategory != Done ORDER BY due ASC`
    )

    const fields = 'summary,duedate,priority,status'
    const data = await jiraFetch<JiraIssueResponse>(
        `/search/jql?jql=${jql}&fields=${fields}&maxResults=20`
    )

    return data.issues
        .filter((issue) => issue.fields.duedate !== null)
        .map((issue) => ({
            key: issue.key,
            summary: issue.fields.summary,
            dueDate: issue.fields.duedate!,
            priority: issue.fields.priority?.name ?? 'Medium',
            status: issue.fields.status.name,
            url: `${BASE_URL}/browse/${issue.key}`,
        }))
}