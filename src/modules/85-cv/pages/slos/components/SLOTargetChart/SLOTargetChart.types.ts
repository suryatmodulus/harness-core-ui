import type { ServiceLevelIndicatorDTO, TimeGraphResponse } from 'services/cv'

export interface SLOTargetChartProps {
  topLabel?: JSX.Element
  bottomLabel?: JSX.Element
  dataPoints?: Highcharts.SeriesColumnOptions['data']
  customChartOptions?: Highcharts.Options
}

export interface SLOTargetChartWithAPIGetSliGraphProps extends SLOTargetChartProps {
  serviceLevelIndicator: ServiceLevelIndicatorDTO
  monitoredServiceIdentifier?: string
  sliGraphData?: TimeGraphResponse
  loading?: boolean
  error?: string
  retryOnError: (serviceLevelIndicator: ServiceLevelIndicatorDTO, monitoredServiceIdentifier?: string) => void
  debounceFetchSliGraphData?: (
    serviceLevelIndicator: ServiceLevelIndicatorDTO,
    monitoredServiceIdentifier?: string
  ) => Promise<void>
}
