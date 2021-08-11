import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export interface MapGCPLogsQueriesToServiceProps {
  onChange: (name: string, value: string | SelectOption) => void
  sampleRecord: Record<string, any> | null
  isQueryExecuted: boolean
  loading: boolean
}
