import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export const MetricType = {
  ANOMALOUS: 'Anomalous',
  NON_ANOMALOUS: 'Non-Anomalous'
}

export const MetricTypeOptions: SelectOption[] = [
  {
    label: `All Metrics`,
    value: MetricType.NON_ANOMALOUS
  },
  {
    label: `${MetricType.ANOMALOUS} Metrics`,
    value: MetricType.ANOMALOUS
  }
]

export const POLLING_INTERVAL = 15000
export const PAGE_SIZE = 10
export const DEFAULT_PAGINATION_VALUEE = {
  pageIndex: -1,
  pageItemCount: 0,
  pageSize: 5,
  totalPages: 0,
  totalItems: 0
}
