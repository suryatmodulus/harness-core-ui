import type { Dispatch, SetStateAction } from 'react'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export interface MapGCPLogsQueriesToServiceProps {
  onChange: (name: string, value: string | SelectOption) => void
  serviceValue?: SelectOption
  environmentValue?: SelectOption
  serviceOptions: SelectOption[]
  setServiceOptions: Dispatch<SetStateAction<SelectOption[]>>
  environmentOptions: SelectOption[]
  setEnvironmentOptions: Dispatch<SetStateAction<SelectOption[]>>
  sampleRecord: Record<string, any> | null
  isQueryExecuted: boolean
  loading: boolean
}
