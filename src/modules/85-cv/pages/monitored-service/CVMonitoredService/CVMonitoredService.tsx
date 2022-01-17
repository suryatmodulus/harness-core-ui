/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Page, ButtonVariation, Layout, Select, GridListToggle, Views, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier, ResourceType } from 'microfrontends'
import { useGetMonitoredServiceListEnvironments, useGetCountOfServices } from 'services/cv'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import RbacButton from '@rbac/components/Button/Button'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getCVMonitoringServicesSearchParam, getErrorMessage, getEnvironmentOptions } from '@cv/utils/CommonUtils'
import ServiceDependencyGraph from '@cv/pages/monitored-service/CVMonitoredService/components/MonitoredServiceGraphView/MonitoredServiceGraphView'
import { getEnvironmentIdentifier } from './CVMonitoredService.utils'
import { FilterTypes } from './CVMonitoredService.types'
import MonitoredServiceList from './components/MonitoredServiceListView/MonitoredServiceList'
import css from './CVMonitoredService.module.scss'

const MonitoredService: React.FC = () => {
  const { getString } = useStrings()
  const history = useHistory()
  const { view } = useQueryParams<{ view?: Views.GRID }>()
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

  useEffect(() => {
    setPage(0)
  }, [projectIdentifier])

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

  useEffect(() => {
    if (serviceCountData) {
      refetchServiceCountData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedView])

  const onFilter = (type: FilterTypes): void => {
    if (type !== selectedFilter) {
      setPage(0)
      setSelectedFilter(type)
      refetchServiceCountData()
    }
  }

  const createButton = (
    <RbacButton
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      text={getString('cv.monitoredServices.newMonitoredServices')}
      onClick={() => {
        history.push({
          pathname: routes.toCVAddMonitoringServicesSetup(pathParams),
          search: getCVMonitoringServicesSearchParam({ view: selectedView })
        })
      }}
      permission={{
        permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
        resource: {
          resourceType: ResourceType.MONITOREDSERVICE,
          resourceIdentifier: projectIdentifier
        }
      }}
    />
  )

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
        <MonitoredServiceList
          page={page}
          setPage={setPage}
          environmentIdentifier={getEnvironmentIdentifier(environment)}
          createButton={createButton}
          selectedFilter={selectedFilter}
          onFilter={onFilter}
          serviceCountData={serviceCountData}
          serviceCountLoading={serviceCountLoading}
          serviceCountErrorMessage={getErrorMessage(serviceCountError)}
          refetchServiceCountData={refetchServiceCountData}
        />
      ) : (
        <ServiceDependencyGraph
          isPageView
          serviceCountData={serviceCountData}
          selectedFilter={selectedFilter}
          onFilter={onFilter}
          refetchServiceCountData={refetchServiceCountData}
          serviceCountLoading={serviceCountLoading}
          createButton={createButton}
          environmentIdentifier={getEnvironmentIdentifier(environment)}
          serviceCountErrorMessage={getErrorMessage(serviceCountError)}
        />
      )}
    </>
  )
}

export default MonitoredService
