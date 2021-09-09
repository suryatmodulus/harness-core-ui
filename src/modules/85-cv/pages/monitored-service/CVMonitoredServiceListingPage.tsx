import React, { useState, useCallback } from 'react'
import { Layout, Color, Text, Button, SelectOption, Select } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import { useParams, useHistory, Link } from 'react-router-dom'
import styled from '@emotion/styled'
import { Page, useToaster } from '@common/exports'
import { Table } from '@common/components'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { BGColorWrapper, HorizontalLayout } from '@cv/pages/health-source/common/StyledComponents'
import {
  useListMonitoredService,
  useDeleteMonitoredService,
  useGetMonitoredServiceListEnvironments,
  MonitoredServiceListItemDTO,
  ChangeSummaryDTO
} from 'services/cv'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import { MonitoringServicesHeader } from './monitoredService.styled'
import {
  showPageSpinner,
  RenderHealthTrend,
  RenderHealthScore,
  RenderTags,
  getFilterAndEnvironmentValue,
  getEnvironmentOptions,
  calculateChangePercentage
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
  const { showError, clear } = useToaster()
  const params = useParams<ProjectPathProps>()
  const [page, setPage] = useState(0)
  const [environment, setEnvironment] = useState<SelectOption>()
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

  const { content = [], pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = data?.data ?? ({} as any)

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

  const MonitoredServiceActions: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
    const rowdata = row?.original
    return (
      <Layout.Horizontal>
        <ContextMenuActions
          titleText={getString('cv.monitoredServices.deleteMonitoredService')}
          contentText={getString('cv.monitoredServices.deleteMonitoredServiceWarning') + `: ${rowdata.identifier}`}
          onDelete={async () => await onDelete(rowdata.identifier)}
          onEdit={() => {
            history.push({
              pathname: routes.toCVMonitoredServiceConfigurations({
                accountId: params.accountId,
                projectIdentifier: params.projectIdentifier,
                orgIdentifier: params.orgIdentifier,
                identifier: rowdata.identifier,
                module: 'cv'
              })
            })
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
        <Link
          to={routes.toCVAddMonitoringServicesEdit({
            accountId: params.accountId,
            projectIdentifier: params.projectIdentifier,
            orgIdentifier: params.orgIdentifier,
            identifier: rowData.identifier,
            module: 'cv'
          })}
        >
          <Text color={Color.PRIMARY_7} font={{ align: 'left', size: 'normal' }}>
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
          <Text color={Color.PRIMARY_7} margin={{ bottom: 'small' }} font={{ align: 'left', size: 'xsmall' }}>
            {rowData.environmentName}
          </Text>
        </Link>
      </Layout.Vertical>
    )
  }

  const RenderServiceChanges: Renderer<CellProps<MonitoredServiceListItemDTO>> = useCallback(({ row }) => {
    const rowData = row?.original
    if (rowData?.changeSummary?.categoryCountMap) {
      const { categoryCountMap } = rowData?.changeSummary as ChangeSummaryDTO
      // ChangeSummaryDTO['categoryCountMap'] has not defined types as Infrastructure, Deployment, Alert
      const {
        Infrastructure: { count: infraCount = 0 },
        Deployment: { count: deploymentCount = 0 },
        Alert: { count: alertCount = 0 }
      } = categoryCountMap as any
      const { color, percentage } = calculateChangePercentage(rowData?.changeSummary)
      return (
        <Layout.Horizontal spacing={'medium'}>
          <Text inline icon="cube" font={{ weight: 'semi-bold' }} iconProps={{ size: 16 }}>
            {deploymentCount}
          </Text>
          <Text inline icon="infrastructure" font={{ weight: 'semi-bold' }} iconProps={{ size: 20 }}>
            {infraCount}
          </Text>
          <Text inline icon="warning-outline" font={{ weight: 'semi-bold' }} iconProps={{ size: 16 }}>
            {alertCount}
          </Text>
          <Text
            inline
            icon="symbol-triangle-up"
            color={color}
            font={{ size: 'xsmall' }}
            iconProps={{ size: 6, color: color }}
          >
            {percentage}
          </Text>
        </Layout.Horizontal>
      )
    }
    return <></>
  }, [])

  return (
    <BGColorWrapper>
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

        {showPageSpinner(loading, isDeleting)}
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
                Header: getString('cv.monitoredServices.table.changes'),
                width: '20%',
                Cell: RenderServiceChanges
              },
              {
                Header: getString('cv.monitoredServices.table.lastestHealthTrend'),
                width: '20%',
                Cell: RenderHealthTrend
              },
              {
                Header: getString('cv.monitoredServices.table.serviceHealthScore'),
                width: '20%',
                Cell: RenderHealthScore
              },
              {
                Header: getString('tagLabel'),
                width: '10%',
                Cell: RenderTags
              },
              {
                Header: getString('pipeline.triggers.triggerConfigurationPanel.actions'),
                width: '10%',
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
