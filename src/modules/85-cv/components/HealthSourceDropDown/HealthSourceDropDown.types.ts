import type { GetDataError } from 'restful-react'
import type { RestResponseSetHealthSourceDTO } from 'services/cv'

export interface HealthSourceDropDownProps {
  onChange: (selectedHealthSource: string) => void
  serviceIdentifier: string
  environmentIdentifier: string
  className?: string
  verificationType?: string
}

export interface DropdownData {
  verificationType?: string
  data: RestResponseSetHealthSourceDTO | null
  error: GetDataError<unknown> | null
  loading: boolean
}
