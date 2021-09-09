import React, { useCallback, useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import ReactTimeago from 'react-timeago'
import { Color, Layout, Text } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { DashboardList } from '@cd/components/DashboardList/DashboardList'
import type { DashboardListProps } from '@cd/components/DashboardList/DashboardList'
import type { ChangeValue } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import { useStrings } from 'framework/strings'
import type { TableProps } from '@common/components/Table/Table'
import { Ticker } from '@common/components/Ticker/Ticker'
import { PieChart, PieChartProps } from '@cd/components/PieChart/PieChart'
import { getFixed, INVALID_CHANGE_RATE, numberFormatter } from '@cd/components/Services/common'
import type { ServiceDetailsDTO } from 'services/cd-ng'
import { DeploymentTypeIcons } from '@cd/components/DeploymentTypeIcons/DeploymentTypeIcons'
import css from '@cd/components/Services/ServicesList/ServiceList.module.scss'

export enum DeploymentStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}

export interface ServiceListItem {
  name: string
  id: string
  deploymentTypeList: string[]
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
    timestamp: number
    status: string
  }
}

export interface ServicesListProps {
  loading: boolean
  error: boolean
  data: ServiceDetailsDTO[]
  refetch: () => void
}

const transformServiceDetailsData = (data: ServiceDetailsDTO[]): ServiceListItem[] => {
  return data.map(item => ({
    name: item.serviceName || '',
    id: item.serviceIdentifier || '',
    deploymentTypeList: item.deploymentTypeList || [],
    serviceInstances: {
      count: item.instanceCountDetails?.totalInstances || 0,
      prodCount: item.instanceCountDetails?.prodInstances || 0,
      nonProdCount: item.instanceCountDetails?.nonProdInstances || 0
    },
    deployments: {
      value: numberFormatter(item.totalDeployments),
      change: item.totalDeploymentChangeRate || 0
    },
    failureRate: {
      value: numberFormatter(item.failureRate),
      change: item.failureRateChangeRate || 0
    },
    frequency: {
      value: numberFormatter(item.frequency),
      change: item.frequencyChangeRate || 0
    },
    lastDeployment: {
      name: item.lastPipelineExecuted?.name || '',
      id: item.lastPipelineExecuted?.pipelineExecutionId || '',
      timestamp: item.lastPipelineExecuted?.lastExecutedAt || 0,
      status: item.lastPipelineExecuted?.status || ''
    }
  }))
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

const RenderType: Renderer<CellProps<ServiceListItem>> = ({ row }) => {
  const { deploymentTypeList } = row.original
  return <DeploymentTypeIcons deploymentTypes={deploymentTypeList} />
}

const TickerCard: React.FC<{ item: ChangeValue & { name: string } }> = props => {
  const { item } = props
  const value = Number(item.value)
  const isBoostMode = item.change === INVALID_CHANGE_RATE
  const color = (() => {
    if (item.name !== 'failureRate') {
      return !isBoostMode && item.change < 0 ? Color.RED_500 : Color.GREEN_500
    } else {
      return isBoostMode || item.change < 0 ? Color.GREEN_500 : Color.RED_500
    }
  })()
  return (
    <Layout.Vertical padding={'small'} key={item.name} width={'fit-content'} className={css.tickerContainer}>
      <Ticker
        value={
          isBoostMode ? (
            <></>
          ) : (
            <Text color={color} font={{ size: 'small' }}>{`${Math.abs(getFixed(item.change))}%`}</Text>
          )
        }
        decreaseMode={!isBoostMode && item.change < 0}
        boost={isBoostMode}
        color={color}
        tickerContainerStyles={css.tickerContainerStyles}
        size={isBoostMode ? 10 : 6}
      >
        <Text color={Color.BLACK} font={{ weight: 'semi-bold', size: 'medium' }} margin={{ right: 'xsmall' }}>
          {isNaN(value) ? item.value : numberFormatter(value)}
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
        label: getString('cd.serviceDashboard.nonProd'),
        value: serviceInstances.nonProdCount,
        formattedValue: numberFormatter(serviceInstances.nonProdCount),
        color: 'var(--primary-2)'
      },
      {
        label: getString('cd.serviceDashboard.prod'),
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
    <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
      <Text
        color={Color.BLACK}
        font={{ weight: 'semi-bold', size: 'medium' }}
        margin={{ right: 'xsmall' }}
        padding={{ left: 'medium', top: 'medium', right: 'medium', bottom: 'medium' }}
        className={css.tickerContainer}
      >
        {serviceInstances.count}
      </Text>
      {serviceInstances.count ? <PieChart {...pieChartProps} /> : <></>}
    </Layout.Horizontal>
  )
}

const RenderLastDeployment: Renderer<CellProps<ServiceListItem>> = ({ row }) => {
  const {
    lastDeployment: { id, name, timestamp }
  } = row.original
  const { getString } = useStrings()
  if (!id) {
    return <></>
  }
  return (
    <Layout.Vertical margin={{ right: 'large' }} flex={{ alignItems: 'flex-start' }}>
      <Layout.Horizontal
        margin={{ bottom: 'xsmall' }}
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
        width="100%"
      >
        <Text
          font={{ weight: 'semi-bold' }}
          color={Color.GREY_700}
          margin={{ right: 'xsmall' }}
          className={css.lastDeploymentText}
        >
          {name}
        </Text>
        <Text font={{ size: 'small' }} color={Color.GREY_500} className={css.lastDeploymentText}>{`(${getString(
          'cd.serviceDashboard.executionId',
          {
            id
          }
        )})`}</Text>
      </Layout.Horizontal>
      {timestamp ? (
        <ReactTimeago
          date={timestamp}
          component={val => (
            <Text font={{ size: 'small' }} color={Color.GREY_500}>
              {val.children}
            </Text>
          )}
        />
      ) : (
        <></>
      )}
    </Layout.Vertical>
  )
}

const RenderLastDeploymentStatus: Renderer<CellProps<ServiceListItem>> = ({ row }) => {
  const {
    lastDeployment: { id, status }
  } = row.original
  const { getString } = useStrings()
  if (!id) {
    return <></>
  }
  const [statusBackgroundColor, statusText] =
    status.toLocaleLowerCase() === DeploymentStatus.SUCCESS
      ? [Color.GREEN_600, getString('success')]
      : status.toLocaleLowerCase() === DeploymentStatus.FAILED
      ? [Color.RED_600, getString('failed')]
      : [Color.YELLOW_600, status]
  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
      <Text
        background={statusBackgroundColor}
        color={Color.WHITE}
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        className={css.statusText}
      >
        {statusText.toLocaleUpperCase()}
      </Text>
    </Layout.Horizontal>
  )
}

