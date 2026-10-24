<script setup lang="ts">
// TODO: CÓDIGO COMENTADOO, REVISAR MAIS TARDE.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import { useTheme } from '@/app/composables/useTheme'
import { getErrorMessage } from '@/app/plugins/axios'
import { useAuthStore } from '@/modules/auth'
import { useOrganizationsStore } from '@/modules/organizations'
import { profilePayload, notificationSettings, validateAvatar } from '../utils'
import { fetchSettings, updateSettings, uploadAvatar } from '../services'
import { BaseButton, SubheaderComp, TopbarComp } from '@/shared/components'
import {
  ConfigTabs,
  NotificationsTab,
  PreferencesTab,
  ProfileTab,
  SecurityTab,
  AvatarCropDialog,
  AvatarCameraDialog,
} from '../components'
import type {
  ActiveSession,
  ConfigTab,
  ConfigTabId,
  NotificationSettings,
  PreferenceSettings,
  ProfileForm,
  SelectOption,
} from '../types'

const auth = useAuthStore()
const organizations = useOrganizationsStore()
const isLoading = ref(true)
const isSaving = ref(false)
const isUploadingAvatar = ref(false)
const avatarUploadError = ref('')
let avatarUpload: AbortController | undefined
const cropSource = ref<File | null>(null)
const cameraOpen = ref(false)
const pendingAvatar = ref<File | null>(null)
const avatarPreview = ref('')
let disposed = false
const loadError = ref('')
const sessionsError = ref('')
const isLoadingSessions = ref(false)
const endingSession = ref<number | null>(null)

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
  {
    id: 'organization',
    label: 'Organização',
    title: 'Organização',
    description: 'Nome, endereço, logo e dados do seu espaço de trabalho',
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

const { theme, setTheme } = useTheme()

const activeTab = ref<ConfigTabId>('profile')
const current = computed(() => TABS.find((tab) => tab.id === activeTab.value) ?? TABS[0]!)

// os dados são JSON simples; structuredClone não aceita os proxies reativos do Vue
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value))

const saved = {
  profile: ref<ProfileForm>({
    name: '',
    email: '',
    timezone: '',
    language: '',
    bio: '',
    avatar_url: '',
  }),
  notifications: ref<NotificationSettings>({
    email_product: true,
    email_weekly_digest: false,
    email_security: true,
    email_assigned: true,
    email_mentions: true,
    email_deadlines: true,
    app_comments: true,
    app_status: true,
    app_ai: false,
    push_enabled: true,
  }),
  preferences: ref<PreferenceSettings>({
    theme: theme.value,
    date_format: 'dd/mm/yyyy',
    week_start: 'sunday',
    compact_cards: false,
    show_completed: true,
  }),
}

const profile = ref(clone(saved.profile.value))
// Preserve valid server values even when they are not among the suggested options.
const timezones = computed(() =>
  TIMEZONES.some((option) => option.value === profile.value.timezone)
    ? TIMEZONES
    : [...TIMEZONES, { value: profile.value.timezone, label: profile.value.timezone }],
)
const languages = computed(() =>
  LANGUAGES.some((option) => option.value === profile.value.language)
    ? LANGUAGES
    : [...LANGUAGES, { value: profile.value.language, label: profile.value.language }],
)
const notifications = ref(clone(saved.notifications.value))
const sessions = computed<ActiveSession[]>(() =>
  auth.sessions.map((session) => ({
    id: session.id,
    device: session.device,
    detail: `${session.location || 'Localização não informada'} · ${session.ip ?? 'IP indisponível'} · Última atividade: ${new Date(session.last_activity).toLocaleString('pt-BR')}`,
    current: session.current,
  })),
)
const preferences = ref(clone(saved.preferences.value))

// o tema é aplicado na hora, para a pessoa ver o resultado antes de salvar
watch(
  () => preferences.value.theme,
  (value) => setTheme(value),
)

