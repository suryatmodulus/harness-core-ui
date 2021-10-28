import React, { useState, useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Page,
  Button,
  ButtonVariation,
  Layout,
  Select,
  GridListToggle,
  Views,
  SelectOption,
  useToaster
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import {
  useGetMonitoredServiceListEnvironments,
  useListMonitoredService,
  useSetHealthMonitoringFlag,
  useDeleteMonitoredService,
  useGetServiceDependencyGraph
} from 'services/cv'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getCVMonitoringServicesSearchParam, getErrorMessage, getEnvironmentOptions } from '@cv/utils/CommonUtils'
import type { FilterCardItem } from '@cv/components/FilterCard/FilterCard.types'
import { getDependencyData } from '@cv/components/DependencyGraph/DependencyGraph.utils'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import { getFilterAndEnvironmentValue } from './CVMonitoredService.utils'
import MonitoredServiceListView from './components/MonitoredServiceListView/MonitoredServiceListView'
import MonitoredServiceGraphView from './components/MonitoredServiceGraphView/MonitoredServiceGraphView'
import css from './CVMonitoredService.module.scss'

const MonitoredService: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { view } = useQueryParams<{ view?: Views.GRID }>()
  const { showError, showSuccess } = useToaster()
  const params = useParams<ProjectPathProps>()
  const pathParams = {
    accountId: params.accountId,
    projectIdentifier: params.projectIdentifier,
    orgIdentifier: params.orgIdentifier
  }

  const [page, setPage] = useState(0)
  const [selectedView, setSelectedView] = useState<Views>(view === Views.GRID ? Views.GRID : Views.LIST)
  const [environment, setEnvironment] = useState<SelectOption>()
  const [selectedFilter, setSelectedFilter] = useState<FilterCardItem>()

  const { data: environmentDataList, loading: loadingEnvironments } = useGetMonitoredServiceListEnvironments({
    queryParams: pathParams
  })

  const {
    data: monitoredServiceListData,
    loading: monitoredServiceListLoading,
    refetch: refetchMonitoredServiceList,
    error: monitoredServiceListError
  } = useListMonitoredService({
    queryParams: {
      offset: page,
      pageSize: 10,
      ...pathParams,
      ...getFilterAndEnvironmentValue(environment?.value as string, '')
    }
  })

  const {
    data: serviceDependencyGraphData,
    loading: serviceDependencyGraphLoading,
    refetch: refetchServiceDependencyGraphData,
    error: serviceDependencyGraphError
  } = useGetServiceDependencyGraph({
    queryParams: {
      ...pathParams,
      ...getFilterAndEnvironmentValue(environment?.value as string, '')
    }
  })

  const monitoredServiceDependencyData = useMemo(
    () => getDependencyData(serviceDependencyGraphData),
    [serviceDependencyGraphData]
  )

  const { mutate: setHealthMonitoringFlag, loading: healthMonitoringFlagLoading } = useSetHealthMonitoringFlag({
    identifier: ''
  })

  const onToggleService = async (identifier: string, checked: boolean): Promise<void> => {
    try {
      const response = await setHealthMonitoringFlag(undefined, {
        pathParams: {
          identifier
        },
        queryParams: {
          enable: checked,
          ...pathParams
        }
      })

      await Promise.all([refetchMonitoredServiceList(), refetchServiceDependencyGraphData()])

      showSuccess(
        getString('cv.monitoredServices.monitoredServiceToggle', {
          enabled: response.resource?.healthMonitoringEnabled ? 'enabled' : 'disabled'
        })
      )
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const { mutate: deleteMonitoredService, loading: deleteMonitoredServiceLoading } = useDeleteMonitoredService({
    queryParams: pathParams
  })

  const onDeleteService = async (identifier: string): Promise<void> => {
    try {
      await deleteMonitoredService(identifier)

      const { pageIndex = 0, pageItemCount } = monitoredServiceListData?.data || {}

      await Promise.all([refetchMonitoredServiceList(), refetchServiceDependencyGraphData()])

      showSuccess(getString('cv.monitoredServices.monitoredServiceDeleted'))

      if (pageIndex > 0 && pageItemCount === 1) {
        setPage(page - 1)
      }
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const onEditService = (identifier: string): void => {
    history.push({
      pathname: routes.toCVAddMonitoringServicesEdit({
        ...pathParams,
        identifier: identifier,
        module: 'cv'
      }),
      search: getCVMonitoringServicesSearchParam({ view: selectedView, tab: MonitoredServiceEnum.Configurations })
    })
  }

  return (
    <>
      <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('cv.monitoredServices.title')} />
      <Page.Header
        title={
          <Button
            variation={ButtonVariation.PRIMARY}
            icon="plus"
            text={getString('cv.monitoredServices.newMonitoredServices')}
            onClick={() => {
              history.push({
                pathname: routes.toCVAddMonitoringServicesSetup(pathParams),
                search: getCVMonitoringServicesSearchParam({ view: selectedView })
              })
            }}
          />
        }
        toolbar={
          <Layout.Horizontal>
            <Select
              value={{
                label: `${getString('environment')}: ${environment?.label ?? getString('all')}`,
                value: environment?.value ?? getString('all')
              }}
              defaultSelectedItem={{ label: getString('all'), value: getString('all') }}
              items={getEnvironmentOptions(environmentDataList, loadingEnvironments, getString)}
              onChange={item => {
                setSelectedFilter(undefined)
                setEnvironment(item)
              }}
              className={css.filterSelect}
            />
            <GridListToggle
              initialSelectedView={selectedView}
              onViewToggle={setSelectedView}
              icons={{ left: 'graph' }}
            />
          </Layout.Horizontal>
        }
      />
      {selectedView === Views.LIST ? (
        <Page.Body
          loading={monitoredServiceListLoading || deleteMonitoredServiceLoading || healthMonitoringFlagLoading}
          error={getErrorMessage(monitoredServiceListError)}
          retryOnError={() => refetchMonitoredServiceList()}
          noData={{
            when: () => !monitoredServiceListData?.data?.content?.length,
            icon: 'join-table',
            message: getString('cv.monitoredServices.noData')
          }}
          className={css.pageBody}
        >
          <MonitoredServiceListView
            monitoredServiceListData={monitoredServiceListData?.data}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            onEditService={onEditService}
            onDeleteService={onDeleteService}
            setPage={setPage}
            onToggleService={onToggleService}
          />
        </Page.Body>
      ) : (
        <Page.Body
          loading={
            serviceDependencyGraphLoading ||
            monitoredServiceListLoading ||
            deleteMonitoredServiceLoading ||
            healthMonitoringFlagLoading
          }
          error={getErrorMessage(serviceDependencyGraphError ?? monitoredServiceListError)}
          retryOnError={() => {
            if (serviceDependencyGraphError) {
              refetchServiceDependencyGraphData()
            }
            if (monitoredServiceListError) {
              refetchMonitoredServiceList()
            }
          }}
          noData={{
            when: () => !monitoredServiceDependencyData,
            message: getString('cv.monitoredServices.noData')
          }}
          className={css.pageBody}
        >
          <MonitoredServiceGraphView
            monitoredServiceListData={monitoredServiceListData?.data}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            onEditService={onEditService}
            onDeleteService={onDeleteService}
            healthMonitoringFlagLoading={healthMonitoringFlagLoading}
            monitoredServiceDependencyData={monitoredServiceDependencyData}
            onToggleService={onToggleService}
          />
        </Page.Body>
      )}
    </>
  )
}

export default MonitoredService
