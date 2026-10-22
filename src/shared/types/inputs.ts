export interface IInputs {
  modelValue?: string
  type?: string
  placeholder?: string
  icon?: string
  label?: string
  disabled?: boolean
  required?: boolean
  inputmode?: 'numeric' | 'text' | 'decimal' | 'search' | 'tel' | 'url' | 'email' | 'none'
}
