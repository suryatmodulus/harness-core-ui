import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StackdriverDashboardDTO } from 'services/cv'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'

export interface GCOMetricInfo {
  dashboardName?: string
  dashboardPath?: string
  metricName?: string
  query?: string
  environment?: SelectOption
  service?: SelectOption
  metricTags?: { [key: string]: string }
  riskCategory?: string
  higherBaselineDeviation?: boolean
  lowerBaselineDeviation?: boolean
  isManualQuery?: boolean
  tooManyMetrics?: boolean
}

export interface GCOMetricSetupSource {
  isEdit: boolean
  metricDefinition: Map<string, GCOMetricInfo> // metricName to MapPrometheusQueryToService
  selectedDashboards: StackdriverDashboardDTO[]
  healthSourceIdentifier: string
  healthSourceName: string
  product: SelectOption
  connectorRef?: string
}

export interface GCOMetricsHealthSourceProps {
  data: any
  onSubmit: (formdata: GCOMetricSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export interface ValidationChartProps {
  loading: boolean
  error?: string
  queryValue?: string
  onRetry: () => void
  sampleData?: Highcharts.Options
  setAsTooManyMetrics?: (_: boolean) => void
}
