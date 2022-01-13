import type { UseGetReturn } from 'restful-react'
import type { StringKeys } from 'framework/strings'

export interface MetricWidget {
  widgetName: string
  dataSets: {
    id: string
    name: string
    query: string
  }[]
}

export interface MetricDashboardItem {
  itemId: string
  title: string
}

export interface MetricDashboardWidgetNavProps<T> {
  className?: string
  dashboards: MetricDashboardItem[]
  manuallyInputQueries?: string[]
  connectorIdentifier: string
  onSelectMetric: (
    id: string,
    metricName: string,
    query: string,
    widgetName?: string,
    dashboardId?: string,
    dashboardTitle?: string
  ) => void
  showSpinnerOnLoad?: boolean
  addManualQueryTitle: StringKeys
  dashboardWidgetMapper: (dashboardId: string, item: T) => MetricWidget
  dashboardDetailsRequest: UseGetReturn<any, any, any>
}

export interface TreeNodeLabelProps {
  width: number
  label: string | JSX.Element
}

export type NodeDataType = {
  type: string
  data?: any
}
