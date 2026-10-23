import { api } from '@/app/plugins/axios'
import type { Page } from '@/shared/types'
import type { Organization, OrganizationMember, OrganizationSector } from '../types'

export async function listOrganizations(page = 1): Promise<Page<Organization>> {
  return (await api.get<Page<Organization>>('/organizations/', { params: { page } })).data
}

export async function createOrganization(payload: {
  name: string
  description: string
  logo_url?: string
  slug?: string
  team_size?: Organization['team_size']
}): Promise<Organization> {
  return (await api.post<Organization>('/organizations/', payload)).data
}

export async function getOrganizationBySlug(slug: string): Promise<Organization> {
  return (await api.get<Organization>(`/organizations/by-slug/${encodeURIComponent(slug)}/`)).data
}

export async function listOrganizationSectors(
  id: string,
  page = 1,
): Promise<Page<OrganizationSector>> {
  return (
    await api.get<Page<OrganizationSector>>(`/organizations/${encodeURIComponent(id)}/sectors/`, {
      params: { page },
    })
  ).data
}

export async function createOrganizationSector(
  id: string,
  name: string,
): Promise<OrganizationSector> {
  return (
    await api.post<OrganizationSector>(`/organizations/${encodeURIComponent(id)}/sectors/`, {
      name,
    })
  ).data
}

export async function uploadOrganizationLogo(file: File): Promise<string> {
  const payload = new FormData()
  payload.append('file', file)
  return (await api.post<{ url: string }>('/uploads/', payload)).data.url
}

export async function getOrganization(id: string): Promise<Organization> {
  return (await api.get<Organization>(`/organizations/${encodeURIComponent(id)}/`)).data
}

export async function listMembers(id: string, page = 1): Promise<Page<OrganizationMember>> {
  return (
    await api.get<Page<OrganizationMember>>(`/organizations/${encodeURIComponent(id)}/members/`, {
      params: { page },
    })
  ).data
}
