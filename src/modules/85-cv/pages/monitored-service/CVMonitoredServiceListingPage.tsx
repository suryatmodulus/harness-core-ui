import React, { useState } from 'react'
import { Layout, Color, Text, Button, SelectOption, Select } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import { useParams, useHistory } from 'react-router-dom'
import styled from '@emotion/styled'
import { Page, useToaster } from '@common/exports'
import { PageSpinner, Table } from '@common/components'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { BGColorWrapper, HorizontalLayout } from '@cv/pages/health-source/common/StyledComponents'
import {
  useListMonitoredService,
  useDeleteMonitoredService,
  useGetMonitoredServiceListEnvironments,
  MonitoredServiceListItemDTO
} from 'services/cv'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import { MonitoringServicesHeader } from './monitoredService.styled'
import {
  RenderHealthTrend,
  RenderHealthScore,
  RenderTags,
  getFilterAndEnvironmentValue,
  getEnvironmentOptions
} from './CVMonitoredServiceListingPage.utils'

const ServiceCount = styled(Text)`
  padding-bottom: var(--spacing-xxlarge) !important;
  border-bottom: 1px solid var(--grey-200) !important;
`

const PageBody = styled(Page.Body)`
  margin: var(--spacing-xxxlarge) !important;
`

function CVMonitoredServiceListingPage(): JSX.Element {
  const { getString } = useStrings()
  const history = useHistory()
  const { selectedProject } = useAppStore()
  const { showError, clear } = useToaster()
  const project = selectedProject
  const params = useParams<ProjectPathProps>()
  const [page, setPage] = useState(0)
  const [environment, setEnvironment] = useState<SelectOption>()
  // const [searchTerm, setSearchTerm] = useState('') // TODO: Need clarificaition from product
  const { data: environmentDataList, loading: loadingServices } = useGetMonitoredServiceListEnvironments({
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier
    }
  })

  const { data, loading, refetch } = useListMonitoredService({
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
  const { mutate: deleteMonitoredService, loading: isDeleting } = useDeleteMonitoredService({
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier
    }
  })

  const onDelete = async (identifier?: string): Promise<void> => {
    try {
      if (identifier) {
        const delPromise = deleteMonitoredService(identifier)
        const refetchPromise = refetch()
        await Promise.all([delPromise, refetchPromise])
      }
      const { pageItemCount, pageIndex } = data?.data ?? {}
      if (pageIndex! > 0 && pageItemCount === 1) {
        setPage(page - 1)
      }
    } catch (e) {
      if (e?.data) {
        clear()
        showError(getErrorMessage(e))
      }
    }
  }
  const { content = [], pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = data?.data ?? ({} as any)
  const MonitoredServiceActions: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
    const rowdata = row?.original
    return (
      <Layout.Horizontal>
        <ContextMenuActions
          titleText={getString('cv.monitoredServices.deleteMonitoredService')}
          contentText={getString('cv.monitoredServices.deleteMonitoredServiceWarning') + `: ${rowdata.identifier}`}
          onDelete={async () => await onDelete(rowdata.identifier)}
          onEdit={() => {
            history.push(
              routes.toCVAddMonitoringServicesEdit({
                accountId: params.accountId,
                projectIdentifier: params.projectIdentifier,
                orgIdentifier: params.orgIdentifier,
                identifier: rowdata.identifier
              })
            )
          }}
          onToggleMonitoredServiceData={{
            refetch,
            identifier: rowdata?.identifier as string,
            enabled: !!rowdata?.healthMonitoringEnabled
          }}
        />
      </Layout.Horizontal>
    )
  }

  const RenderServiceName: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
    const rowData = row?.original
    return (
      <Layout.Vertical>
        <Text color={Color.PRIMARY_7} font={{ align: 'left', size: 'normal' }}>
          {rowData.serviceName}
        </Text>
        <Text color={Color.PRIMARY_7} margin={{ bottom: 'small' }} font={{ align: 'left', size: 'xsmall' }}>
          {rowData.environmentName}
        </Text>
      </Layout.Vertical>
    )
  }

  return (
    <BGColorWrapper>
      <MonitoringServicesHeader height={'80px'}>
        <HorizontalLayout alignItem={'flex-end'}>
          <div>
            <Breadcrumbs
              links={[
                {
                  url: routes.toCVProjectOverview({
                    orgIdentifier: params.orgIdentifier,
                    projectIdentifier: params.projectIdentifier,
                    accountId: params.accountId
                  }),
                  label: project?.name as string
                },
                {
                  url: '#',
                  label: ''
                }
              ]}
            />
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
              items={
                loadingServices
                  ? [{ label: getString('loading'), value: 'loading' }]
                  : environmentDataList
                  ? getEnvironmentOptions(environmentDataList, getString('all'))
                  : []
              }
              onChange={item => setEnvironment(item)}
            />
            {/* 
            TODO: Need clarificaition from product
            <ExpandingSearchInput  
              placeholder={getString('search')}
              throttle={200}
              onChange={(query: string) => {
                setSearchTerm(query)
              }}
            /> */}
          </HorizontalLayout>
        </HorizontalLayout>
      </MonitoringServicesHeader>
      <PageBody>
        <ServiceCount font={{ size: 'medium' }}>
          {getString('cv.monitoredServices.serviceCount', { serviceCount: content.length })}
        </ServiceCount>

        {(loading || isDeleting) && <PageSpinner />}
        {content.length > 0 ? (
          <Table
            sortable={true}
            columns={[
              {
                Header: getString('cv.monitoredServices.table.serviceName'),
                width: '20%',
                Cell: RenderServiceName
              },
              {
                Header: getString('cv.monitoredServices.table.lastestHealthTrend'),
                width: '30%',
                Cell: RenderHealthTrend
              },
              {
                Header: getString('cv.monitoredServices.table.serviceHealthScore'),
                width: '18%',
                Cell: RenderHealthScore
              },
              {
                Header: getString('tagLabel'),
                width: '12%',
                Cell: RenderTags
              },
              {
                Header: getString('pipeline.triggers.triggerConfigurationPanel.actions'),
                width: '15%',
                Cell: MonitoredServiceActions
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
        ) : (
          <NoDataCard icon={'join-table'} message={getString('cv.monitoredServices.noData')} />
        )}
      </PageBody>
    </BGColorWrapper>
  )
}

export default CVMonitoredServiceListingPage
