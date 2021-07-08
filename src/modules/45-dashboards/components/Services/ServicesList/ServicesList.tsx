import React, { useMemo } from 'react'
import type { CellProps, Renderer } from 'react-table'
import { Color, Layout, Text } from '@wings-software/uicore'
import { DashboardList } from '@dashboards/components/DashboardList/DashboardList'
import type { DashboardListProps } from '@dashboards/components/DashboardList/DashboardList'
import type { ChangeValue } from '@dashboards/components/Services/DeploymentsWidget/DeploymentsWidget'
import { useStrings } from 'framework/strings'
import type { TableProps } from '@common/components/Table/Table'
import { Ticker } from '@common/components/Ticker/Ticker'
import { PieChart, PieChartProps } from '@dashboards/components/PieChart/PieChart'
import { numberFormatter } from '@dashboards/components/Services/common'
import css from '@dashboards/components/Services/ServicesList/ServiceList.module.scss'

export enum DeploymentStatus {
  SUCCESS = 'DeploymentStatusSuccess',
  FAILURE = 'DeploymentStatusFailure'
}

export interface ServiceListItem {
  name: string
  id: string
  serviceInstances: {
    count: number
    prodCount: number
    nonProdCount: number
  }
  deployments: ChangeValue
  failureRate: ChangeValue
  frequency: ChangeValue
  lastDeployment: {
    name: string
    id: string
    timestamp: string
    status: DeploymentStatus
  }
}

export interface ServicesListProps {
  total: number
  totalItems: number
  totalPages: number
  data: ServiceListItem[]
}

const RenderServiceName: Renderer<CellProps<ServiceListItem>> = ({ row }) => {
  const { name, id } = row.original
  const { getString } = useStrings()
  const idLabel = getString('idLabel', { id })
  return (
    <Layout.Vertical>
      <Text font={{ weight: 'semi-bold' }} color={Color.GREY_700} margin={{ bottom: 'xsmall' }}>
        {name}
      </Text>
      <Text font={{ size: 'small' }} color={Color.GREY_500}>
        {idLabel}
      </Text>
    </Layout.Vertical>
  )
}

const RenderType: Renderer<CellProps<ServiceListItem>> = () => {
  return <></>
}

const TickerCard: React.FC<{ item: ChangeValue & { name: string } }> = props => {
  const { item } = props
  const color = (() => {
    if (item.name !== 'failureRate') {
      return item.change < 0 ? Color.RED_500 : Color.GREEN_500
    } else {
      return item.change < 0 ? Color.GREEN_500 : Color.RED_500
    }
  })()
  return (
    <Layout.Vertical padding={'small'} key={item.name} width={'fit-content'} className={css.tickerContainer}>
      <Ticker
        value={<Text color={color} font={{ size: 'small' }}>{`${Math.abs(item.change)}%`}</Text>}
        decreaseMode={item.change < 0}
        color={color}
        tickerContainerStyles={css.tickerContainerStyles}
      >
        <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ right: 'xsmall' }}>
          {item.value}
        </Text>
      </Ticker>
    </Layout.Vertical>
  )
}

const getRenderTickerCard: (tickerCardKey: keyof ServiceListItem) => Renderer<CellProps<ServiceListItem>> =
  tickerCardKey =>
  ({ row }) => {
    const value = row.original[tickerCardKey] as ChangeValue
    return <TickerCard item={{ ...value, name: tickerCardKey }} />
  }

const RenderServiceInstances: Renderer<CellProps<ServiceListItem>> = ({ row }) => {
  const { serviceInstances } = row.original
  const { getString } = useStrings()
  const pieChartProps: PieChartProps = {
    items: [
      {
        label: getString('dashboards.serviceDashboard.nonProd'),
        value: serviceInstances.nonProdCount,
        formattedValue: numberFormatter(serviceInstances.nonProdCount),
        color: 'var(--primary-2)'
      },
      {
        label: getString('dashboards.serviceDashboard.prod'),
        value: serviceInstances.prodCount,
        formattedValue: numberFormatter(serviceInstances.prodCount),
        color: 'var(--primary-7)'
      }
    ],
    size: 24,
    labelContainerStyles: css.pieChartLabelContainerStyles,
    labelStyles: css.pieChartLabelStyles,
    options: {
      tooltip: {
        enabled: false
      }
    }
  }
  return (
    <Layout.Horizontal flex={{ align: 'center-center' }}>
      <Text
        color={Color.BLACK}
        font={{ weight: 'semi-bold', size: 'medium' }}
        margin={{ right: 'xsmall' }}
        padding={{ left: 'medium', top: 'medium', right: 'medium', bottom: 'medium' }}
        className={css.tickerContainer}
      >
        {serviceInstances.count}
      </Text>
      <PieChart {...pieChartProps} />
    </Layout.Horizontal>
  )
}

