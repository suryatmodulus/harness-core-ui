import React, { useState, useEffect } from 'react'
import { Container, Text, Icon, Color } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import classnames from 'classnames'
import { useParams } from 'react-router-dom'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useGetBuildHealth } from 'services/ci'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { RangeSelectorWithTitle } from '../RangeSelector'
import { roundNumber, formatDuration, useErrorHandler, useRefetchCall } from '../shared'
import styles from './CIDashboardSummaryCards.module.scss'

export interface SummaryCardProps {
  title: string
  text?: any
  subContent?: React.ReactNode
  rate?: number
  rateDuration?: number
  isLoading?: boolean
  neutralColor?: boolean
}

export default function CIDashboardSummaryCards() {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [range, setRange] = useState([Date.now() - 30 * 24 * 60 * 60000, Date.now()])
  const [chartOptions, setChartOptions] = useState<any>(null)

  const { data, loading, error, refetch } = useGetBuildHealth({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      startTime: range[0],
      endTime: range[1]
    }
  })

  useErrorHandler(error)
  const refetching = useRefetchCall(refetch, loading)
  const showLoader = loading && !refetching

  useEffect(() => {
    const success = data?.data?.builds?.success?.count
    const failed = data?.data?.builds?.failed?.count
    if (typeof success === 'number' && typeof failed === 'number') {
      setChartOptions({
        ...defaultChartOptions,
        series: [
          {
            name: 'Failed',
            type: 'bar',
            color: 'var(--ci-color-red-500)',
            data: [failed]
          },
          {
            name: 'Success',
            type: 'bar',
            color: 'var(--ci-color-green-500)',
            data: [success]
          }
        ]
      })
    }
  }, [data?.data?.builds])

  return (
    <Container>
      <RangeSelectorWithTitle title={getString('pipeline.dashboards.buildHealth')} onRangeSelected={setRange} />
      <Container className={styles.summaryCards}>
        <SummaryCard
          title={getString('pipeline.dashboards.totalBuilds')}
          text={data?.data?.builds?.total?.count}
          subContent={chartOptions && <HighchartsReact highcharts={Highcharts} options={chartOptions} />}
          rate={data?.data?.builds?.total?.rate}
          isLoading={showLoader}
          neutralColor
        />
        {/* <SummaryCard title={getString('pipeline.dashboards.testCycleTimeSaved')} /> */}
        <SummaryCard
          title={getString('pipeline.dashboards.successfulBuilds')}
          text={data?.data?.builds?.success?.count}
          rate={data?.data?.builds?.success?.rate}
          isLoading={showLoader}
        />
        <SummaryCard
          title={getString('pipeline.dashboards.failedBuilds')}
          text={data?.data?.builds?.failed?.count}
          rate={data?.data?.builds?.failed?.rate}
          isLoading={showLoader}
        />
      </Container>
    </Container>
  )
}

export function SummaryCard({
  title,
  text,
  subContent,
  rate,
  rateDuration,
  isLoading,
  neutralColor
}: SummaryCardProps) {
  const isEmpty = typeof text === 'undefined'
  let rateFormatted
  let isIncrease = false
  let isDecrease = false
  if (typeof rate !== 'undefined') {
    isIncrease = rate > 0
    isDecrease = rate < 0
    rateFormatted = `${Math.abs(roundNumber(rate!)!)}%`
  } else if (typeof rateDuration === 'number') {
    isIncrease = rateDuration > 0
    isDecrease = rateDuration < 0
    rateFormatted = formatDuration(rateDuration)
  }
  return (
    <Container
      className={classnames(styles.card, {
        [styles.variantIncrease]: isIncrease && !neutralColor,
        [styles.variantDecrease]: isDecrease && !neutralColor
      })}
    >
      <Container className={styles.cardHeader}>{title}</Container>
      <Container className={styles.cardContent}>
        <Container className={styles.contentMain}>
          {isLoading && <Container height={30} width={100} className={Classes.SKELETON} />}
          {!isLoading &&
            (!isEmpty ? (
              <Text className={styles.contentMainText}>{text}</Text>
            ) : (
              <Container height={30} width={100} background={Color.GREY_200} />
            ))}
          {!isLoading && !isEmpty && <Container className={styles.subContent}>{subContent}</Container>}
        </Container>
        {!isEmpty && !isLoading && (
          <Container className={styles.diffContent}>
            <Text>{rateFormatted}</Text>
            {(isIncrease || isDecrease) && (
              <Icon name="fat-arrow-up" style={isDecrease ? { transform: 'rotate(180deg)' } : {}} size={18} />
            )}
          </Container>
        )}
      </Container>
    </Container>
  )
}

const defaultChartOptions: Highcharts.Options = {
  chart: {
    type: 'bar',
    backgroundColor: 'transparent',
    height: 15,
    width: 200,
    spacing: [5, 0, 5, 0]
  },
  credits: undefined,
  title: {
    text: ''
  },
  legend: {
    enabled: false
  },
  plotOptions: {
    bar: {
      stacking: 'normal',
      pointPadding: 0,
      borderWidth: 3,
      borderRadius: 4,
      pointWidth: 6
    },
    series: {
      stickyTracking: false,
      lineWidth: 1
    },
    line: {
      marker: {
        enabled: false
      }
    }
  },
  tooltip: {
    outside: true
  },
  xAxis: {
    labels: { enabled: false },
    title: {
      text: ''
    },
    gridLineWidth: 0,
    lineWidth: 0,
    tickLength: 0
  },
  yAxis: {
    labels: { enabled: false },
    title: {
      text: ''
    },
    gridLineWidth: 0,
    lineWidth: 0,
    tickLength: 0
  }
}
