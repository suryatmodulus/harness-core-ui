import type { GetDataError } from 'restful-react'
import type { RestResponseSetHealthSourceDTO } from 'services/cv'

export interface HealthSourceDropDownProps {
  onChange: (selectedHealthSource: string) => void
  className?: string
  verificationType?: string
  data: RestResponseSetHealthSourceDTO | null
  error: GetDataError<unknown> | null
  loading: boolean
}
