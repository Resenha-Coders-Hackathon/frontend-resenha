export type UUID = string
/** YYYY-MM-DD, as serialized by DRF. */
export type ISODate = string
/** ISO 8601 timestamp, as serialized by DRF. */
export type ISODateTime = string

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
export interface DetailResponse {
  detail: string
}
