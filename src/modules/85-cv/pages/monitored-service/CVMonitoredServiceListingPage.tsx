import React, { useState, useCallback, useMemo } from 'react'
import { Layout, Color, Text, Button, SelectOption, Select, Container } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import { useParams, useHistory, Link } from 'react-router-dom'
import cx from 'classnames'
import { Page, useToaster } from '@common/exports'
import { Table } from '@common/components'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { DependencyGraph } from '@cv/components/DependencyGraph/DependencyGraph'
import { HorizontalLayout } from '@cv/pages/health-source/common/StyledComponents'
import {
  useListMonitoredService,
  useDeleteMonitoredService,
  useGetMonitoredServiceListEnvironments,
  MonitoredServiceListItemDTO,
  ChangeSummaryDTO,
  useGetServiceDependencyGraph
} from 'services/cv'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import ServiceDependenciesLegend from '@cv/components/ServiceDependenciesLegend/ServiceDependenciesLegend'
import { getDependencyData } from '@cv/components/DependencyGraph/DependencyGraph.utils'
import ToggleMonitoring from '@cv/pages/monitored-service/components/toggleMonitoring/ToggleMonitoring'
import ImageDeleteService from '@cv/assets/delete-service.svg'
import { MonitoringServicesHeader } from './monitoredService.styled'
import {
  RenderHealthTrend,
  RenderHealthScore,
  getFilterAndEnvironmentValue,
  getEnvironmentOptions,
  calculateChangePercentage
} from './CVMonitoredServiceListingPage.utils'
import { Views } from './CVMonitoredServiceListingPage.constants'
import MonitoredServiceCategory from './components/Configurations/components/Dependency/component/components/MonitoredServiceCategory/MonitoredServiceCategory'
import css from './CVMonitoredServiceListingPage.module.scss'

const CategoryProps: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => (
  <MonitoredServiceCategory type={row?.original?.type} abbrText verticalAlign />
)

