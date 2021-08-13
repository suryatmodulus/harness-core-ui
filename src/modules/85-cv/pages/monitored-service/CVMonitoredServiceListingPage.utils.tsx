import React from 'react'
import { isNull, isNumber } from 'lodash-es'
import Highcharts, { PointOptionsObject } from 'highcharts'
import { Text, Layout, SelectOption } from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import type { Renderer, CellProps } from 'react-table'
import { useStrings, UseStringsReturn } from 'framework/strings'
import type {
  EnvironmentResponse,
  MonitoredServiceListItemDTO,
  ResponseListEnvironmentResponse,
  RiskData
} from 'services/cv'
import { getRiskColorValue } from '@common/components/HeatMap/ColorUtils'
import type { FilterEnvInterface } from './CVMonitoredServiceListingPage.types'
import { HistoricalTrendChartOption } from './CVMonitoredServiceListingPage.constants'
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

export const getLabelMapping = (value: string, getString: UseStringsReturn['getString']): string => {
  const LabelRiskMapping: { [key: string]: string } = {
    NO_DATA: getString('noData'),
    NO_ANALYSIS: getString('cv.noAnalysis'),
    LOW: getString('cv.monitoredServices.riskLabel.lowRisk'),
    MEDIUM: getString('cv.monitoredServices.riskLabel.mediumRisk'),
    HIGH: getString('cv.monitoredServices.riskLabel.highRisk')
  }
  return LabelRiskMapping[value]
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
    <Layout.Horizontal className={css.healthScoreCardContainer}>
      <div className={css.healthScoreCard} style={{ background: color }}>
        {healthScore > -1 ? healthScore : ''}
      </div>
      <Text>{riskStatus && getLabelMapping(riskStatus, getString)}</Text>
    </Layout.Horizontal>
  )
}

export const RenderTags: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const rowdata = row?.original
  const tagskeys = rowdata?.tags ? Object.keys(rowdata?.tags) : []
  return (
    <Layout.Horizontal className={css.tagsText}>
      {tagskeys.map((tag, index) => (
        <>
          <Text key={tag}>{tag} </Text>
          {index !== tagskeys.length - 1 && <Text>,</Text>}
        </>
      ))}
    </Layout.Horizontal>
  )
}

export const getEnvironmentOptions = (
  environmentList: ResponseListEnvironmentResponse,
  allValue: string
): SelectOption[] => {
  const allOption: SelectOption = { label: allValue, value: allValue }
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
