import React, { useMemo } from 'react'
import { Card, Color, Layout, Text, WeightedStack, LabelPosition } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import { SparklineChart, SparklineChartProps } from '@common/components/SparklineChart/SparklineChart'
import { TrendPopover, TrendPopoverProps } from '@dashboards/components/TrendPopover/TrendPopover'
import css from './ServiceInstancesWidget.module.scss'

export interface ServicesInstanceWidget {
  serviceCount: number
  serviceInstancesCount: number
  trendTitle: string
  trendData: SparklineChartProps['data']
  trendPopoverData: TrendPopoverProps['data']
  prodCount: number
  nonProdCount: number
}

export const ServiceInstancesWidget: React.FC<ServicesInstanceWidget> = props => {
  const {
    serviceCount,
    serviceInstancesCount,
    trendTitle,
    trendData,
    trendPopoverData,
    prodCount,
    nonProdCount
  } = props
  const { getString } = useStrings()
  const weightedStackData = useMemo(
    () => [
      {
        label: getString('dashboards.serviceDashboard.nonProd'),
        value: nonProdCount,
        color: Color.BLUE_450
      },
      {
        label: getString('dashboards.serviceDashboard.prod'),
        value: prodCount,
        color: Color.BLUE_500
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prodCount, nonProdCount]
  )
  return (
    <Card className={css.card}>
      <Layout.Vertical>
        <Layout.Horizontal className={css.topSection} padding={{ bottom: 'small' }}>
          <Layout.Vertical width={'100%'}>
            <Text font={{ weight: 'semi-bold' }}>{getString('services')}</Text>
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} className={css.text}>
                {serviceCount}
              </Text>
              <TrendPopover data={trendPopoverData}>
                <SparklineChart title={trendTitle} data={trendData} options={{ chart: { width: 80, height: 50 } }} />
              </TrendPopover>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical padding={{ top: 'small' }}>
          <Layout.Vertical margin={{ bottom: 'xlarge' }}>
            <Text font={{ weight: 'semi-bold' }}>{getString('dashboards.serviceDashboard.serviceInstances')}</Text>
            <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} className={css.text}>
              {serviceInstancesCount}
            </Text>
          </Layout.Vertical>
          <WeightedStack data={weightedStackData} labelPosition={LabelPosition.LEFT} labelWidth="100px" />
        </Layout.Vertical>
      </Layout.Vertical>
    </Card>
  )
}
