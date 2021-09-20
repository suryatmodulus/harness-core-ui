import type { CategoryCountDetails } from 'services/cv'

export interface ChangeSourceCardInterfae {
  startTime: number
  endTime: number
}

export interface ChangeSourceCardData {
  id: string
  label: string
  count: number
  percentage: number
}

export interface CategoryCountMapInterface {
  [key: string]: CategoryCountDetails
}
