export interface GoogleAuthUrlResponse {
  url: string
}
export interface GoogleConnectRequest {
  code: string
  state: string
}
export interface GoogleConnectionStatus {
  connected: boolean
}