const RenderLastDeployment: Renderer<CellProps<ServiceListItem>> = ({ row }) => {
  const {
    lastDeployment: { id, name, timestamp, status }
  } = row.original
  const { getString } = useStrings()
  const [statusBackgroundColor, statusTextColor, statusText] =
    status === DeploymentStatus.SUCCESS
      ? [Color.GREEN_300, Color.GREEN_600, getString('success')]
      : [Color.RED_300, Color.RED_600, getString('failed')]
  return (
    <Layout.Horizontal className={css.lastDeployments}>
      <Layout.Vertical margin={{ right: 'large' }}>
        <Layout.Horizontal margin={{ bottom: 'xsmall' }} flex={{ align: 'center-center' }}>
          <Text font={{ weight: 'semi-bold' }} color={Color.GREY_700} margin={{ right: 'xsmall' }}>
            {name}
          </Text>
          <Text font={{ size: 'small' }} color={Color.GREY_500}>{`(${getString(
            'dashboards.serviceDashboard.executionId',
            { id }
          )})`}</Text>
        </Layout.Horizontal>
        <Text font={{ size: 'small' }} color={Color.GREY_500}>
          {timestamp}
        </Text>
      </Layout.Vertical>
      <Text
        background={statusBackgroundColor}
        color={statusTextColor}
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        className={css.statusText}
      >
        {statusText.toLocaleUpperCase()}
      </Text>
    </Layout.Horizontal>
  )
}

export const ServicesList: React.FC<ServicesListProps> = props => {
  const { total, data, totalItems, totalPages } = props
  const { getString } = useStrings()
  const ServiceListHeaderCustomPrimary = useMemo(
    () => () =>
      (
        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_700}>
          {getString('dashboards.serviceDashboard.totalServices', { total })}
        </Text>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [total]
  )
  const columns: TableProps<ServiceListItem>['columns'] = useMemo(
    () => {
      return [
        {
          Header: getString('service').toLocaleUpperCase(),
          id: 'service',
          width: '15%',
          Cell: RenderServiceName
        },
        {
          Header: getString('typeLabel').toLocaleUpperCase(),
          id: 'type',
          width: '10%',
          Cell: RenderType
        },
        {
          Header: getString('dashboards.serviceDashboard.serviceInstances').toLocaleUpperCase(),
          id: 'serviceInstances',
          width: '15%',
          Cell: RenderServiceInstances
        },
        {
          Header: getString('deploymentsText').toLocaleUpperCase(),
          id: 'deployments',
          width: '10%',
          Cell: getRenderTickerCard('deployments')
        },
        {
          Header: getString('common.failureRate').toLocaleUpperCase(),
          id: 'failureRate',
          width: '10%',
          Cell: getRenderTickerCard('failureRate')
        },
        {
          Header: getString('dashboards.serviceDashboard.frequency').toLocaleUpperCase(),
          id: 'frequency',
          width: '10%',
          Cell: getRenderTickerCard('frequency')
        },
        {
          Header: getString('dashboards.serviceDashboard.lastDeployment').toLocaleUpperCase(),
          id: 'lastDeployment',
          width: '30%',
          Cell: RenderLastDeployment
        }
      ]
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  )
  const dashboardListProps: DashboardListProps<ServiceListItem> = {
    columns,
    data,
    totalItems,
    totalPages,
    HeaderCustomPrimary: ServiceListHeaderCustomPrimary
  }
  return <DashboardList<ServiceListItem> {...dashboardListProps} />
}
