import { useRouter } from 'vue-router'
import { useOrganizationsStore } from '@/modules/organizations'
import { useNotificationsStore } from '../stores'
import { notificationPath } from '../utils'
import type { AppNotification } from '../types'

// Marca como lida, seleciona a organização da notificação (se houver) e abre o destino.
export function useOpenNotification() {
  const router = useRouter()
  const notifications = useNotificationsStore()
  const organizations = useOrganizationsStore()

  return async function open(item: AppNotification): Promise<void> {
    const organizationId = item.data.organization_id
    if (typeof organizationId === 'string') organizations.select(organizationId)
    void notifications.markAsRead(item.id)
    await router.push(notificationPath(item.data))
  }
}
