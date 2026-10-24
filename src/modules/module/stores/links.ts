import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchAllPages } from '@/shared/utils'
import { createLink, deleteLink, listLinks, type LinkTarget } from '../services'
import type { CreateResourceLinkRequest, ResourceLink } from '../types'

const keyOf = (target: LinkTarget, id: string) => `${target}:${id}`

// Links de apoio (inclusive arquivos do Drive anexados) por tarefa, setor ou organização.
export const useLinksStore = defineStore('links', () => {
  const links = ref<Record<string, ResourceLink[]>>({})

  const forTarget = (target: LinkTarget, id: string): ResourceLink[] =>
    links.value[keyOf(target, id)] ?? []

  async function load(target: LinkTarget, id: string): Promise<void> {
    links.value[keyOf(target, id)] = await fetchAllPages((page) => listLinks(target, id, page))
  }

  async function add(
    target: LinkTarget,
    id: string,
    payload: CreateResourceLinkRequest,
  ): Promise<ResourceLink> {
    const created = await createLink(target, id, payload)
    links.value[keyOf(target, id)] = [...forTarget(target, id), created]
    return created
  }

  /** Also use this to show a link created elsewhere (e.g. a Drive attachment). */
  function put(target: LinkTarget, id: string, link: ResourceLink): void {
    const list = forTarget(target, id).filter((l) => l.id !== link.id)
    links.value[keyOf(target, id)] = [...list, link]
  }

  async function remove(target: LinkTarget, id: string, linkId: string): Promise<void> {
    await deleteLink(linkId)
    links.value[keyOf(target, id)] = forTarget(target, id).filter((l) => l.id !== linkId)
  }

  return { links, forTarget, load, add, put, remove }
})
