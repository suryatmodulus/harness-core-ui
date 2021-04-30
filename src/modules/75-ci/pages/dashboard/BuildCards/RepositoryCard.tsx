import React, { useEffect, useState } from 'react'
import { Container, Text, Avatar, Icon, Color } from '@wings-software/uicore'
import moment from 'moment'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import merge from 'lodash-es/merge'
import type { RepositoryBuildInfo } from 'services/ci'
import { roundNumber } from '../../../services/CIUtils'
import styles from './BuildCards.module.scss'

export interface RepositoryCardProps {
  title: string
  message: string
  username?: string
  durationMin?: number
  startTime: number
  buildsNumber: number
  successRate: number
  successRateDiff: number
  lastBuildStatus?: string
  countList?: RepositoryBuildInfo[]
}

export default function RepositoryCard({
  title,
  message,
  username,
  durationMin,
  startTime,
  buildsNumber,
  successRate,
  successRateDiff,
  lastBuildStatus,
  countList
}: RepositoryCardProps) {
  const [chartOptions, setChartOptions] = useState(defaultChartOptions)

  useEffect(() => {
    if (countList?.length) {
      setChartOptions(
        merge({}, defaultChartOptions, {
          tooltip: {
            enabled: true
          },
          xAxis: {
            categories: countList.map(val => val.time)
          },
          series: [
            {
              name: 'Builds',
              type: 'line',
              color: 'var(--ci-color-blue-500)',
              data: countList.map(val => val?.builds?.count)
            }
          ]
        })
      )
    }
  }, [countList])

  return (
    <Container className={styles.repositoryCard}>
      <Container className={styles.mainContent}>
        <Container>
          <Text className={styles.title} color={Color.BLACK} lineClamp={1}>
            {title}
          </Text>
          <Container className={styles.cardStats}>
            <Text font={{ size: 'small' }} className={styles.statHeader}>
              builds
            </Text>
            <Text font={{ size: 'small' }} className={styles.statHeader}>
              success rate
            </Text>
            <Text className={styles.statContent}>{buildsNumber}</Text>
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
        <Container className={styles.chartWrapper} height={40} margin={{ top: 'small', left: 'huge' }}>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </Container>
      </Container>
      <Container className={styles.cardFooter}>
        <Container className={styles.avatarWrapper}>
          {username && <Avatar name={username} size="small" />}
          <Text font={{ size: 'small' }} color={Color.BLACK} lineClamp={2}>
            {message}
          </Text>
        </Container>
        <Container className={styles.times}>
          {moment(startTime).fromNow()}
          {durationMin !== undefined && (
            <>
              <Icon size={10} name="time" className={styles.timeIcon} />
              {`${durationMin}m`}
            </>
          )}
        </Container>
      </Container>
      <div className={styles.leftBorder} style={{ backgroundColor: mapStatusToColor(lastBuildStatus) }} />
    </Container>
  )
}

function mapStatusToColor(status?: string) {
  switch (status) {
    case 'SUCCESS':
      return 'var(--ci-color-green-400)'
    case 'FAILED':
    case 'ABORTED':
    case 'EXPIRED':
    case 'SUSPENDED':
    case 'SKIPPED':
    case 'APPROVAL_REJECTED':
      return 'var(--ci-color-red-400)'
    case 'RUNNING':
    case 'INTERVENTION_WAITING':
    case 'RESOURCE_WAITING':
    case 'ASYNC_WAITING':
    case 'TASK_WAITING':
    case 'TIMED_WAITING':
    case 'DISCONTINUING':
    case 'APPROVAL_WAITING':
    case 'NOT_STARTED':
    case 'QUEUED':
    case 'PAUSED':
    case 'WAITING':
    case 'PAUSING':
    default:
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
