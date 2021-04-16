import React, { useEffect, useMemo } from 'react'
import { Container, Text, Color, Pagination, Icon } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { PageError } from '@common/components/Page/PageError'
import { Frequency, useGetAllLogs } from 'services/cv'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { LogAnalysisRow, LogAnalysisRowData } from './LogAnalysisRow/LogAnalysisRow'
import LogAnalysisFrequencyChart from './LogAnalysisFrequencyChart/LogAnalysisFrequencyChart'
import { categoryNameToCategoryType } from '../../CVServicePageUtils'
import css from './LogAnalysisView.module.scss'

interface LogAnalysisViewProps {
  startTime: number
  endTime: number
  environmentIdentifier?: string
  serviceIdentifier?: string
  categoryName?: string
  historyStartTime?: number
}

function generatePointsForLogFrequency(
  trend: Frequency[],
  startTime: number,
  endTime: number
): Highcharts.SeriesLineOptions[] {
  if (!trend || !Object.keys(trend).length) {
    return []
  }

  trend.sort((trendDataA, trendDataB) => {
    if (!trendDataA?.timestamp) {
      return trendDataB?.timestamp ? -1 : 0
    }
    if (!trendDataB?.timestamp) {
      return trendDataA.timestamp
    }

    return trendDataA.timestamp - trendDataB.timestamp
  })

  const filledMetricData = []
  let trendIndex = 0
  for (let currTime = startTime; currTime <= endTime; currTime += 60000) {
    if (trend[trendIndex]?.timestamp === currTime) {
      filledMetricData.push({ x: currTime, y: trend[trendIndex]?.count })
      trendIndex++
    } else {
      filledMetricData.push({ x: currTime, y: 0 })
    }
  }

  return [
    {
      type: 'line',
      name: 'Installation',
      data: filledMetricData,
      zoneAxis: 'x',
      zones: [
        // {
        //   value: data[Math.floor(Math.random() * 14)].x,
        //   color: 'var(--primary-7)'
        // },
        // {
        //   color: 'var(--red-500)'
        // }
      ]
    }
  ]
}

export default function LogAnalysisView(props: LogAnalysisViewProps): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { environmentIdentifier, serviceIdentifier, startTime, endTime, categoryName, historyStartTime } = props
  const { getString } = useStrings()
  const finalStartTime = historyStartTime ?? startTime
  const { error, data: logAnalysisResponse, refetch: refetchLogAnalysis, loading } = useGetAllLogs({ lazy: true })
  const logAnalysisData = logAnalysisResponse?.resource?.content
  const logDataDTOs: LogAnalysisRowData[] = useMemo(() => {
    return (
      (logAnalysisData
        ?.map(d =>
          d?.logData
            ? {
                message: d.logData.text,
                clusterType: d.logData.tag,
                count: d.logData.count,
                messageFrequency: generatePointsForLogFrequency(d.logData.trend || [], startTime, endTime)
              }
            : undefined
        )
        .filter(l => !!l) as LogAnalysisRowData[]) || []
    )
  }, [logAnalysisData, startTime, endTime])

  const queryParams = useMemo(
    () => ({
      accountId,
      projectIdentifier,
      orgIdentifier,
      environmentIdentifier,
      serviceIdentifier,
      monitoringCategory: (categoryName ? categoryNameToCategoryType(categoryName) : undefined) as string,
      startTime,
      endTime
    }),
    [endTime, startTime, categoryName, serviceIdentifier, environmentIdentifier, projectIdentifier, orgIdentifier]
  )
  useEffect(() => {
    refetchLogAnalysis({ queryParams })
  }, [queryParams])

  if (error) {
    return (
      <PageError message={error?.message} className={css.error} onClick={() => refetchLogAnalysis({ queryParams })} />
    )
  }

  if (loading) {
    return (
      <Container className={css.loading}>
        <Icon name="steps-spinner" size={25} color={Color.GREY_600} />
      </Container>
    )
  }

  if (!logAnalysisResponse?.resource?.content?.length) {
    return (
      <NoDataCard
        message={getString('cv.noAnalysis')}
        buttonText={getString('retry')}
        icon="warning-sign"
        onClick={() => refetchLogAnalysis({ queryParams })}
        className={css.noDataCard}
      />
    )
  }

  const { pageSize, totalPages = 0, totalItems = 0, pageIndex, empty } = logAnalysisResponse.resource as any

  return (
    <Container className={css.main}>
      <Container className={css.heading}>
        <Text color={Color.BLACK} className={css.clusterHeading}>{`${getString('cv.analysisScreens.totalClusters')}${
          logAnalysisData?.length
        }`}</Text>
      </Container>
      <LogAnalysisFrequencyChart
        startTime={finalStartTime}
        endTime={endTime}
        environmentIdentifier={environmentIdentifier}
        serviceIdentifier={serviceIdentifier}
        categoryName={categoryName || ''}
      />
      <Container className={css.logContainer}>
        <LogAnalysisRow data={logDataDTOs} />
      </Container>
      {pageIndex !== -1 && !empty && (
        <Pagination
          pageSize={pageSize || 0}
          pageIndex={pageIndex}
          pageCount={totalPages}
          itemCount={totalItems}
          gotoPage={(selectedPageIndex: number) => {
            refetchLogAnalysis({ queryParams: { ...queryParams, page: selectedPageIndex } })
          }}
        />
      )}
    </Container>
  )
}
