import type { UseGetReturn } from 'restful-react'
import type { ReactNode } from 'react'
import type { FormikProps } from 'formik'
import type {
  MetricDashboardItem,
  MetricWidget
} from '@cv/components/MetricDashboardWidgetNav/MetricDashboardWidgetNav.type'
import type { DatasourceTypeEnum } from '@cv/pages/monitored-service/components/ServiceHealth/components/MetricsAndLogs/MetricsAndLogs.types'
import type { TimeSeriesSampleDTO } from 'services/cv'
import type { StringKeys } from 'framework/strings'
import type { DatadogMetricInfo } from '@cv/pages/health-source/connectors/DatadogMetricsHealthSource/DatadogMetricsHealthSource.type'

export interface SelectedWidgetMetricData {
  id: string
  metricName: string
  query: string
  widgetName?: string
  dashboardTitle?: string
  dashboardId?: string
}

export interface SelectedMetricInfo {
  query?: string
  queryEditable?: boolean
  timeseriesData?: TimeSeriesSampleDTO[] | null
}

export interface CloudMetricsHealthSourceProps<T> {
  metricDetailsContent: ReactNode
  selectedMetricInfo: SelectedMetricInfo
  onFetchTimeseriesData: () => void
  timeseriesDataLoading: boolean
  timeseriesDataError?: string
  dashboards: MetricDashboardItem[]
  connectorRef: string
  onWidgetMetricSelected: (selectedWidgetMetricData: SelectedWidgetMetricData) => void
  onNextClicked: () => void
  manualQueries: string[]
  addManualQueryTitle: StringKeys
  dataSourceType: DatasourceTypeEnum
  dashboardDetailRequest: UseGetReturn<any, any, any>
  dashboardDetailMapper: (dashboardId: string, detail: T) => MetricWidget
  formikProps: FormikProps<DatadogMetricInfo>
}
