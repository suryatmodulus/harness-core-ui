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
        color: 'var(--primary-2)'
      },
      {
        label: getString('dashboards.serviceDashboard.prod'),
        value: prodCount,
        formattedValue: numberFormatter(prodCount),
        color: 'var(--primary-7)'
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prodCount, nonProdCount]
  )
  return (
    <Card className={css.card}>
      <Layout.Vertical width={248}>
        <Layout.Horizontal className={css.topSection}>
          <Layout.Vertical width={'100%'}>
            <Text font={{ weight: 'bold' }} color={Color.GREY_600}>
              {getString('services')}
            </Text>
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              <Text color={Color.BLACK} font={{ weight: 'bold' }} className={css.text}>
                {numberFormatter(serviceCount)}
              </Text>
              <TrendPopover data={trendData}>
                <SparklineChart
                  title={trendTitle}
                  data={trendData}
                  options={{ chart: { width: 80, height: 50 } }}
                  sparklineChartContainerStyles={css.hover}
                />
              </TrendPopover>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Layout.Vertical className={css.bottomSection}>
          <Layout.Vertical margin={{ bottom: 'medium' }}>
            <Text font={{ weight: 'bold' }} color={Color.GREY_600} margin={{ bottom: 'xsmall' }}>
              {getString('dashboards.serviceDashboard.serviceInstances')}
            </Text>
            <Layout.Horizontal flex={{ alignItems: 'center', distribution: 'space-between' }}>
              <Text color={Color.BLACK} font={{ weight: 'bold' }} className={css.text}>
                {numberFormatter(serviceInstancesCount)}
              </Text>
              <Container height={65}>
                <PieChart size={65} items={pieChartData} showLabels={false}></PieChart>
              </Container>
            </Layout.Horizontal>
          </Layout.Vertical>
          <Layout.Horizontal flex={{ distribution: 'space-between' }}>
            {pieChartData.map(pieChartDataItem => {
              return (
                <Layout.Horizontal key={pieChartDataItem.label} flex={{ alignItems: 'center' }}>
                  <div className={css.circle} style={{ background: pieChartDataItem.color }}></div>
                  <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_500}>{`${
                    pieChartDataItem.label
                  } (${pieChartDataItem.formattedValue ?? pieChartDataItem.value})`}</Text>
                </Layout.Horizontal>
              )
            })}
          </Layout.Horizontal>
        </Layout.Vertical>
      </Layout.Vertical>
    </Card>
  )
}
