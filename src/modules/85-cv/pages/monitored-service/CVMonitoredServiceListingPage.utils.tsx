import React from 'react'
import { isNull, isNumber } from 'lodash-es'
import Highcharts, { PointOptionsObject } from 'highcharts'
import { Text, Layout, SelectOption, Color, Tag } from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import type { Renderer, CellProps } from 'react-table'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import type {
  ChangeSummaryDTO,
  EnvironmentResponse,
  MonitoredServiceListItemDTO,
  ResponseListEnvironmentResponse,
  RiskData
} from 'services/cv'
import { RiskValues, getRiskColorValue } from '@cv/utils/CommonUtils'
import type { FilterEnvInterface } from './CVMonitoredServiceListingPage.types'
import { HistoricalTrendChartOption, DefaultChangePercentage } from './CVMonitoredServiceListingPage.constants'
import css from './CVMonitoredServiceListingPage.module.scss'

export const getFilterAndEnvironmentValue = (environment: string, searchTerm: string): FilterEnvInterface => {
  const filter: FilterEnvInterface = {}
  if (environment && environment !== 'All') {
    filter['environmentIdentifier'] = environment
  }
  if (searchTerm) {
    filter['searchTerm'] = searchTerm
  }
  return filter
}

export const createTrendDataWithZone = (trendData: RiskData[]): Highcharts.SeriesLineOptions => {
  const highchartsLineData: PointOptionsObject[] = []
  let currentRiskColor: string | null = getRiskColorValue(trendData?.[0].riskStatus)
  const zones: Highcharts.SeriesZonesOptionsObject[] = [{ value: undefined, color: currentRiskColor }]

  trendData.forEach((dataPoint, index) => {
    const { riskStatus } = dataPoint || {}
    let { healthScore } = dataPoint || {}
    if (isNull(healthScore)) {
      healthScore = -2
    }
    const riskColor = getRiskColorValue(riskStatus)
    highchartsLineData.push({ x: index, y: healthScore })
    if (isNumber(healthScore) && riskStatus) {
      if (riskColor !== currentRiskColor) {
        zones[zones.length - 1].value = index
        zones.push({ value: undefined, color: riskColor })
        currentRiskColor = riskColor
      }
    } else {
      currentRiskColor = null
    }
  })

  return {
    data: highchartsLineData,
    zones,
    name: '',
    type: 'line',
    zoneAxis: 'x',
    clip: false
  }
}

export const getHistoricalTrendChartOption = (trendData: RiskData[]): Highcharts.Options => {
  return {
    ...HistoricalTrendChartOption,
    series: [
      {
        ...createTrendDataWithZone(trendData)
      }
    ]
  }
}

export const getRiskLabelStringId = (riskStatus?: keyof typeof RiskValues): keyof StringsMap => {
  switch (riskStatus) {
    case RiskValues.NO_DATA:
      return 'noData'
    case RiskValues.NO_ANALYSIS:
      return 'cv.noAnalysis'
    case RiskValues.HEALTHY:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.healthy'
    case RiskValues.OBSERVE:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.observe'
    case RiskValues.NEED_ATTENTION:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.needsAttention'
    case RiskValues.UNHEALTHY:
      return 'cv.monitoredServices.serviceHealth.serviceDependencies.states.unhealthy'
    default:
      return 'na'
  }
}

export const RenderHealthTrend: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const rowdata = row?.original
  if (rowdata?.historicalTrend?.healthScores) {
    const chartOptions = getHistoricalTrendChartOption(rowdata?.historicalTrend?.healthScores)
    return <HighchartsReact highcharts={Highcharts} options={chartOptions} />
  }
  return <></>
}

export const RenderHealthScore: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const rowdata = row?.original
  const { getString } = useStrings()
  if (!rowdata?.healthMonitoringEnabled) return <></>
  const { riskStatus, healthScore = -2 } = rowdata?.currentHealthScore || {}
  const color = getRiskColorValue(riskStatus)
  return (
    <Layout.Horizontal className={css.healthScoreCardContainer} spacing="small">
      <Tag className={css.healthScoreCard} style={{ backgroundColor: color }}>
        {healthScore > -1 ? healthScore : ''}
      </Tag>
      <Text color={Color.BLACK}>{getString(getRiskLabelStringId(riskStatus))}</Text>
    </Layout.Horizontal>
  )
}

export const getEnvironmentOptions = (
  environmentList: ResponseListEnvironmentResponse | null,
  loading: boolean,
  getString: UseStringsReturn['getString']
): SelectOption[] => {
  if (loading) {
    return [{ label: getString('loading'), value: 'loading' }]
  }
  if (environmentList?.data?.length) {
    const allOption: SelectOption = { label: getString('all'), value: getString('all') }
    const environmentSelectOption: SelectOption[] =
      environmentList?.data?.map((environmentData: EnvironmentResponse) => {
        const { name = '', identifier = '' } = environmentData?.environment || {}
        return {
          label: name,
          value: identifier
        }
      }) || []
    return [allOption, ...environmentSelectOption]
  }
  return []
}

export const calculateChangePercentage = (changeSummary: ChangeSummaryDTO): { color: string; percentage: number } => {
  if (changeSummary?.categoryCountMap) {
    const { categoryCountMap } = changeSummary
    const { Infrastructure, Deployment, Alert } = categoryCountMap as any
    const totalCount = Infrastructure?.count + Deployment?.count + Alert?.count
    const totalCountInPrecedingWindow =
      Infrastructure?.countInPrecedingWindow + Deployment?.countInPrecedingWindow + Alert?.countInPrecedingWindow
    const percentageChange: number =
      ((totalCount - totalCountInPrecedingWindow) / (totalCount + totalCountInPrecedingWindow)) * 100
    if (isNaN(totalCount) || isNaN(totalCountInPrecedingWindow) || isNaN(percentageChange)) {
      return DefaultChangePercentage
    }
    return {
      color: percentageChange > 0 ? Color.SUCCESS : Color.ERROR,
      percentage: Math.abs(Math.floor(percentageChange))
    }
  }
  return DefaultChangePercentage
}