function CVMonitoredServiceListingPage(): JSX.Element {
  const { getString } = useStrings()
  const history = useHistory()
  const { showError, clear } = useToaster()
  const params = useParams<ProjectPathProps>()
  const [page, setPage] = useState(0)
  const [selectedView, setSelectedView] = useState<Views>(Views.LIST)
  const [environment, setEnvironment] = useState<SelectOption>()
  const { data: environmentDataList, loading: loadingServices } = useGetMonitoredServiceListEnvironments({
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier
    }
  })

  const { data, loading, refetch, error } = useListMonitoredService({
    queryParams: {
      offset: page,
      pageSize: 10,
      orgIdentifier: params.orgIdentifier,
      projectIdentifier: params.projectIdentifier,
      accountId: params.accountId,
      ...getFilterAndEnvironmentValue(environment?.value as string, '')
    },
    debounce: 400
  })

  const {
    data: serviceDependencyGraphData,
    loading: serviceDependencyGraphLoading,
    refetch: refetchServiceDependencyGraphData,
    error: serviceDependencyGraphError
  } = useGetServiceDependencyGraph({
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier,
      ...getFilterAndEnvironmentValue(environment?.value as string, '')
    }
  })

  const { mutate: deleteMonitoredService, loading: isDeleting } = useDeleteMonitoredService({
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier
    }
  })

  const { content, pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = data?.data ?? ({} as any)

  const onDelete = async (identifier?: string): Promise<void> => {
    try {
      if (identifier) {
        const delPromise = deleteMonitoredService(identifier)
        const refetchPromise = refetch()
        await Promise.all([delPromise, refetchPromise])
      }
      if (pageIndex > 0 && data?.data?.pageItemCount === 1) {
        setPage(page - 1)
      }
    } catch (e) {
      if (e?.data) {
        clear()
        showError(getErrorMessage(e))
      }
    }
  }

  const RenderServiceName: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
    const rowData = row?.original
    return (
      <Layout.Vertical>
        <Link
          to={routes.toCVAddMonitoringServicesEdit({
            accountId: params.accountId,
            projectIdentifier: params.projectIdentifier,
            orgIdentifier: params.orgIdentifier,
            identifier: rowData.identifier,
            module: 'cv'
          })}
        >
          <Text color={Color.PRIMARY_7} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
            {rowData.serviceName}
          </Text>
        </Link>
        <Link
          to={routes.toCVAddMonitoringServicesEdit({
            accountId: params.accountId,
            projectIdentifier: params.projectIdentifier,
            orgIdentifier: params.orgIdentifier,
            identifier: rowData.identifier,
            module: 'cv'
          })}
        >
          <Text color={Color.PRIMARY_7} font={{ align: 'left', size: 'xsmall' }}>
            {rowData.environmentName}
          </Text>
        </Link>
      </Layout.Vertical>
    )
  }

  const dependencyData = useMemo(() => getDependencyData(serviceDependencyGraphData), [serviceDependencyGraphData])

  const RenderServiceChanges: Renderer<CellProps<MonitoredServiceListItemDTO>> = useCallback(({ row }) => {
    const rowData = row?.original
    if (rowData?.changeSummary?.categoryCountMap) {
      const { categoryCountMap } = rowData?.changeSummary as ChangeSummaryDTO
      const {
        Infrastructure: { count: infraCount = 0 },
        Deployment: { count: deploymentCount = 0 },
        Alert: { count: alertCount = 0 }
      } = categoryCountMap as any
      const { color, percentage } = calculateChangePercentage(rowData?.changeSummary)

      return (
        <Layout.Horizontal spacing={'medium'} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
          <Text
            tooltip={getString('deploymentText')}
            inline
            icon={'nav-project'}
            font={{ weight: 'semi-bold' }}
            iconProps={{ size: 16, color: Color.GREY_700 }}
            color={Color.BLACK}
          >
            {deploymentCount}
          </Text>
          <Text
            tooltip={getString('infrastructureText')}
            inline
            icon="infrastructure"
            font={{ weight: 'semi-bold' }}
            iconProps={{ size: 26, color: Color.GREY_700 }}
            color={Color.BLACK}
          >
            {infraCount}
          </Text>
          <Text
            tooltip={getString('cv.changeSource.tooltip.incidents')}
            inline
            icon="warning-outline"
            font={{ weight: 'semi-bold' }}
            iconProps={{ size: 16 }}
            color={Color.BLACK}
          >
            {alertCount}
          </Text>
          <Text
            inline
            icon="symbol-triangle-up"
            color={color}
            font={{ size: 'xsmall' }}
            iconProps={{ size: 10, color: color }}
          >
            {`${percentage}%`}
          </Text>
        </Layout.Horizontal>
      )
    }
    return <></>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderDependencyData = useCallback(() => {
    return dependencyData ? (
      <Container padding="xxxlarge">
        <DependencyGraph dependencyData={dependencyData} options={{ chart: { height: 550 } }} />
        <Container margin={{ top: 'xxxlarge' }}>
          <ServiceDependenciesLegend />
        </Container>
      </Container>
    ) : (
      <></>
    )
  }, [dependencyData])

  const RenderStatusToggle: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
    const rowData = row?.original

    return (
      <Layout.Horizontal flex={{ alignItems: 'center' }}>
        <ToggleMonitoring
          refetch={refetch}
          identifier={rowData?.identifier as string}
          enable={!!rowData?.healthMonitoringEnabled}
        />
        <ContextMenuActions
          titleText={getString('common.delete', { name: rowData.serviceName })}
          contentText={
            <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Text color={Color.GREY_800}>
                {getString('cv.monitoredServices.deleteMonitoredServiceWarning', { name: rowData.serviceName })}
              </Text>
              <div>
                <img src={ImageDeleteService} width="204px" height="202px" />
              </div>
            </Layout.Horizontal>
          }
          confirmButtonText={getString('yes')}
          deleteLabel={getString('cv.monitoredServices.deleteService')}
          onDelete={async () => await onDelete(rowData.identifier)}
          editLabel={getString('cv.monitoredServices.editService')}
          onEdit={() => {
            history.push({
              pathname: routes.toCVMonitoredServiceConfigurations({
                accountId: params.accountId,
                projectIdentifier: params.projectIdentifier,
                orgIdentifier: params.orgIdentifier,
                identifier: rowData.identifier,
                module: 'cv'
              })
            })
          }}
        />
      </Layout.Horizontal>
    )
  }

  return (
    <>
      <MonitoringServicesHeader height={'80px'}>
        <HorizontalLayout alignItem={'flex-end'}>
          <div>
            <NGBreadcrumbs />
            <p>{getString('cv.monitoredServices.title')}</p>
          </div>
        </HorizontalLayout>
      </MonitoringServicesHeader>
      <MonitoringServicesHeader>
        <HorizontalLayout>
          <Button
            intent="primary"
            icon="plus"
            text={getString('cv.monitoredServices.newMonitoredServices')}
            margin={{ bottom: 'small' }}
            onClick={() => {
              history.push(
                routes.toCVAddMonitoringServicesSetup({
                  orgIdentifier: params.orgIdentifier,
                  projectIdentifier: params.projectIdentifier,
                  accountId: params.accountId
                })
              )
            }}
          />
          <HorizontalLayout alignItem={'baseline'}>
            <Text margin={{ right: 'large' }} font={{ size: 'small', weight: 'bold' }}>
              {getString('cv.monitoredServices.filterlabel')}
            </Text>
            <Select
              name={''}
              value={environment}
              inputProps={{
                leftIcon: 'search'
              }}
              defaultSelectedItem={{ label: getString('all'), value: getString('all') }}
              items={getEnvironmentOptions(environmentDataList, loadingServices, getString)}
              onChange={item => setEnvironment(item)}
            />
            <HorizontalLayout padding={{ left: 'medium' }}>
              <Button
                className={cx(
                  {
                    [css.listUnselected]: selectedView === Views.LIST
                  },
                  css.listButton
                )}
                minimal
                icon="graph"
                intent={selectedView === Views.GRAPH ? 'primary' : undefined}
                onClick={() => {
                  setSelectedView(Views.GRAPH)
                }}
                id="graph-select-button"
              />
              <Button
                className={cx(
                  {
                    [css.listUnselected]: selectedView === Views.GRAPH
                  },
                  css.listButton
                )}
                minimal
                icon="list"
                intent={selectedView === Views.LIST ? 'primary' : undefined}
                onClick={() => {
                  setSelectedView(Views.LIST)
                }}
                id="list-select-button"
              />
            </HorizontalLayout>
          </HorizontalLayout>
        </HorizontalLayout>
      </MonitoringServicesHeader>

      {selectedView === Views.GRAPH ? (
        <Page.Body
          loading={serviceDependencyGraphLoading}
          error={getErrorMessage(serviceDependencyGraphError)}
          retryOnError={() => refetchServiceDependencyGraphData()}
          noData={{
            when: () => !dependencyData,
            message: getString('cv.monitoredServices.noData')
          }}
        >
          {renderDependencyData()}
        </Page.Body>
      ) : (
        <Page.Body
          loading={loading || isDeleting}
          error={getErrorMessage(error)}
          retryOnError={() => refetch()}
          noData={{
            when: () => !content?.length,
            icon: 'join-table',
            message: getString('cv.monitoredServices.noData')
          }}
        >
          {content?.length ? (
            <Container padding="xxxlarge">
              <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_800} padding={{ bottom: 'large' }}>
                {getString('cv.monitoredServices.showingAllServices', { serviceCount: content.length })}
              </Text>
              <Table
                sortable={true}
                columns={[
                  {
                    Header: ' ',
                    width: '2.5%',
                    Cell: CategoryProps
                  },
                  {
                    Header: getString('name'),
                    width: '17.5%',
                    Cell: RenderServiceName
                  },
                  {
                    Header: getString('cv.monitoredServices.table.changes'),
                    width: '25%',
                    Cell: RenderServiceChanges
                  },
                  {
                    Header: getString('cv.monitoredServices.table.lastestHealthTrend'),
                    width: '25%',
                    Cell: RenderHealthTrend
                  },
                  {
                    Header: getString('cv.monitoredServices.table.serviceHealthScore'),
                    width: '20%',
                    Cell: RenderHealthScore
                  },
                  {
                    Header: getString('enabledLabel'),
                    width: '10%',
                    Cell: RenderStatusToggle
                  }
                ]}
                data={content}
                pagination={{
                  pageSize,
                  pageIndex,
                  pageCount: totalPages,
                  itemCount: totalItems,
                  gotoPage: setPage
                }}
              />
            </Container>
          ) : null}
        </Page.Body>
      )}
    </>
  )
}

export default CVMonitoredServiceListingPage
