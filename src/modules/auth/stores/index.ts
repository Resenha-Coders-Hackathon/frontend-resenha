import { defineStore } from 'pinia'
import { ref } from 'vue'

// Dados em memória entre as etapas de registro e de redefinição de senha.
// Nada é persistido: ao recarregar a página o fluxo recomeça.
export const useAuthFlowStore = defineStore('authFlow', () => {
  const email = ref('')
  const name = ref('')
  const password = ref('')
  const resetCode = ref('')

  function startRegistration(data: { email: string; name: string; password: string }) {
    email.value = data.email
    name.value = data.name
    password.value = data.password
    resetCode.value = ''
  }

  function startPasswordReset(value: string) {
    email.value = value
    name.value = ''
    password.value = ''
    resetCode.value = ''
  }

  function clear() {
    email.value = ''
    name.value = ''
    password.value = ''
    resetCode.value = ''
  }

  return { email, name, password, resetCode, startRegistration, startPasswordReset, clear }
})
