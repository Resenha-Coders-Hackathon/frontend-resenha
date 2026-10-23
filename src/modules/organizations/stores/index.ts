import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchAllPages } from '@/shared/utils'
import {
  addMember,
  createOrganization,
  deleteOrganization,
  listMembers,
  listOrganizations,
  removeMember,
  updateMemberRole,
  updateOrganization,
} from '../services'
import type {
  CreateOrganizationRequest,
  Organization,
  OrganizationMember,
  OrganizationRole,
  UpdateOrganizationRequest,
} from '../types'

export const useOrganizationsStore = defineStore('organizations', () => {
  const organizations = ref<Organization[]>([])
  const members = ref<OrganizationMember[]>([])

  async function load(): Promise<void> {
    organizations.value = []
    organizations.value = await fetchAllPages(listOrganizations)
  }

  async function create(payload: CreateOrganizationRequest): Promise<Organization> {
    const created = await createOrganization({ description: '', ...payload })
    organizations.value = [...organizations.value, created]
    return created
  }

  async function update(id: string, payload: UpdateOrganizationRequest): Promise<Organization> {
    const updated = await updateOrganization(id, payload)
    organizations.value = organizations.value.map((o) => (o.id === id ? updated : o))
    return updated
  }

  async function remove(id: string): Promise<void> {
    await deleteOrganization(id)
    organizations.value = organizations.value.filter((o) => o.id !== id)
  }

  async function loadMembers(id: string): Promise<void> {
    members.value = []
    members.value = await fetchAllPages((page) => listMembers(id, page))
  }

  async function add(id: string, email: string, role?: OrganizationRole) {
    const member = await addMember(id, { email, role })
    members.value = [...members.value, member]
    return member
  }

  async function changeRole(id: string, memberId: number, role: OrganizationRole) {
    const updated = await updateMemberRole(id, memberId, { role })
    members.value = members.value.map((m) => (m.id === memberId ? updated : m))
    return updated
  }

  async function removeFromOrganization(id: string, memberId: number): Promise<void> {
    await removeMember(id, memberId)
    members.value = members.value.filter((m) => m.id !== memberId)
  }

  return {
    organizations,
    members,
    load,
    create,
    update,
    remove,
    loadMembers,
    add,
    changeRole,
    removeFromOrganization,
  }
})