async function loadProfile(): Promise<void> {
  isLoading.value = true
  loadError.value = ''
  try {
    const [user, settings] = await Promise.all([auth.loadUser(), fetchSettings()])
    if (!user) throw new Error('Sua sessão expirou. Entre novamente.')
    saved.profile.value = {
      ...saved.profile.value,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar_url: user.avatar_url,
      timezone: settings.timezone,
      language: settings.locale,
    }
    profile.value = clone(saved.profile.value)
    saved.notifications.value = notificationSettings(settings)
    notifications.value = clone(saved.notifications.value)
    saved.preferences.value = {
      theme: settings.theme,
      date_format: settings.date_format,
      week_start: settings.week_start,
      compact_cards: settings.compact_cards,
      show_completed: settings.show_completed,
    }
    preferences.value = clone(saved.preferences.value)
    setTheme(settings.theme)
  } catch (error) {
    loadError.value = getErrorMessage(error, 'Não foi possível carregar seu perfil.')
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProfile)
onBeforeUnmount(() => {
  disposed = true
  avatarUpload?.abort()
  clearPendingAvatar()
  if (preferences.value.theme !== saved.preferences.value.theme) {
    setTheme(saved.preferences.value.theme)
  }
})

function selectAvatar(file: File): void {
  if (isSaving.value || isUploadingAvatar.value) return
  avatarUploadError.value = ''
  try {
    validateAvatar(file)
    cropSource.value = file
  } catch (error) {
    avatarUploadError.value = getErrorMessage(error, 'Não foi possível abrir sua foto.')
  }
}

function cameraPhoto(file: File): void {
  cameraOpen.value = false
  selectAvatar(file)
}

function clearPendingAvatar(): void {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value)
  avatarPreview.value = ''
  pendingAvatar.value = null
}

function confirmCrop(file: File): void {
  clearPendingAvatar()
  pendingAvatar.value = file
  avatarPreview.value = URL.createObjectURL(file)
  cropSource.value = null
  avatarUploadError.value = ''
}

async function loadSessions(): Promise<void> {
  if (isLoadingSessions.value) return
  isLoadingSessions.value = true
  sessionsError.value = ''
  try {
    await auth.loadSessions()
  } catch (error) {
    sessionsError.value = getErrorMessage(error, 'Não foi possível carregar suas sessões.')
  } finally {
    isLoadingSessions.value = false
  }
}

watch(activeTab, (tab) => {
  if (tab === 'security') void loadSessions()
})

async function endSession(id: number): Promise<void> {
  if (endingSession.value !== null || !auth.sessions.some((s) => s.id === id && !s.current)) return
  endingSession.value = id
  try {
    await auth.endSession(id)
    toast.success('Sessão encerrada.')
  } catch (error) {
    toast.error(getErrorMessage(error, 'Não foi possível encerrar a sessão.'))
  } finally {
    endingSession.value = null
  }
}

async function handleSave(): Promise<void> {
  if (
    activeTab.value === 'security' ||
    activeTab.value === 'organization' ||
    isLoading.value ||
    isSaving.value ||
    isUploadingAvatar.value ||
    loadError.value
  )
    return
  isSaving.value = true
  try {
    if (activeTab.value === 'profile') {
      const payload = profilePayload(profile.value)
      if (pendingAvatar.value) {
        avatarUploadError.value = ''
        const controller = new AbortController()
        avatarUpload = controller
        isUploadingAvatar.value = true
        try {
          const url = await uploadAvatar(pendingAvatar.value, controller.signal)
          if (disposed) return
          payload.avatar_url = url
          profile.value.avatar_url = url
          // Reuse a successful upload if the subsequent profile PATCH needs a retry.
          clearPendingAvatar()
        } catch (error) {
          if (!disposed)
            avatarUploadError.value = getErrorMessage(
              error,
              'Não foi possível enviar sua foto. Tente novamente.',
            )
          throw error
        } finally {
          isUploadingAvatar.value = false
          avatarUpload = undefined
        }
      }
      const updated = await auth.updateProfile(payload)
      // Preserve a successful profile write if the separate settings write fails.
      saved.profile.value = {
        ...saved.profile.value,
        name: updated.name,
        email: updated.email,
        bio: updated.bio,
        avatar_url: updated.avatar_url,
      }
      const settings = await updateSettings({
        timezone: profile.value.timezone,
        locale: profile.value.language,
      })
      saved.profile.value = {
        ...saved.profile.value,
        timezone: settings.timezone,
        language: settings.locale,
      }
      profile.value = clone(saved.profile.value)
    } else if (activeTab.value === 'notifications') {
      const settings = await updateSettings({ ...notifications.value })
      saved.notifications.value = notificationSettings(settings)
      notifications.value = clone(saved.notifications.value)
    } else {
      const settings = await updateSettings({ ...preferences.value })
      saved.preferences.value = {
        theme: settings.theme,
        date_format: settings.date_format,
        week_start: settings.week_start,
        compact_cards: settings.compact_cards,
        show_completed: settings.show_completed,
      }
      preferences.value = clone(saved.preferences.value)
      setTheme(settings.theme)
    }
    if (!disposed) toast.success('Alterações salvas.')
  } catch (error) {
    if (!disposed) toast.error(getErrorMessage(error, 'Não foi possível atualizar seu perfil.'))
  } finally {
    isSaving.value = false
  }
}

