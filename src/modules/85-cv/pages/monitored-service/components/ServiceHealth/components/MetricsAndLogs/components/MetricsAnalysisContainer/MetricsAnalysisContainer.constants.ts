import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import { MetricTypes } from './MetricsAnalysisContainer.types'

export const metricTypeOptions = (getString: UseStringsReturn['getString']): SelectOption[] => [
  {
    label: getString('cv.allMetrics'),
    value: ''
  },
  {
    label: getString('pipeline.verification.anomalousMetrics'),
    value: MetricTypes.ANOMALOUS
  }
]

export const PAGE_SIZE = 10
