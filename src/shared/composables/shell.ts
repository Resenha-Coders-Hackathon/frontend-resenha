import { computed, inject, type ComputedRef, type InjectionKey } from 'vue'

/** O que o layout da aplicação oferece às telas: organização atual e notificações não lidas. */
export interface ShellContext {
  organization: ComputedRef<string>
  unread: ComputedRef<number>
}

export const ShellKey: InjectionKey<ShellContext> = Symbol('shell')

const empty: ShellContext = { organization: computed(() => ''), unread: computed(() => 0) }

export const useShell = (): ShellContext => inject(ShellKey, empty)
