export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export interface UserSession {
  id: number
  device: string
  ip: string | null
  created_at: string
  current: boolean
}
export interface UpdateUserRequest {
  name: string
}
