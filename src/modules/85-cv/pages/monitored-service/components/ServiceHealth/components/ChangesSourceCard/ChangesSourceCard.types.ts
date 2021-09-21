import type { CategoryCountDetails } from 'services/cv'
import type { TimePeriodEnum } from '../../ServiceHealth.constants'

export interface ChangeSourceCardInterfae {
  startTime: number
  endTime: number
  duration?: TimePeriodEnum
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
