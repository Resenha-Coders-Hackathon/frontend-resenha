import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/modules/auth'
import { useOrganizationsStore } from '@/modules/organizations'
import { showDesktopAlert, userAway } from '@/modules/notifications'
import { useChatStore } from '../stores/chat'
import { useChatSocket } from './useChatSocket'

/**
 * Mounted once by the app layout: keeps the unread pin of "Mensagens" up to date on every page
 * and announces new messages (toast while you are in the app, system notification when away).
 */
export function useChatAlerts(): void {
  const auth = useAuthStore()
  const organizations = useOrganizationsStore()
  const chat = useChatStore()
  const route = useRoute()
  const router = useRouter()

  useChatSocket((event) => {
    if (auth.user) void chat.handleEvent(event, auth.user.id)
  })

  watch(
    () => [auth.user?.id, organizations.current?.id] as const,
    ([user, org]) => {
      if (user && org) void chat.watchChannels(org)
      else chat.reset()
    },
    { immediate: true },
  )

  watch(
    () => chat.incoming,
    (message) => {
      if (!message) return
      const reading = route.name === 'Chat' && chat.activeId === message.channelId && !userAway()
      if (reading) return
      const open = () => {
        void chat.select(message.channelId)
        void router.push('/chat')
      }
      if (userAway()) {
        showDesktopAlert({
          title: message.title,
          body: message.body,
          tag: `chat-${message.channelId}`,
          onClick: open,
        })
      } else {
        toast(message.title, {
          id: `chat-${message.channelId}`,
          description: message.body,
          action: { label: 'Abrir', onClick: open },
        })
      }
    },
  )
}
