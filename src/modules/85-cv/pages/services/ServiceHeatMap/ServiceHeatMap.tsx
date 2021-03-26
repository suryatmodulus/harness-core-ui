import React, { useEffect, useMemo } from 'react'
import { Color, Container, OverlaySpinner, Text, TextProps } from '@wings-software/uicore'
import moment from 'moment'
import { isNumber } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import HeatMap, { CellStatusValues, SerieConfig, OnCellClick } from '@common/components/HeatMap/HeatMap'
import { HeatMapDTO, useGetHeatmap } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { RiskScoreTile } from '@cv/components/RiskScoreTile/RiskScoreTile'
import { riskScoreToRiskLabel } from '@cv/pages/dashboard/CategoryRiskCards/CategoryRiskCards'
import { useStrings } from 'framework/exports'
import i18n from './ServiceHeatMap.i18n'
import css from './Service_Heatmap.module.scss'

interface ServiceHeatMapProps {
  startTime: number
  endTime: number
  environmentIdentifier?: string
  serviceIdentifier?: string
  onClickHeatMapCell?: (startTime?: number, endTime?: number, series?: SerieConfig) => void
  className?: string
}

const HeatMapTitleTextProps: TextProps = {
  margin: { bottom: 'xsmall' },
  font: { size: 'small' }
}

function generateTimestampForTooltip(startTime?: number, endTime?: number): string {
  if (!startTime || !endTime) {
    return ''
  }

  const startTimeMoment = moment(startTime)
  const endTimeMoment = moment(endTime)

  if (startTimeMoment.day() === endTimeMoment.day()) {
    return `${startTimeMoment.format('M/D/YYYY')} ${startTimeMoment.format('h:mm a')} - ${endTimeMoment.format(
      'h:mm a'
    )}`
  }

  return `${startTimeMoment.format('M/D/YYYY h:mm a')} - ${endTimeMoment.format('M/D/YYYY h:mm a')}`
}

function HeatMapTooltip({ cell, series, isSelected, onDismiss }: OnCellClick): JSX.Element {
  const { getString } = useStrings()
  const riskScore = generateTimestampForTooltip(cell?.startTime, cell?.endTime)
  const tooltipText = !isNumber(cell?.riskScore)
    ? getString('cv.noAnalysis')
    : `${riskScoreToRiskLabel(cell?.riskScore * 100)} ${series?.name ?? ''} ${getString('cv.riskScore')}`
  return cell ? (
    <Container className={css.heatmapTooltip}>
      {isSelected && (
        <Text
          color={Color.WHITE}
          className={css.resetButton}
          onClick={e => {
            e.stopPropagation()
            onDismiss()
          }}
        >
          {getString('closeSelection')}
        </Text>
      )}
      {cell.startTime && cell.endTime && (
        <Text color={Color.GREY_250} font={{ size: 'small' }} className={css.tooltipTimestamp}>
          {riskScore}
        </Text>
      )}
      <Container className={css.overallScoreContent}>
        <RiskScoreTile riskScore={isNumber(cell?.riskScore) ? Math.floor(cell.riskScore * 100) : -1} />
        <Text font={{ size: 'small' }} className={css.overallRiskScore} color={Color.GREY_250}>
          {tooltipText}
        </Text>
      </Container>
    </Container>
  ) : (
    <Container className={css.heatmapTooltip}>
      <Text className={css.overallScoreContent}>{i18n.heatMapTooltipText.noData}</Text>
    </Container>
  )
}

function mapHeatmapValue(val: any): number | CellStatusValues {
  return val && typeof val.riskScore === 'number' ? val.riskScore : CellStatusValues.Missing
}

function getHeatmapCellTimeRange(heatmapData: HeatMapDTO[]): string {
  if (!heatmapData?.length) return ''
  const timeDifference = moment(heatmapData[0]?.endTime).diff(heatmapData[0]?.startTime, 'minutes')
  if (timeDifference > 60) {
    return `(${moment(heatmapData[0]?.endTime).diff(heatmapData[0]?.startTime, 'hours')} ${i18n.hours} ${
      i18n.heatmapCellTimeRangeText
    })`
  }
  return `(${timeDifference} ${i18n.minutes} ${i18n.heatmapCellTimeRangeText})`
}

export default function ServiceHeatMap(props: ServiceHeatMapProps): JSX.Element {
  const { serviceIdentifier, environmentIdentifier, startTime, endTime, className, onClickHeatMapCell } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const categoryNames: any = {
    Performance: getString('performance'),
    Errors: getString('errors'),
    Infrastructure: getString('infrastructureText')
  }

  const { loading: loadingHeatmap, refetch: getHeatmap, data: rawHeatMapData } = useGetHeatmap({ lazy: true })

  const heatmapData: SerieConfig[] = useMemo(() => {
    if (!rawHeatMapData?.resource) return []
    const mappedData = []
    for (const datum of Object.keys(rawHeatMapData.resource)) {
      if (categoryNames[datum] && rawHeatMapData.resource[datum]) {
        mappedData.push({ name: categoryNames[datum], data: rawHeatMapData?.resource[datum] })
      }
    }
    return mappedData
  }, [rawHeatMapData])

  useEffect(() => {
    if (!startTime || !endTime) return
    getHeatmap({
      queryParams: {
        accountId: accountId,
        envIdentifier: environmentIdentifier,
        serviceIdentifier,
        projectIdentifier,
        orgIdentifier,
        startTimeMs: startTime,
        endTimeMs: endTime
      }
    })
  }, [projectIdentifier, orgIdentifier, accountId, startTime, endTime, serviceIdentifier, environmentIdentifier])

  const heatMapSize = useMemo(() => {
    return Math.max(...heatmapData.map(({ data }) => data.length)) || 48
  }, [heatmapData])

  return (
    <Container className={cx(css.main, className)}>
      <Text {...HeatMapTitleTextProps} color={Color.BLACK}>
        {`${i18n.heatmapSectionTitleText} ${getHeatmapCellTimeRange(heatmapData?.[0]?.data)}`}
      </Text>
      <OverlaySpinner show={loadingHeatmap}>
        <HeatMap
          series={heatmapData}
          minValue={0}
          maxValue={1}
          labelsWidth={205}
          className={css.serviceHeatMap}
          mapValue={mapHeatmapValue}
          renderTooltip={cellInfo => <HeatMapTooltip {...cellInfo} />}
          cellShapeBreakpoint={0.5}
          onCellClick={(cell: HeatMapDTO, series: SerieConfig) => {
            if (cell?.startTime && cell?.endTime) {
              onClickHeatMapCell?.(cell.startTime, cell.endTime, series)
            } else {
              onClickHeatMapCell?.()
            }
          }}
          rowSize={heatMapSize}
        />
      </OverlaySpinner>
    </Container>
  )
}
