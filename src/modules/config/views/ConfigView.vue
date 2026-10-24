<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useTheme } from '@/app/composables/useTheme'
import { BaseButton, SubheaderComp } from '@/shared/components'
import {
  ConfigTabs,
  ConfigTopbar,
  NotificationsTab,
  PreferencesTab,
  ProfileTab,
  SecurityTab,
} from '../components'
import type {
  ActiveSession,
  ConfigTab,
  ConfigTabId,
  NotificationSettings,
  PasswordForm,
  PreferenceSettings,
  ProfileForm,
  SelectOption,
} from '../types'

// Página só de interface: os dados ficam locais e "Salvar" não chama o backend.

const TABS: ConfigTab[] = [
  {
    id: 'profile',
    label: 'Perfil',
    title: 'Seu perfil',
    description: 'Informações visíveis para os membros da organização',
  },
  {
    id: 'notifications',
    label: 'Notificações',
    title: 'Notificações',
    description: 'Escolha o que chega por e-mail e no aplicativo',
  },
  {
    id: 'security',
    label: 'Segurança',
    title: 'Segurança',
    description: 'Senha, verificação em duas etapas e dispositivos conectados',
  },
  {
    id: 'preferences',
    label: 'Preferências',
    title: 'Preferências',
    description: 'Aparência e formatos usados na sua conta',
  },
]

const TIMEZONES: SelectOption[] = [
  { value: 'America/Sao_Paulo', label: 'América/São Paulo (UTC−3)' },
  { value: 'America/Manaus', label: 'América/Manaus (UTC−4)' },
  { value: 'America/Rio_Branco', label: 'América/Rio Branco (UTC−5)' },
  { value: 'America/Noronha', label: 'América/Noronha (UTC−2)' },
]

const LANGUAGES: SelectOption[] = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en-US', label: 'English (US)' },
  { value: 'es', label: 'Español' },
]

const { isDark } = useTheme()

const activeTab = ref<ConfigTabId>('profile')
const search = ref('')
const current = computed(() => TABS.find((tab) => tab.id === activeTab.value) ?? TABS[0]!)

// os dados são JSON simples; structuredClone não aceita os proxies reativos do Vue
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

const saved = {
  profile: ref<ProfileForm>({
    firstName: 'Paulo Artur',
    lastName: 'Pereira',
    email: 'paulo@norte.studio',
    role: 'Desenvolvedor front-end',
    timezone: 'America/Sao_Paulo',
    language: 'pt-BR',
    bio: 'Cuido do produto e do front-end do Inceptum.',
  }),
  notifications: ref<NotificationSettings>({
    emailAssigned: true,
    emailMentions: true,
    emailDeadlines: true,
    emailDigest: false,
    appComments: true,
    appStatus: true,
    appAi: false,
  }),
  sessions: ref<ActiveSession[]>([
    { id: 'linux', device: 'Chrome no Linux', detail: 'Florianópolis, SC · agora', current: true },
    {
      id: 'iphone',
      device: 'Safari no iPhone',
      detail: 'Florianópolis, SC · há 2 dias',
      current: false,
    },
  ]),
  preferences: ref<PreferenceSettings>({
    theme: isDark.value ? 'dark' : 'light',
    dateFormat: 'dd/mm/yyyy',
    weekStart: 'sunday',
    compactCards: false,
    showCompleted: true,
  }),
}

const emptyPassword = (): PasswordForm => ({ current: '', next: '', confirmation: '' })

const profile = ref(clone(saved.profile.value))
const notifications = ref(clone(saved.notifications.value))
const password = ref(emptyPassword())
const sessions = ref(clone(saved.sessions.value))
const preferences = ref(clone(saved.preferences.value))

// o tema é aplicado na hora, para a pessoa ver o resultado antes de salvar
watch(
  () => preferences.value.theme,
  (theme) => (isDark.value = theme === 'dark'),
)

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

function validate(): string {
  if (activeTab.value === 'profile') {
    if (!profile.value.firstName.trim()) return 'Informe seu nome.'
    if (!/^\S+@\S+\.\S+$/.test(profile.value.email.trim())) return 'Informe um e-mail válido.'
  }
  if (activeTab.value === 'security' && !same(password.value, emptyPassword())) {
    const { current: currentPassword, next, confirmation } = password.value
    if (!currentPassword) return 'Informe a senha atual.'
    if (next.length < 9 || /^\d+$/.test(next))
      return 'A nova senha precisa de 9 caracteres e não pode ser só números.'
    if (next !== confirmation) return 'As senhas não coincidem.'
  }
  return ''
}

function handleSave() {
  const error = validate()
  if (error) {
    toast.error(error)
    return
  }

  saved.profile.value = clone(profile.value)
  saved.notifications.value = clone(notifications.value)
  saved.sessions.value = clone(sessions.value)
  saved.preferences.value = clone(preferences.value)
  password.value = emptyPassword()
  toast.success('Alterações salvas.')
}

function handleCancel() {
  profile.value = clone(saved.profile.value)
  notifications.value = clone(saved.notifications.value)
  sessions.value = clone(saved.sessions.value)
  preferences.value = clone(saved.preferences.value)
  password.value = emptyPassword()
}
</script>

<template>
  <div
    class="flex min-h-[calc(100dvh-6rem)] w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <ConfigTopbar
      v-model:search="search"
      :crumbs="['Norte Studio', 'Configurações', current.label]"
    />

    <section class="flex flex-1 flex-col gap-[16px] px-[16px] pt-[24px] pb-[28px] sm:px-[28px]">
      <SubheaderComp
        :title="current.title"
        :description="current.description"
        class="mb-0! flex-col items-start! gap-[16px] sm:flex-row sm:items-end!"
      >
        <div class="flex shrink-0 items-center gap-[8px]">
          <BaseButton
            variant="ghost"
            label="Cancelar"
            :full-width="false"
            class="mt-0!"
            @click="handleCancel"
          />
          <BaseButton
            label="Salvar alterações"
            :full-width="false"
            class="mt-0!"
            @click="handleSave"
          />
        </div>
      </SubheaderComp>

      <ConfigTabs v-model="activeTab" :tabs="TABS" />

      <div
        :id="`config-panel-${activeTab}`"
        role="tabpanel"
        :aria-labelledby="`config-tab-${activeTab}`"
        tabindex="0"
        class="outline-none"
      >
        <ProfileTab
          v-if="activeTab === 'profile'"
          v-model="profile"
          :timezones="TIMEZONES"
          :languages="LANGUAGES"
          @navigate="activeTab = $event"
        />
        <NotificationsTab v-else-if="activeTab === 'notifications'" v-model="notifications" />
        <SecurityTab
          v-else-if="activeTab === 'security'"
          v-model:password="password"
          v-model:sessions="sessions"
        />
        <PreferencesTab v-else v-model="preferences" />
      </div>
    </section>
  </div>
</template>
