import React from 'react'
import { Container, Text, Avatar, Icon, Color } from '@wings-software/uicore'
import moment from 'moment'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import styles from './BuildCards.module.scss'

export interface RepositoryCardProps {
  title: string
  message: string
  username: string
  durationMin: number
  timestamp: number
  buildsNumber: number
  successRate: number
  successRateDiff: number
}

export default function RepositoryCard({
  title,
  message,
  username,
  durationMin,
  timestamp,
  buildsNumber,
  successRate,
  successRateDiff
}: RepositoryCardProps) {
  return (
    <Container className={styles.repositoryCard}>
      <Container className={styles.mainContent}>
        <Container>
          <Text className={styles.title} font={{ weight: 'bold' }} color={Color.BLACK} lineClamp={1}>
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
              <Text className={styles.statContent}>{successRate}%</Text>
              <Icon
                name={successRateDiff >= 0 ? 'caret-up' : 'caret-down'}
                color={successRateDiff >= 0 ? Color.GREEN_500 : Color.RED_500}
              />
              <Text font={{ size: 'small' }} color={successRateDiff >= 0 ? Color.GREEN_500 : Color.RED_500}>
                {Math.abs(successRateDiff)}%
              </Text>
            </Container>
          </Container>
        </Container>
        <Container height={40} width={140} margin={{ top: 'small' }}>
          <HighchartsReact highcharts={Highcharts} options={chartOptionsMock} />
        </Container>
      </Container>
      <Container className={styles.cardFooter}>
        <Avatar name={username} />
        <Text font={{ size: 'small' }} color={Color.BLACK} lineClamp={2} margin={{ left: 'small', right: 'small' }}>
          {message}
        </Text>
        <Container className={styles.times}>
          {moment(timestamp).fromNow()}
          <Icon size={14} name="time" className={styles.timeIcon} />
          {`${durationMin}m`}
        </Container>
      </Container>
      <div className={styles.leftBorder} />
    </Container>
  )
}

const chartOptionsMock = {
  chart: {
    backgroundColor: 'transparent',
    height: 40,
    type: 'line',
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
      stickyTracking: false,
      lineWidth: 1,
      turboThreshold: 50000
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
  },
  series: [
    {
      type: 'line',
      color: 'blue',
      data: [10, 13, 22, 5, 6, 14, 9, 15, 0, 13, 22, 5, 6, 14, 9, 15]
    }
  ]
}
