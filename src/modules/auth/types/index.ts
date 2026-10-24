import type { ISODateTime, UUID } from '@/shared/types'

/** UserListRetrieveSerializer response. */
export interface User {
  id: UUID
  name: string
  email: string
  bio: string
  avatar_url: string
  created_at: ISODateTime
  /** Only /users/me/ exposes billing access and the server-defined price. */
  is_subscriber?: boolean
  subscription_price?: string
}

/** UserSessionSerializer response. */
export interface UserSession {
  id: number
  device: string
  ip: string | null
  created_at: ISODateTime
  current: boolean
  location: string
  last_activity: ISODateTime
}

export interface UpdateUserRequest {
  name?: string
  bio?: string
  avatar_url?: string
}

export type UpdatedUserProfile = Pick<User, 'name' | 'bio' | 'avatar_url'>

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
