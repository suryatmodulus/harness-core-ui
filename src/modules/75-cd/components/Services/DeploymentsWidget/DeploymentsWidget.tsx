import React, { useCallback, useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import type { SeriesAreaOptions } from 'highcharts'
import { Card, Color, Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Ticker, TickerVerticalAlignment } from '@common/components/Ticker/Ticker'
import { getBucketSizeForTimeRange, TimeRangeSelector } from '@cd/components/TimeRangeSelector/TimeRangeSelector'
import { PageSpinner, TimeSeriesAreaChart } from '@common/components'
import type { TimeSeriesAreaChartProps } from '@common/components/TimeSeriesAreaChart/TimeSeriesAreaChart'
import { PageError } from '@common/components/Page/PageError'
import { DeploymentsTimeRangeContext, numberFormatter } from '@cd/components/Services/common'
import DeploymentsEmptyState from '@cd/icons/DeploymentsEmptyState.svg'
import {
  GetServiceDeploymentsInfoQueryParams,
  ServiceDeploymentListInfo,
  useGetServiceDeploymentsInfo
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget.module.scss'

export interface ChangeValue {
  value: string
  change: number
}

interface DeploymentWidgetData {
  deployments: ChangeValue
  failureRate: ChangeValue
  frequency: ChangeValue
  data: TimeSeriesAreaChartProps['seriesData']
  dateLabels: string[]
}

export interface DeploymentWidgetProps {
  serviceIdentifier?: string
}

const TickerValue: React.FC<{ value: number; color: Color }> = props => (
  <Text font={{ size: 'xsmall' }} color={props.color}>{`${numberFormatter(Math.abs(props.value), {
    truncate: false
  })}%`}</Text>
)

export const DeploymentsWidget: React.FC<DeploymentWidgetProps> = props => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { serviceIdentifier } = props
  const { timeRange, setTimeRange } = useContext(DeploymentsTimeRangeContext)

  const queryParams: GetServiceDeploymentsInfoQueryParams = useMemo(() => {
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier,
      startTime: timeRange?.range[0]?.getTime() || 0,
      endTime: timeRange?.range[1] ? moment(timeRange.range[1]).add(1, 'days').toDate().getTime() : 0,
      bucketSizeInDays: getBucketSizeForTimeRange(timeRange?.range)
    }
  }, [accountId, orgIdentifier, projectIdentifier, serviceIdentifier, timeRange])

  const {
    loading,
    data: serviceDeploymentsInfo,
    error,
    refetch
  } = useGetServiceDeploymentsInfo({
    queryParams
  })

  const parseData = useCallback(
    (serviceDeploymentListInfo: ServiceDeploymentListInfo): DeploymentWidgetData => {
      const deployments = (serviceDeploymentListInfo.serviceDeploymentList || []).filter(
        deployment => deployment.time !== undefined
      )
      deployments.sort((deploymentA, deploymentB) => ((deploymentA.time || 0) < (deploymentB.time || 0) ? -1 : 1))

      const dateLabels: string[] = []
      const success: SeriesAreaOptions['data'] = []
      const failed: SeriesAreaOptions['data'] = []

      deployments.forEach(deployment => {
        const currentDate = new Date(deployment.time || 0)
        success.push({ x: deployment.time || 0, y: deployment.deployments?.success || 0 })
        failed.push({ x: deployment.time || 0, y: deployment.deployments?.failure || 0 })
        dateLabels.push(currentDate?.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric' }) || '')
      })

      return {
        deployments: {
          value: numberFormatter(serviceDeploymentListInfo.totalDeployments),
          change: serviceDeploymentListInfo.totalDeploymentsChangeRate || 0
        },
        failureRate: {
          value: numberFormatter(serviceDeploymentListInfo.failureRate),
          change: serviceDeploymentListInfo.failureRateChangeRate || 0
        },
        frequency: {
          value: numberFormatter(serviceDeploymentListInfo.frequency),
          change: serviceDeploymentListInfo.frequencyChangeRate || 0
        },
        data: [
          {
            name: getString('success'),
            data: success,
            color: '#3dc7f6'
          },
          {
            name: getString('failed'),
            data: failed,
            color: '#ee5f54'
          }
        ],
        dateLabels
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const DeploymentWidgetContainer: React.FC = ({ children }) => {
    return (
      <Card className={css.card}>
        <Layout.Vertical height={'100%'}>
          <Container className={css.timeRange}>
            <TimeRangeSelector timeRange={timeRange?.range} setTimeRange={setTimeRange} />
          </Container>
          {children}
        </Layout.Vertical>
      </Card>
    )
  }

  if (
    loading ||
    error ||
    !serviceDeploymentsInfo?.data ||
    (serviceDeploymentsInfo.data.totalDeployments === 0 && serviceDeploymentsInfo.data.totalDeploymentsChangeRate === 0)
  ) {
    const component = (() => {
      if (loading) {
        return (
          <Container data-test="deploymentsWidgetLoader">
            <PageSpinner />
          </Container>
        )
      }
      if (error) {
        return (
          <Container data-test="deploymentsWidgetError" height={'100%'}>
            <PageError onClick={() => refetch()} />
          </Container>
        )
      }
      return (
        <Layout.Vertical height="100%" flex={{ align: 'center-center' }} data-test="deploymentsWidgetEmpty">
          <img width="150" height="100" src={DeploymentsEmptyState} style={{ alignSelf: 'center' }} />
          <Text color={Color.GREY_400} margin={{ top: 'medium' }}>
            {getString('cd.serviceDashboard.noDeployments', {
              timeRange: timeRange?.label
            })}
          </Text>
        </Layout.Vertical>
      )
    })()
    return <DeploymentWidgetContainer>{component}</DeploymentWidgetContainer>
  }

  const { deployments, failureRate, frequency, data, dateLabels } = parseData(serviceDeploymentsInfo.data)

  const customChartOptions: Highcharts.Options = {
    chart: { height: 170, spacing: [25, 0, 25, 0] },
    legend: { padding: 0 },
    xAxis: {
      allowDecimals: false,
      labels: {
        enabled: false, // remove this if data labels are required
        formatter: function () {
          const index = Number(this.value)
          return index < dateLabels.length ? dateLabels[index] : ''
        }
      }
      // tickInterval: 1
    },
    yAxis: {
      max: Math.max(
        ...(serviceDeploymentsInfo?.data?.serviceDeploymentList || []).map(
          deployment => (deployment.deployments?.failure || 0) + (deployment.deployments?.success || 0)
        )
      )
    },
    plotOptions: {
      area: {
        pointStart: 0,
        stacking: 'normal',
        animation: false
      }
    }
  }

  return (
    <DeploymentWidgetContainer>
      <Container data-test="deploymentsWidgetContent">
        <Text font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
          {getString('deploymentsText')}
        </Text>
        <Layout.Horizontal flex={{ alignItems: 'flex-end', justifyContent: 'flex-start' }}>
          <Layout.Horizontal width={240}>
            <Ticker
              value={
                <TickerValue
                  value={deployments.change}
                  color={deployments.change > 0 ? Color.GREEN_600 : Color.RED_500}
                />
              }
              decreaseMode={deployments.change < 0}
              color={deployments.change > 0 ? Color.GREEN_600 : Color.RED_500}
              verticalAlign={TickerVerticalAlignment.CENTER}
            >
              <Layout.Vertical>
                <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} className={css.text} data-test="tickerText">
                  {deployments.value}
                </Text>
                <Text font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.GREY_400}>
                  {getString('cd.serviceDashboard.in', {
                    timeRange: timeRange?.label
                  })}
                </Text>
              </Layout.Vertical>
            </Ticker>
          </Layout.Horizontal>
          {[
            { ...failureRate, name: getString('common.failureRate') },
            { ...frequency, name: getString('cd.serviceDashboard.frequency') }
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
                  value={<TickerValue value={item.change} color={item.change > 0 ? colors[0] : colors[1]} />}
                  decreaseMode={item.change < 0}
                  color={item.change > 0 ? colors[0] : colors[1]}
                  tickerContainerStyles={css.tickerContainerStyles}
                  verticalAlign={TickerVerticalAlignment.CENTER}
                >
                  <Text
                    color={Color.BLACK}
                    font={{ weight: 'semi-bold', size: 'medium' }}
                    margin={{ right: 'xsmall' }}
                    data-test="tickerText"
                  >
                    {item.value}
                  </Text>
                </Ticker>
              </Layout.Vertical>
            )
          })}
        </Layout.Horizontal>
        <TimeSeriesAreaChart seriesData={data} customChartOptions={customChartOptions} />
      </Container>
    </DeploymentWidgetContainer>
  )
}
