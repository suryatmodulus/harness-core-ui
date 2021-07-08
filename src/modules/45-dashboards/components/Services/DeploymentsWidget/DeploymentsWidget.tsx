import React, { useContext, useMemo } from 'react'
import { Card, Color, Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Ticker, TickerVerticalAlignment } from '@common/components/Ticker/Ticker'
import {
  TimeRangeSelector,
  TIME_RANGE_ENUMS,
  useTimeRangeOptions
} from '@dashboards/components/TimeRangeSelector/TimeRangeSelector'
import { TimeSeriesAreaChart } from '@common/components'
import type { TimeSeriesAreaChartProps } from '@common/components/TimeSeriesAreaChart/TimeSeriesAreaChart'
import { DeploymentsTimeRangeContext } from '@dashboards/components/Services/common'
import css from '@dashboards/components/Services/DeploymentsWidget/DeploymentsWidget.module.scss'

export interface ChangeValue {
  value: string
  change: number
}

export interface DeploymentWidgetProps {
  deployments: ChangeValue
  failureRate: ChangeValue
  frequency: ChangeValue
  data: TimeSeriesAreaChartProps['seriesData']
  dateLabels: string[]
}

export const DeploymentsWidget: React.FC<DeploymentWidgetProps> = props => {
  const { getString } = useStrings()
  const { deployments, failureRate, frequency, data, dateLabels } = props
  const { timeRange, setTimeRange } = useContext(DeploymentsTimeRangeContext)
  const TIME_RANGE_OPTIONS: Record<TIME_RANGE_ENUMS, string> = useMemo(useTimeRangeOptions, [])
  const getTickerTextComponent = useMemo(
    () => (value: number, color: Color) => <Text font={{ size: 'xsmall' }} color={color}>{`${Math.abs(value)}%`}</Text>,
    []
  )
  const customChartOptions: Highcharts.Options = {
    chart: { height: 175, spacing: [25, 0, 25, 0] },
    legend: { padding: 0 },
    xAxis: {
      allowDecimals: false,
      labels: {
        formatter: function () {
          const index = Number(this.value)
          return index < dateLabels.length ? dateLabels[index] : ''
        }
      }
    },
    plotOptions: {
      area: {
        pointStart: 0,
        animation: false
      }
    }
  }
  return (
    <Card className={css.card}>
      <Layout.Vertical>
        <Container className={css.timeRange}>
          <TimeRangeSelector mode={timeRange} setMode={setTimeRange} />
        </Container>
        <Text font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('deploymentsText')}
        </Text>
        <Layout.Horizontal flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
          <Layout.Horizontal width={240}>
            <Ticker
              value={getTickerTextComponent(
                deployments.change,
                deployments.change > 0 ? Color.GREEN_600 : Color.RED_500
              )}
              decreaseMode={deployments.change < 0}
              color={deployments.change > 0 ? Color.GREEN_600 : Color.RED_500}
              verticalAlign={TickerVerticalAlignment.CENTER}
            >
              <Layout.Vertical>
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} className={css.text}>
                  {deployments.value}
                </Text>
                <Text font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.GREY_400}>
                  {getString('dashboards.serviceDashboard.in', {
                    timeRange: TIME_RANGE_OPTIONS[timeRange].toLowerCase()
                  })}
                </Text>
              </Layout.Vertical>
            </Ticker>
          </Layout.Horizontal>
          {[
            { ...failureRate, name: getString('common.failureRate') },
            { ...frequency, name: getString('dashboards.serviceDashboard.frequency') }
          ].map((item, index) => {
            const colors = index ? [Color.GREEN_600, Color.RED_500] : [Color.RED_500, Color.GREEN_600]
            return (
              <Layout.Vertical
                padding={'small'}
                margin={{ right: 'medium' }}
                className={css.tickerCard}
                key={item.name}
              >
                <Text
                  font={{ size: 'xsmall', weight: 'semi-bold' }}
                  margin={{ bottom: 'small' }}
                  color={Color.GREY_600}
                >
                  {item.name}
                </Text>
                <Ticker
                  value={getTickerTextComponent(item.change, item.change > 0 ? colors[0] : colors[1])}
                  decreaseMode={item.change < 0}
                  color={item.change > 0 ? colors[0] : colors[1]}
                  tickerContainerStyles={css.tickerContainerStyles}
                  verticalAlign={TickerVerticalAlignment.CENTER}
                >
                  <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ right: 'xsmall' }}>
                    {item.value}
                  </Text>
                </Ticker>
              </Layout.Vertical>
            )
          })}
        </Layout.Horizontal>
        <TimeSeriesAreaChart seriesData={data} customChartOptions={customChartOptions} />
      </Layout.Vertical>
    </Card>
  )
}
