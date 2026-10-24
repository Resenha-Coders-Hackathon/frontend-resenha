<script setup lang="ts">
import type { PreferenceSettings, SelectOption } from '../types'
import ConfigCard from './configCard.vue'
import ConfigField from './configField.vue'
import ConfigToggle from './configToggle.vue'

const settings = defineModel<PreferenceSettings>({ required: true })

const THEMES = [
  { value: 'light', label: 'Claro', icon: 'light_mode' },
  { value: 'dark', label: 'Escuro', icon: 'dark_mode' },
  { value: 'system', label: 'Sistema', icon: 'contrast' },
] as const

const DATE_FORMATS: SelectOption[] = [
  { value: 'dd/mm/yyyy', label: '23/10/2026' },
  { value: 'yyyy-mm-dd', label: '2026-10-23' },
  { value: 'long', label: '23 de out. de 2026' },
]

const WEEK_STARTS: SelectOption[] = [
  { value: 'sunday', label: 'Domingo' },
  { value: 'monday', label: 'Segunda-feira' },
]
</script>

<template>
  <div class="grid items-start gap-[16px] xl:grid-cols-2">
    <ConfigCard title="Aparência">
      <fieldset class="flex flex-col gap-[6px]">
        <legend class="mb-[6px] text-[13px] leading-normal font-medium">Tema</legend>
        <div class="grid grid-cols-2 gap-[12px]">
          <label
            v-for="theme in THEMES"
            :key="theme.value"
            :class="[
              'flex cursor-pointer items-center gap-[10px] rounded-[10px] border px-[12px] py-[12px] text-[14px] leading-5 transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2',
              settings.theme === theme.value
                ? 'border-(--border-strong) dark:border-(--text-inverse-muted)'
                : 'border-(--border-default) hover:border-(--text-muted) dark:border-(--border-inverse)',
            ]"
          >
            <input
              v-model="settings.theme"
              type="radio"
              name="theme"
              :value="theme.value"
              class="sr-only"
            />
            <span class="material-symbols-outlined text-[18px]!" aria-hidden="true">{{
              theme.icon
            }}</span>
            {{ theme.label }}
          </label>
        </div>
      </fieldset>

      <div class="flex flex-col gap-[16px] sm:flex-row">
        <ConfigField
          id="preferences-date-format"
          v-model="settings.date_format"
          as="select"
          label="Formato de data"
          :options="DATE_FORMATS"
        />
        <ConfigField
          id="preferences-week-start"
          v-model="settings.week_start"
          as="select"
          label="Semana começa em"
          :options="WEEK_STARTS"
        />
      </div>
    </ConfigCard>

    <ConfigCard title="Kanban" class="gap-[6px]!">
      <div>
        <ConfigToggle
          v-model="settings.compact_cards"
          label="Cartões compactos"
          description="Mostra mais tarefas por coluna"
        />
        <ConfigToggle
          v-model="settings.show_completed"
          label="Mostrar tarefas concluídas"
          description="Mantém a coluna de concluídas visível no board"
        />
      </div>
    </ConfigCard>
  </div>
</template>