export const ServicesList: React.FC<ServicesListProps> = props => {
  const { loading, data, error, refetch } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()

  const history = useHistory()

  const ServiceListHeaderCustomPrimary = useMemo(
    () => (headerProps: { total?: number }) =>
      (
        <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_700}>
          {getString('cd.serviceDashboard.totalServices', {
            total: headerProps.total || 0
          })}
        </Text>
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
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
          Header: getString('cd.serviceDashboard.serviceInstances').toLocaleUpperCase(),
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
          Header: getString('cd.serviceDashboard.frequency').toLocaleUpperCase(),
          id: 'frequency',
          width: '10%',
          Cell: getRenderTickerCard('frequency')
        },
        {
          Header: getString('cd.serviceDashboard.lastDeployment').toLocaleUpperCase(),
          id: 'lastDeployment',
          width: '25%',
          Cell: RenderLastDeployment
        },
        {
          Header: '',
          id: 'status',
          width: '5%',
          Cell: RenderLastDeploymentStatus
        }
      ]
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const goToServiceDetails = useCallback(
    ({ id: serviceId }: ServiceListItem): void => {
      history.push(routes.toServiceDetails({ accountId, orgIdentifier, projectIdentifier, serviceId, module }))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId, orgIdentifier, projectIdentifier, module]
  )

  const dashboardListProps: DashboardListProps<ServiceListItem> = {
    columns,
    loading,
    error,
    data: transformServiceDetailsData(data),
    refetch,
    HeaderCustomPrimary: ServiceListHeaderCustomPrimary,
    onRowClick: goToServiceDetails
  }
  return <DashboardList<ServiceListItem> {...dashboardListProps} />
}
