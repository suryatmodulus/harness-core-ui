import React, { useState, useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
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
  useGetCountOfServices,
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
import { getDependencyData } from '@cv/components/DependencyGraph/DependencyGraph.utils'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import { getEnvironmentIdentifier } from './CVMonitoredService.utils'
import { FilterTypes } from './CVMonitoredService.types'
import MonitoredServiceListView from './components/MonitoredServiceListView/MonitoredServiceListView'
import MonitoredServiceGraphView from './components/MonitoredServiceGraphView/MonitoredServiceGraphView'
import css from './CVMonitoredService.module.scss'

const MonitoredService: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { view } = useQueryParams<{ view?: Views.GRID }>()
  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const pathParams = {
    accountId,
    orgIdentifier,
    projectIdentifier
  }

  const [page, setPage] = useState(0)
  const [selectedView, setSelectedView] = useState<Views>(view === Views.GRID ? Views.GRID : Views.LIST)
  const [environment, setEnvironment] = useState<SelectOption>()
  const [selectedFilter, setSelectedFilter] = useState<FilterTypes>(FilterTypes.ALL)

  const { data: environmentDataList, loading: loadingEnvironments } = useGetMonitoredServiceListEnvironments({
    queryParams: pathParams
  })

  const {
    data: serviceCountData,
    loading: serviceCountLoading,
    error: serviceCountError,
    refetch: refetchServiceCountData
  } = useGetCountOfServices({
    queryParams: {
      ...pathParams,
      environmentIdentifier: getEnvironmentIdentifier(environment)
    }
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
      environmentIdentifier: getEnvironmentIdentifier(environment),
      servicesAtRiskFilter: selectedFilter === FilterTypes.RISK
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
      environmentIdentifier: getEnvironmentIdentifier(environment),
      servicesAtRiskFilter: selectedFilter === FilterTypes.RISK
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

      await Promise.all([refetchServiceCountData(), refetchMonitoredServiceList(), refetchServiceDependencyGraphData()])

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

      const { pageIndex = 0, pageItemCount } = defaultTo(monitoredServiceListData?.data, {})

      await Promise.all([refetchServiceCountData(), refetchMonitoredServiceList(), refetchServiceDependencyGraphData()])

      showSuccess(getString('cv.monitoredServices.monitoredServiceDeleted'))

      if (pageIndex > 0 && pageItemCount === 1) {
        setPage(page - 1)
      }
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const onFilter = (type: FilterTypes): void => {
    if (type !== selectedFilter) {
      setSelectedFilter(type)
      refetchServiceCountData()
    }
  }

  const onEditService = (identifier: string): void => {
    history.push({
      pathname: routes.toCVAddMonitoringServicesEdit({
        ...pathParams,
        identifier,
        module: 'cv'
      }),
      search: getCVMonitoringServicesSearchParam({ view: selectedView, tab: MonitoredServiceEnum.Configurations })
    })
  }

  const createButton = (
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
  )

  const loading =
    serviceCountLoading || monitoredServiceListLoading || deleteMonitoredServiceLoading || healthMonitoringFlagLoading
  const error = serviceCountError || monitoredServiceListError

  const retryOnError = (): void => {
    if (serviceCountError) {
      refetchServiceCountData()
    }
    if (monitoredServiceListError) {
      refetchMonitoredServiceList()
    }
    if (serviceDependencyGraphError) {
      refetchServiceDependencyGraphData()
    }
  }

  return (
    <>
      <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('cv.monitoredServices.title')} />
      <Page.Header
        title={createButton}
        toolbar={
          <Layout.Horizontal>
            <Select
              value={{
                label: `${getString('environment')}: ${defaultTo(environment?.label, getString('all'))}`,
                value: defaultTo(environment?.value, getString('all'))
              }}
              defaultSelectedItem={{ label: getString('all'), value: getString('all') }}
              items={getEnvironmentOptions(environmentDataList, loadingEnvironments, getString)}
              onChange={item => {
                setPage(0)
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
          loading={loading}
          error={getErrorMessage(error)}
          retryOnError={retryOnError}
          noData={{
            when: () => !serviceCountData?.allServicesCount,
            image: noServiceAvailableImage,
            imageClassName: css.noServiceAvailableImage,
            message: getString('cv.monitoredServices.youHaveNoMonitoredServices'),
            button: createButton
          }}
          className={css.pageBody}
        >
          <MonitoredServiceListView
            serviceCountData={serviceCountData}
            monitoredServiceListData={monitoredServiceListData?.data}
            selectedFilter={selectedFilter}
            onFilter={onFilter}
            onEditService={onEditService}
            onDeleteService={onDeleteService}
            setPage={setPage}
            onToggleService={onToggleService}
          />
        </Page.Body>
      ) : (
        <Page.Body
          loading={loading || serviceDependencyGraphLoading}
          error={getErrorMessage(error || serviceDependencyGraphError)}
          retryOnError={retryOnError}
          noData={{
            when: () => !serviceCountData?.allServicesCount,
            image: noServiceAvailableImage,
            imageClassName: css.noServiceAvailableImage,
            message: getString('cv.monitoredServices.youHaveNoMonitoredServices'),
            button: createButton
          }}
          className={css.pageBody}
        >
          <MonitoredServiceGraphView
            serviceCountData={serviceCountData}
            monitoredServiceListData={monitoredServiceListData?.data}
            selectedFilter={selectedFilter}
            onFilter={onFilter}
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
