import React, { useState, useEffect } from 'react'
import { Container, Text, Layout } from '@wings-software/uicore'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import moment from 'moment'
import merge from 'lodash-es/merge'
import { Spinner } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useGetBuildExecution } from 'services/ci'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import RangeSelector from '../RangeSelector'
import styles from './BuildExecutionsChart.module.scss'

export default function BuildExecutionsChart() {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const [range, setRange] = useState([Date.now() - 30 * 24 * 60 * 60000, Date.now()])
  const [chartOptions, setChartOptions] = useState<Highcharts.Options>(generateEmptyChartData(range[0], range[1]))

  const { data, loading } = useGetBuildExecution({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      startInterval: moment(range[0]).format('YYYY-MM-DD'),
      endInterval: moment(range[1]).format('YYYY-MM-DD')
    }
  })

  useEffect(() => {
    const successful: number[] = []
    const failed: number[] = []
    const empty: number[] = []
    const xCategories: string[] = []
    if (data?.data?.buildExecutionInfoList?.length) {
      let totalMax = data.data.buildExecutionInfoList.reduce((acc, curr) => {
        return Math.max(curr.builds!.success! + curr.builds!.failed!, acc)
      }, 0)
      totalMax = Math.ceil(Math.max(totalMax * 1.2, 10))
      data.data.buildExecutionInfoList.forEach(val => {
        successful.push(val.builds!.success!)
        failed.push(val.builds!.failed!)
        empty.push(totalMax - val.builds!.success! - val.builds!.failed!)
        xCategories.push(val.time!)
      })
      setChartOptions(
        merge({}, defaultChartOptions, {
          chart: {
            animation: false
          },
          yAxis: {
            endOnTick: false
          },
          xAxis: {
            categories: xCategories
          },
          series: [
            {
              type: 'column',
              name: 'empty',
              color: 'var(--ci-color-gray-100)',
              showInLegend: false,
              enableMouseTracking: false,
              data: empty
            },
            {
              type: 'column',
              name: 'Failed',
              color: 'var(--ci-color-red-500)',
              data: failed
            },
            {
              type: 'column',
              name: 'Successful',
              color: 'var(--ci-color-green-500)',
              data: successful
            }
          ]
        })
      )
    }
  }, [data])

  return (
    <Container className={styles.main}>
      <Container className={styles.titleAndFilter}>
        <Layout.Horizontal>
          <Text margin={{ right: 'small' }}>{getString('ci.dashboard.buildExecutions')}</Text>
          {loading && <Spinner size={15} />}
        </Layout.Horizontal>
        <RangeSelector onRangeSelected={setRange} />
      </Container>
      <Container className={styles.chartWrapper}>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Container>
    </Container>
  )
}

function generateEmptyChartData(start: number, end: number): Highcharts.Options {
  let n = moment(end).diff(start, 'days')
  const empty: number[] = []
  const xCategories: string[] = []
  while (n-- > 0) {
    xCategories.push(moment().subtract(n, 'days').format('YYYY-MM-DD'))
    empty.push(10)
  }
  return merge({}, defaultChartOptions, {
    xAxis: {
      labels: { enabled: false },
      categories: xCategories
    },
    yAxis: {
      labels: { enabled: false }
    },
    series: [
      {
        type: 'column',
        name: 'nn',
        color: 'var(--ci-color-gray-100)',
        showInLegend: false,
        enableMouseTracking: false,
        data: empty
      }
    ]
  })
}

const defaultChartOptions: Highcharts.Options = {
  chart: {
    type: 'column',
    height: 215
  },
  title: {
    text: ''
  },
  credits: undefined,
  legend: {
    align: 'right',
    verticalAlign: 'top',
    symbolHeight: 12,
    symbolWidth: 19,
    symbolRadius: 7,
    squareSymbol: false,
    itemStyle: {
      fontWeight: '400',
      fontSize: '10',
      fontFamily: 'Inter, sans-serif'
    }
  },
  xAxis: {
    title: {
      text: 'Date',
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    labels: {
      enabled: true,
      // autoRotation: false,
      formatter: lab => moment(lab.value).date() + '',
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    tickWidth: 0,
    lineWidth: 0
  },
  yAxis: {
    labels: {
      enabled: true,
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    title: {
      text: '# of builds',
      style: {
        fontSize: '8',
        color: '#9293AB'
      }
    },
    gridLineWidth: 0,
    lineWidth: 0
  },
  plotOptions: {
    column: {
      stacking: 'normal',
      pointPadding: 0,
      borderWidth: 3,
      borderRadius: 4,
      pointWidth: 6,
      events: {
        legendItemClick: function () {
          return false
        }
      }
    }
  }
}
