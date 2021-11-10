import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { Container, Text, Avatar, Icon, Color } from '@wings-software/uicore'
import moment from 'moment'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import merge from 'lodash-es/merge'
import type { RepositoryBuildInfo } from 'services/ci'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { diffStartAndEndTime, roundNumber, FailedStatus, ActiveStatus, mapToExecutionStatus } from '../shared'
import styles from './BuildCards.module.scss'

export interface RepositoryCardProps {
  title: React.ReactNode
  message?: string
  username?: string
  avatarUrl?: string
  startTime?: number
  endTime?: number
  count: number
  successRate: number
  successRateDiff: number
  lastBuildStatus?: string
  countLabel?: string
  seriesName?: string
  countList?: RepositoryBuildInfo[]
  onClick?: () => void
  className?: string
}

export default function RepositoryCard({
  title,
  message,
  username,
  avatarUrl,
  startTime,
  endTime,
  count,
  successRate,
  successRateDiff,
  lastBuildStatus,
  countLabel = 'builds',
  seriesName = 'Builds',
  countList,
  onClick,
  className
}: RepositoryCardProps) {
  const [chartOptions, setChartOptions] = useState(defaultChartOptions)
  const duration = diffStartAndEndTime(startTime, endTime)
  const mapTime = (value: RepositoryBuildInfo) => (value?.time ? moment(value.time).format('YYYY-MM-DD') : '')

  useEffect(() => {
    if (countList?.length) {
      setChartOptions(
        merge({}, defaultChartOptions, {
          tooltip: {
            enabled: true
          },
          xAxis: {
            categories: countList.map(mapTime)
          },
          series: [
            {
              name: seriesName,
              type: 'line',
              color: 'var(--ci-color-blue-500)',
              data: countList.map(val => val?.builds?.count)
            }
          ]
        })
      )
    }
  }, [countList])

  const borderCls = successRateDiff >= 0 ? styles.successBorder : styles.errorBorder
  return (
    <Container className={cx(styles.repositoryCard, className, borderCls)} onClick={onClick}>
      <Text className={styles.title} color={Color.BLACK} lineClamp={1}>
        {title}
      </Text>
      <Container className={styles.mainContent}>
        <Container>
          <Container className={styles.cardStats}>
            <Text font={{ size: 'small' }} className={styles.statHeader}>
              {countLabel}
            </Text>
            <Text font={{ size: 'small' }} className={styles.statHeader}>
              success rate
            </Text>
            <Text className={styles.statContent}>{count}</Text>
            <Container className={styles.statWrap}>
              <Text className={styles.statContent}>{roundNumber(successRate)}%</Text>
              <Icon
                size={14}
                name={successRateDiff >= 0 ? 'caret-up' : 'caret-down'}
                style={{
                  color: successRateDiff >= 0 ? 'var(--ci-color-green-500)' : 'var(--ci-color-red-500)'
                }}
              />
              <Text
                className={styles.rateDiffValue}
                style={{
                  color: successRateDiff >= 0 ? 'var(--ci-color-green-500)' : 'var(--ci-color-red-500)'
                }}
              >
                {Math.abs(roundNumber(successRateDiff)!)}%
              </Text>
            </Container>
          </Container>
        </Container>
        <Container className={styles.chartWrapper} height={40} margin={{ left: 'medium' }}>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </Container>
      </Container>
      <Container className={styles.cardFooter}>
        <Container className={styles.avatarWrapper}>
          {username && <Avatar name={username} src={avatarUrl} size="small" className={styles.repoCard} />}
          <Text font={{ size: 'small' }} color={Color.BLACK} lineClamp={2}>
            {message}
          </Text>
        </Container>
        <Container className={styles.times}>
          {moment(startTime).fromNow()}
          {duration !== undefined && (
            <>
              <Icon size={10} name="time" className={styles.timeIcon} />
              {duration}
            </>
          )}
        </Container>
      </Container>
      {typeof lastBuildStatus !== 'undefined' && (
        <div className={styles.leftBorder} style={{ backgroundColor: mapStatusToColor(lastBuildStatus) }} />
      )}
    </Container>
  )
}

function mapStatusToColor(status?: string) {
  const mappedStatus = mapToExecutionStatus(status)
  if (mappedStatus === ExecutionStatusEnum.Success) {
    return 'var(--ci-color-green-400)'
  } else if (Object.prototype.hasOwnProperty.call(FailedStatus, mappedStatus!)) {
    return 'var(--ci-color-red-400)'
  } else if (Object.prototype.hasOwnProperty.call(ActiveStatus, mappedStatus!)) {
    return 'var(--ci-color-orange-500)'
  }
}

const defaultChartOptions: Highcharts.Options = {
  chart: {
    animation: false,
    backgroundColor: 'transparent',
    height: 40,
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
    series: {
      marker: {
        states: {
          hover: {
            enabled: false
          }
        },
        enabled: false,
        radius: 1
      },
      stickyTracking: false,
      lineWidth: 1,
      turboThreshold: 50000
    },
    line: {
      lineWidth: 2,
      marker: {
        enabled: false
      }
    }
  },
  tooltip: {
    enabled: false,
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
    min: -1,
    labels: { enabled: false },
    title: {
      text: ''
    },
    gridLineWidth: 0,
    lineWidth: 0,
    tickLength: 0
  },
  series: [
    {
      type: 'line',
      color: 'var(--grey-400)',
      data: [10, 10]
    }
  ]
}