function handleCancel() {
  if (isSaving.value || isUploadingAvatar.value) return
  avatarUploadError.value = ''
  if (activeTab.value === 'profile') {
    clearPendingAvatar()
    cropSource.value = null
    cameraOpen.value = false
    profile.value = clone(saved.profile.value)
  }
  if (activeTab.value === 'notifications') notifications.value = clone(saved.notifications.value)
  if (activeTab.value === 'preferences') {
    preferences.value = clone(saved.preferences.value)
    setTheme(preferences.value.theme)
  }
}
</script>

<template>
  <div
    class="flex min-h-dvh w-full min-w-0 flex-col bg-(--background) dark:bg-(--background-inverse)"
  >
    <TopbarComp :crumbs="['Configurações', current.label]" />

    <section
      class="flex flex-1 flex-col gap-[16px] px-[20px] pt-[24px] pb-[28px] sm:px-[36px] xl:px-[44px]"
    >
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
            :disabled="isSaving || isLoading || isUploadingAvatar"
            @click="handleCancel"
          />
          <BaseButton
            label="Salvar alterações"
            :full-width="false"
            class="mt-0!"
            :loading="isSaving"
            :disabled="
              activeTab === 'security' ||
              activeTab === 'organization' ||
              isLoading ||
              isUploadingAvatar ||
              !!loadError
            "
            @click="handleSave"
          />
        </div>
      </SubheaderComp>

      <ConfigTabs v-model="activeTab" :tabs="TABS" />

      <p v-if="isLoading" role="status">Carregando perfil…</p>
      <div v-else-if="loadError" role="alert">
        <p>{{ loadError }}</p>
        <BaseButton label="Tentar novamente" :full-width="false" @click="loadProfile" />
      </div>

      <div
        v-if="!isLoading && !loadError"
        :id="`config-panel-${activeTab}`"
        role="tabpanel"
        :aria-labelledby="`config-tab-${activeTab}`"
        tabindex="0"
        class="outline-none"
      >
        <form v-if="activeTab === 'profile'" @submit.prevent="handleSave">
          <fieldset :disabled="isSaving" class="min-w-0">
            <ProfileTab
              v-model="profile"
              :timezones="timezones"
              :languages="languages"
              :uploading="isUploadingAvatar"
              :upload-error="avatarUploadError"
              :avatar-preview="avatarPreview"
              :pending-avatar="!!pendingAvatar"
              @select-avatar="selectAvatar"
              @open-camera="cameraOpen = true"
              @change-email="$router.push({ name: 'ChangeEmail' })"
            />
          </fieldset>
        </form>
        <fieldset v-else-if="activeTab === 'notifications'" :disabled="isSaving" class="min-w-0">
          <NotificationsTab v-model="notifications" />
        </fieldset>
        <SecurityTab
          v-else-if="activeTab === 'security'"
          :sessions="sessions"
          :loading="isLoadingSessions"
          :error="sessionsError"
          :ending-session="endingSession"
          @end-session="endSession"
          @retry="loadSessions"
        />
        <div v-else-if="activeTab === 'organization'" class="grid max-w-[480px] gap-[12px]">
          <template v-if="organizations.current">
            <p>
              Você está em <strong>{{ organizations.current.name }}</strong
              >. Edite nome, endereço, logo e descrição na página da organização.
            </p>
            <BaseButton
              label="Editar organização"
              icon="edit"
              icon-position="left"
              :full-width="false"
              @click="
                $router.push({
                  name: 'OrganizationSettings',
                  params: { organizationId: organizations.current.id },
                })
              "
            />
          </template>
          <p v-else>Nenhuma organização selecionada.</p>
        </div>
        <fieldset v-else :disabled="isSaving" class="min-w-0">
          <PreferencesTab v-model="preferences" />
        </fieldset>
      </div>
    </section>
    <AvatarCameraDialog v-if="cameraOpen" @cancel="cameraOpen = false" @confirm="cameraPhoto" />
    <AvatarCropDialog
      v-if="cropSource"
      :file="cropSource"
      @cancel="cropSource = null"
      @confirm="confirmCrop"
    />
  </div>
</template>
