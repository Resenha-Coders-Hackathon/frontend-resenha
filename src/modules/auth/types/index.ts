import type { ISODateTime, UUID } from '@/shared/types'

/** UserListRetrieveSerializer response. */
export interface User {
  id: UUID
  name: string
  email: string
  created_at: ISODateTime
}

/** UserSessionSerializer response. */
export interface UserSession {
  id: number
  device: string
  ip: string | null
  created_at: ISODateTime
  current: boolean
}

export interface UpdateUserRequest {
  name: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface GoogleLoginRequest {
  credential: string
}

export interface RegistrationRequest {
  email: string
}

export interface RegistrationConfirmation {
  email: string
  code: string
  name: string
  password: string
}

export interface PasswordResetVerification {
  email: string
  code: string
}

export interface PasswordResetConfirmation extends PasswordResetVerification {
  new_password: string
}
