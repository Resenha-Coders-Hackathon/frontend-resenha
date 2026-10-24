<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { toast } from 'vue-sonner'
import { BaseButton, TopbarComp } from '@/shared/components'
import { useNotificationsStore } from '../stores'
import { useOpenNotification } from '../composables/useOpenNotification'
import {
  actorAvatar,
  kindIcons,
  notificationActor,
  notificationKind,
  notificationTitle,
  relativeTime,
  type NotificationKind,
} from '../utils'

const notifications = useNotificationsStore()
const openNotification = useOpenNotification()
const isChangingPush = ref(false)
const isSending = ref(false)

const TABS: { id: 'all' | NotificationKind; label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'mention', label: 'Menções' },
  { id: 'assigned', label: 'Atribuídas a mim' },
  { id: 'comment', label: 'Comentários' },
]
const tab = ref<(typeof TABS)[number]['id']>('all')

const visible = computed(() =>
  tab.value === 'all'
    ? notifications.items
    : notifications.items.filter((item) => notificationKind(item) === tab.value),
)

onMounted(() => {
  void notifications.load(false)
})

async function togglePush(): Promise<void> {
  isChangingPush.value = true
  try {
    if (notifications.pushEnabled) await notifications.disablePush()
    else await notifications.enablePush()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível alterar o push.')
  } finally {
    isChangingPush.value = false
  }
}

async function sendTest(): Promise<void> {
  isSending.value = true
  try {
    await notifications.sendTest()
    toast.success('Push enviado. Confira a notificação neste navegador.')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Não foi possível enviar o teste.')
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Notificações']" />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[32px] sm:px-[28px]">
      <header class="flex flex-wrap items-end justify-between gap-[12px]">
        <div>
          <h1 class="text-[26px]! leading-tight! font-semibold! tracking-[-0.02em]!">
            Notificações
          </h1>
          <p
            class="text-[14px] text-(--text-secondary) dark:text-(--text-inverse-muted)"
            aria-live="polite"
          >
            {{
              notifications.unreadCount ? `${notifications.unreadCount} não lidas` : 'Tudo em dia'
            }}
          </p>
        </div>
        <BaseButton
          label="Marcar todas como lidas"
          icon="check"
          icon-position="left"
          variant="secondary"
          :full-width="false"
          class="mt-0!"
          :disabled="!notifications.unreadCount"
          @click="notifications.markAllAsRead()"
        />
      </header>

      <div
        role="tablist"
        aria-label="Filtrar notificações"
        class="flex gap-[22px] overflow-x-auto border-b border-(--border-default) dark:border-(--border-inverse)"
      >
        <button
          v-for="item in TABS"
          :key="item.id"
          type="button"
          role="tab"
          :aria-selected="tab === item.id"
          :class="[
            '-mb-px shrink-0 cursor-pointer border-b-2 pb-[10px] text-[14px] leading-normal',
            tab === item.id
              ? 'border-(--text-primary) font-semibold dark:border-(--text-inverse)'
              : 'border-transparent text-(--text-muted) hover:text-(--text-primary) dark:hover:text-(--text-inverse)',
          ]"
          @click="tab = item.id"
        >
          {{ item.label }}
        </button>
      </div>

      <p v-if="notifications.error" role="alert" class="text-(--destructive)">
        {{ notifications.error }}
      </p>

      <div
        class="rounded-[16px] border border-(--border-default) bg-(--surface) px-[18px] py-[6px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
      >
        <p
          v-if="notifications.isLoading && !notifications.items.length"
          role="status"
          class="py-[16px] text-[14px] text-(--text-muted)"
        >
          Carregando notificações…
        </p>
        <p v-else-if="!visible.length" class="py-[16px] text-[14px] text-(--text-muted)">
          {{
            tab === 'all'
              ? 'Nada por aqui ainda. Atribuições, comentários e menções aparecem nesta lista.'
              : 'Nenhuma notificação neste filtro.'
          }}
        </p>
        <ul v-else aria-label="Suas notificações">
          <li
            v-for="item in visible"
            :key="item.id"
            class="border-b border-(--border-default) last:border-b-0 dark:border-(--border-inverse)"
          >
            <button
              type="button"
              class="flex w-full cursor-pointer items-center gap-[12px] py-[14px] text-left"
              @click="openNotification(item)"
            >
              <span
                v-if="notificationActor(item.title)"
                class="grid size-[32px] shrink-0 place-items-center rounded-full text-[11px] leading-none font-semibold text-white"
                :style="{ backgroundColor: actorAvatar(notificationActor(item.title)!).color }"
                aria-hidden="true"
                >{{ actorAvatar(notificationActor(item.title)!).initials }}</span
              >
              <span
                v-else
                class="grid size-[32px] shrink-0 place-items-center rounded-[9px] bg-(--bg-muted) dark:bg-black/30"
                aria-hidden="true"
              >
                <span
                  class="material-symbols-outlined text-[17px]! text-(--text-secondary) dark:text-(--text-inverse-muted)"
                  >{{ kindIcons[notificationKind(item)] }}</span
                >
              </span>

              <span class="flex min-w-0 flex-1 flex-col leading-normal">
                <span
                  :class="['truncate text-[14px]', item.is_read ? 'font-normal' : 'font-semibold']"
                  >{{ notificationTitle(item.title) }}</span
                >
                <span class="truncate text-[12.5px] text-(--text-muted)">
                  {{ item.message }}{{ item.message ? ' · ' : ''
                  }}{{ relativeTime(item.created_at) }}
                </span>
              </span>

              <span
                v-if="!item.is_read"
                class="inline-flex shrink-0 items-center rounded-[6px] bg-[#fff1e6] px-[8px] py-[2px] text-[11.5px] leading-[16px] font-medium text-[#e2560b] dark:bg-[#ff6700]/15 dark:text-[#ff8a4c]"
                >Nova</span
              >
            </button>
          </li>
        </ul>
      </div>

      <BaseButton
        v-if="notifications.hasMore"
        label="Carregar mais"
        variant="secondary"
        :full-width="false"
        :loading="notifications.isLoading"
        @click="notifications.loadMore()"
      />

      <div
        class="flex flex-wrap items-center justify-between gap-[12px] rounded-[16px] border border-(--border-default) bg-(--surface) px-[18px] py-[14px] dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
      >
        <div>
          <h2 class="text-[15px]! leading-normal! font-semibold! tracking-normal!">
            Avisos neste navegador
          </h2>
          <p class="text-[13px] text-(--text-muted)">
            {{
              notifications.pushEnabled
                ? 'Você recebe atribuições e menções mesmo com a aba fechada.'
                : 'Ative para receber atribuições e menções mesmo com a aba fechada.'
            }}
          </p>
        </div>
        <div class="flex flex-wrap gap-[8px]">
          <BaseButton
            v-if="notifications.pushEnabled"
            label="Enviar teste"
            variant="ghost"
            size="sm"
            :full-width="false"
            class="mt-0!"
            :loading="isSending"
            @click="sendTest"
          />
          <BaseButton
            :label="notifications.pushEnabled ? 'Desativar avisos' : 'Ativar avisos'"
            :variant="notifications.pushEnabled ? 'secondary' : 'primary'"
            size="sm"
            :full-width="false"
            class="mt-0!"
            :loading="isChangingPush"
            @click="togglePush"
          />
        </div>
      </div>
    </section>
  </div>
</template>
