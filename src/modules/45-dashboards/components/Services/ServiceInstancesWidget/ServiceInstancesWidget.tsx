import React, { useMemo } from 'react'
import { Card, Color, Container, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { SparklineChart, SparklineChartProps } from '@common/components/SparklineChart/SparklineChart'
import { TrendPopover } from '@dashboards/components/TrendPopover/TrendPopover'
import { PieChart } from '@dashboards/components/PieChart/PieChart'
import { numberFormatter } from '@dashboards/components/Services/common'
import css from '@dashboards/components/Services/ServiceInstancesWidget/ServiceInstancesWidget.module.scss'
export interface ServiceInstanceWidgetProps {
  serviceCount: number
  serviceInstancesCount: number
  trendTitle: string
  trendData: SparklineChartProps['data']
  prodCount: number
  nonProdCount: number
}

export const ServiceInstancesWidget: React.FC<ServiceInstanceWidgetProps> = props => {
  const { serviceCount, serviceInstancesCount, trendTitle, trendData, prodCount, nonProdCount } = props
  const { getString } = useStrings()
  const pieChartData = useMemo(
    () => [
      {
        label: getString('dashboards.serviceDashboard.nonProd'),
        value: nonProdCount,
        formattedValue: numberFormatter(nonProdCount),
        color: 'var(--blue-450)'
      },
      {
        label: getString('dashboards.serviceDashboard.prod'),
        value: prodCount,
        formattedValue: numberFormatter(prodCount),
        color: 'var(--blue-500)'
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
            <Text font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
              {getString('services')}
            </Text>
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} className={css.text}>
                {serviceCount}
              </Text>
              <TrendPopover data={trendData}>
                <SparklineChart title={trendTitle} data={trendData} options={{ chart: { width: 80, height: 50 } }} />
              </TrendPopover>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical padding={{ top: 'small' }}>
          <Layout.Vertical margin={{ bottom: 'xlarge' }}>
            <Text font={{ weight: 'semi-bold' }} color={Color.GREY_600}>
              {getString('dashboards.serviceDashboard.serviceInstances')}
            </Text>
            <Text color={Color.BLACK} font={{ weight: 'semi-bold' }} className={css.text}>
              {serviceInstancesCount}
            </Text>
          </Layout.Vertical>
          <Container height={46}>
            <PieChart size={46} items={pieChartData}></PieChart>
          </Container>
        </Layout.Vertical>
      </Layout.Vertical>
    </Card>
  )
}
