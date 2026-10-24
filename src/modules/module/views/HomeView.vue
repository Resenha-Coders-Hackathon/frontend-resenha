<script setup lang="ts">
import { onMounted } from 'vue'
import { BaseButton } from '@/shared/components'
import { useAuthStore } from '@/modules/auth/stores'
import { useNotificationsStore, useOpenNotification, notificationTitle } from '@/modules/notifications'
import { useOrganizationsStore } from '@/modules/organizations'

const auth = useAuthStore()
const notifications = useNotificationsStore()
const organizations = useOrganizationsStore()
const openNotification = useOpenNotification()

onMounted(() => {
  void notifications.load(true)
  if (!organizations.organizations.length) void organizations.load().catch(() => undefined)
})
</script>

<template>
  <section
    class="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 md:grid-cols-[minmax(0,1fr)_20rem] md:py-10"
  >
    <div class="min-w-0">
      <h1 class="text-2xl! leading-tight!">Olá, {{ auth.user?.name.split(' ')[0] ?? '' }}</h1>
      <p class="mt-1 text-(--text-secondary) dark:text-(--text-inverse-muted)">
        Acompanhe o que aconteceu desde a sua última visita.
      </p>

      <div class="mt-8 flex items-center justify-between">
        <h2 class="text-lg! leading-snug!">Para você</h2>
        <RouterLink to="/notificacoes" class="text-sm underline">Ver tudo</RouterLink>
      </div>
      <p v-if="notifications.error" role="alert" class="mt-3 text-(--destructive)">
        {{ notifications.error }}
      </p>
      <p
        v-else-if="!notifications.items.length"
        class="mt-3 text-(--text-secondary) dark:text-(--text-inverse-muted)"
      >
        {{
          notifications.isLoading
            ? 'Carregando…'
            : 'Nada pendente. Menções e tarefas atribuídas a você aparecem aqui.'
        }}
      </p>
      <ul
        v-else
        class="mt-3 divide-y divide-(--border-default) rounded-xl border border-(--border-default) bg-(--surface) dark:divide-(--border-inverse) dark:border-(--border-inverse) dark:bg-(--surface-inverse)"
      >
        <li v-for="item in notifications.items.slice(0, 6)" :key="item.id">
          <button
            type="button"
            class="flex w-full flex-col items-start px-4 py-3 text-left hover:bg-(--bg-subtle) dark:hover:bg-white/5"
            @click="openNotification(item)"
          >
            <span class="font-semibold">{{ notificationTitle(item.title) }}</span>
            <span
              v-if="item.message"
              class="line-clamp-2 text-sm text-(--text-secondary) dark:text-(--text-inverse-muted)"
              >{{ item.message }}</span
            >
          </button>
        </li>
      </ul>
    </div>

    <aside class="min-w-0">
      <div class="flex items-center justify-between">
        <h2 class="text-lg! leading-snug!">Suas organizações</h2>
        <RouterLink to="/organizacoes/nova" class="text-sm underline">Nova</RouterLink>
      </div>
      <ul class="mt-3 grid gap-1">
        <li v-for="organization in organizations.organizations" :key="organization.id">
          <RouterLink
            :to="`/organizacoes/${organization.id}`"
            class="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-(--bg-subtle) dark:hover:bg-white/5"
            @click="organizations.select(organization.id)"
          >
            <span
              class="size-2 shrink-0 rounded-full"
              :class="
                organization.id === organizations.current?.id ? 'bg-(--bg-orange)' : 'bg-(--bg-muted)'
              "
              aria-hidden="true"
            />
            <span class="min-w-0 flex-1 truncate">{{ organization.name }}</span>
          </RouterLink>
        </li>
      </ul>
      <BaseButton
        v-if="!organizations.organizations.length"
        class="mt-3"
        label="Criar organização"
        :full-width="false"
        @click="$router.push('/organizacoes/nova')"
      />
    </aside>
  </section>
</template>
