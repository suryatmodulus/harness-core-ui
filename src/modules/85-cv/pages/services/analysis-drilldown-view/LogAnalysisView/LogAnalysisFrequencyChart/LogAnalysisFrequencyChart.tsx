import { Container } from '@wings-software/uicore'
import React, { useEffect, useMemo } from 'react'
import type { SeriesColumnOptions } from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { RestResponseSortedSetLogDataByTag, useGetTagCount, useGetTagCountForActivity } from 'services/cv'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import getLogViewcolumnChartConfig from './LogViewColumnChartConfig'
import { categoryNameToCategoryType } from '../../../CVServicePageUtils'
import css from './LogAnalysisFrequencyChart.module.scss'

interface LogAnalysisFrequencyChartProps {
  environmentIdentifier?: string
  serviceIdentifier?: string
  categoryName: string
  startTime: number
  endTime: number
  className?: string
}

interface ActivityLogAnalysisFrequencyChartProps {
  activityId: string
  projectIdentifier: string
  orgIdentifier: string
  startTime: number
  endTime: number
  className?: string
}

interface LogAnalysisFrequencyViewProps {
  data?: any
  startTime: number
  endTime: number
}

const FIVE_MINUTES_IN_MILLISECONDS = 1000 * 60 * 5

function generatePointsForLogChart(
  data: RestResponseSortedSetLogDataByTag,
  startTime: number,
  endTime: number,
  getString: UseStringsReturn['getString']
): any {
  if (!data?.resource) {
    return data
  }

  const content = data.resource
  const columnChartData = [
    {
      type: 'column',
      name: getString('cv.nonAnomalous'),
      data: [],
      color: 'var(--primary-7)'
    },
    {
      type: 'column',
      name: getString('cv.anomalous'),
      data: [],
      color: 'var(--red-600)'
    }
  ] as SeriesColumnOptions[]
  const categories = []

  content.sort((logDataA, logDataB) => {
    if (!logDataA?.timestamp) {
      return logDataB?.timestamp ? -1 : 0
    }
    if (!logDataB?.timestamp) {
      return 1
    }

    return logDataA?.timestamp - logDataB?.timestamp
  })

  const nearest5thMinute = new Date(
    Math.round(startTime / FIVE_MINUTES_IN_MILLISECONDS) * FIVE_MINUTES_IN_MILLISECONDS
  ).getTime()

  // set up categories(x axis) and the total number of data points
  for (let i = nearest5thMinute; i <= endTime; i += 300000) {
    categories.push(i)
    columnChartData[0]?.data?.push(0)
    columnChartData[1]?.data?.push(0)
  }

  let logDataIndex = 0
  for (let timestampIndex = 0; timestampIndex < categories.length; timestampIndex++) {
    const tagBuckets = content[logDataIndex]
    if (!tagBuckets?.countByTags?.length || tagBuckets?.timestamp !== categories[timestampIndex]) continue

    logDataIndex++
    for (const tag of tagBuckets.countByTags) {
      if (tag.tag === 'KNOWN') {
        const arr: number[] = columnChartData[0].data as number[]
        arr[timestampIndex] += tag.count || 0
      } else if (tag.tag) {
        const arr: number[] = columnChartData[1].data as number[]
        arr[timestampIndex] += tag.count || 0
      }
    }
  }

  return { columnChartData, categories }
}

export default function LogAnalysisFrequencyChart(props: LogAnalysisFrequencyChartProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { environmentIdentifier, serviceIdentifier, categoryName, startTime, endTime, className } = props
  const { data, refetch } = useGetTagCount({
    lazy: true
  })

  useEffect(() => {
    refetch({
      queryParams: {
        accountId,
        orgIdentifier,
        projectIdentifier,
        monitoringCategory: (categoryName ? categoryNameToCategoryType(categoryName) : undefined) as string,
        startTime,
        endTime,
        environmentIdentifier,
        serviceIdentifier
      }
    })
  }, [startTime, endTime, categoryName, serviceIdentifier, environmentIdentifier])
  return (
    <Container className={cx(css.main, className)}>
      <LogAnalysisFrequencyView data={data} startTime={startTime} endTime={endTime} />
    </Container>
  )
}

export function ActivityLogAnalysisFrequencyChart({
  activityId,
  projectIdentifier,
  orgIdentifier,
  startTime,
  endTime
}: ActivityLogAnalysisFrequencyChartProps): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { data } = useGetTagCountForActivity({
    activityId,
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      startTime,
      endTime
    }
  })
  return <LogAnalysisFrequencyView data={data} startTime={startTime} endTime={endTime} />
}

function LogAnalysisFrequencyView({ data, startTime, endTime }: LogAnalysisFrequencyViewProps): React.ReactElement {
  const { getString } = useStrings()
  const columnChartOptions: Highcharts.Options | undefined = useMemo(() => {
    if (data) {
      const { categories, columnChartData } = generatePointsForLogChart(data, startTime, endTime, getString)
      return getLogViewcolumnChartConfig(columnChartData, categories, startTime, endTime)
    }
  }, [data])

  return <HighchartsReact highcharts={Highcharts} options={columnChartOptions} />
}
