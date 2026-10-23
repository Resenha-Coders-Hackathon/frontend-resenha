import type { OrganizationRole } from '../types'

export const roleLabels: Record<OrganizationRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Leitor',
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

export function parseInvitationEmails(input: string): string[] {
  return [
    ...new Map(
      input
        .split(/[,;\s]+/)
        .filter(Boolean)
        .map((email) => [email.toLowerCase(), email]),
    ).values(),
  ]
}

export function workspaceSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 63)
    .replace(/-$/, '')
}
