import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps } from 'react-table'
import moment from 'moment'
import { Color, Container, Text, TextInput, Icon, Button } from '@wings-software/uicore'
import { ActivitySourceDTO, useDeleteKubernetesSource, useListActivitySources } from 'services/cv'
import { Page, useToaster } from '@common/exports'
import { Table } from '@common/components'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { KubernetesActivitySourceDTO } from '@cv/pages/onboarding/activity-source-setup/kubernetes/KubernetesActivitySourceUtils'
import type { CDActivitySourceDTO } from '@cv/pages/onboarding/activity-source-setup/harness-cd/SelectServices/SelectServices'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ContextMenuActions from '../../../components/ContextMenuActions/ContextMenuActions'

import css from './CVActivitySourcesPage.module.scss'

type TableData = {
  numberOfEnvironments?: number
  numberOfServices?: number
  name: string
  type: ActivitySourceDTO['type']
  createdOn?: string
  lastUpdatedOn?: string
  identifier: string
  editable?: boolean
}

const DATE_FORMAT_STRING = 'MMM D, YYYY h:mm a'

function typeToPathParam(type: ActivitySourceDTO['type']): string {
  switch (type) {
    case 'KUBERNETES':
      return 'kubernetes'
    case 'HARNESS_CD10':
      return 'harness-cd'
    default:
      return ''
  }
}

function generateTableData(activitySources?: ActivitySourceDTO[]): TableData[] {
  if (!activitySources?.length) {
    return []
  }

  const tableData: TableData[] = []
  for (const activitySource of activitySources) {
    if (!activitySource?.name || !activitySource?.identifier) continue
    const environments = new Set<string>()
    const services = new Set<string>()

    if (activitySource.type === 'KUBERNETES') {
      const kubernetesActivitySource = activitySource as KubernetesActivitySourceDTO
      kubernetesActivitySource?.activitySourceConfigs?.forEach(config => {
        services.add(config.serviceIdentifier)
        environments.add(config.envIdentifier)
      })
    } else if (activitySource.type === 'HARNESS_CD10') {
      const cdActivitySource = activitySource as CDActivitySourceDTO
      cdActivitySource.envMappings?.forEach?.(config => environments.add(config.envId))
      cdActivitySource.serviceMappings?.forEach?.(config => services.add(config.serviceId))
    }

    tableData.push({
      numberOfEnvironments: environments.size,
      numberOfServices: services.size,
      name: activitySource.name,
      identifier: activitySource.identifier || '',
      type: activitySource.type,
      lastUpdatedOn: moment(activitySource.lastUpdatedAt).format(DATE_FORMAT_STRING),
      editable: activitySource.editable
    })
  }

  return tableData
}

function TableCell(tableProps: CellProps<TableData>): JSX.Element {
  return (
    <Text lineClamp={1} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}

function TypeTableCell(tableProps: CellProps<TableData>): JSX.Element {
  return (
    <Container>
      {tableProps.value === 'KUBERNETES' && <Icon name="service-kubernetes" size={18} />}
      {tableProps.value === 'HARNESS_CD10' && <Icon name="harness" size={17} />}
      {tableProps.value === 'CDNG' && <Icon name="cd-main" size={18} />}
    </Container>
  )
}

function LastUpdatedOnWithMenu(tableProps: CellProps<TableData> & { cvngCdngIntFeatureFlag: boolean }): JSX.Element {
  const params = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const history = useHistory()
  const { mutate } = useDeleteKubernetesSource({
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier
    }
  })

  const onDelete = () => {
    mutate(tableProps.row.original?.identifier)
      .then(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        tableProps.onDelete()
      })
      .catch(error => {
        clear()
        showError(getErrorMessage(error))
      })
  }

  return (
    <Container flex>
      <Text color={Color.BLACK}>{tableProps.value}</Text>
      {tableProps.cvngCdngIntFeatureFlag ? (
        !!tableProps.row.original?.editable && (
          <ContextMenuActions
            titleText={getString('cv.admin.activitySources.dialogDeleteTitle')}
            contentText={`${getString('cv.admin.activitySources.dialogDeleteContent')}${
              tableProps.row.original?.name
            } ?`}
            onDelete={onDelete}
            onEdit={() =>
              history.push(
                routes.toCVActivitySourceEditSetup({
                  projectIdentifier: params.projectIdentifier,
                  orgIdentifier: params.orgIdentifier,
                  activitySource: typeToPathParam(tableProps.row.original.type),
                  activitySourceId: tableProps.row.original.identifier,
                  accountId: params.accountId
                })
              )
            }
          />
        )
      ) : (
        <ContextMenuActions
          titleText={getString('cv.admin.activitySources.dialogDeleteTitle')}
          contentText={`${getString('cv.admin.activitySources.dialogDeleteContent')}${tableProps.row.original?.name} ?`}
          onDelete={onDelete}
          onEdit={() =>
            history.push(
              routes.toCVActivitySourceEditSetup({
                projectIdentifier: params.projectIdentifier,
                orgIdentifier: params.orgIdentifier,
                activitySource: typeToPathParam(tableProps.row.original.type),
                activitySourceId: tableProps.row.original.identifier,
                accountId: params.accountId
              })
            )
          }
        />
      )}
    </Container>
  )
}

export default function CVActivitySourcesPage(): JSX.Element {
  const { getString } = useStrings()
  const params = useParams<ProjectPathProps>()
  const history = useHistory()
  const { selectedProject } = useAppStore()
  const project = selectedProject
  const [{ pageOffset, filter, debounce }, setFilterAndPageOffset] = useState<{
    pageOffset: number
    debounce: number
    filter?: string
  }>({
    pageOffset: 0,
    debounce: 0,
    filter: undefined
  })
  const { CVNG_CDNG_INTEGRATION } = useFeatureFlags()
  const { data, loading, error, refetch: refetchSources } = useListActivitySources({
    debounce,
    queryParams: {
      accountId: params.accountId,
      projectIdentifier: params.projectIdentifier,
      orgIdentifier: params.orgIdentifier,
      offset: pageOffset,
      pageSize: 10,
      filter
    }
  })

  const { content: activitySources, pageIndex = -1, totalItems = 0, totalPages = 0, pageSize = 0 } = data?.data || {}
  const tableData = generateTableData(activitySources)
  return (
    <>
      <Page.Header
        title={
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
              { url: '#', label: getString('cv.navLinks.adminSideNavLinks.activitySources') }
            ]}
          />
        }
        toolbar={
          <TextInput
            leftIcon="search"
            placeholder={getString('cv.admin.activitySources.searchBoxPlaceholder')}
            className={css.search}
            value={filter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setFilterAndPageOffset({ filter: e.target.value.trim(), pageOffset, debounce: 400 })
            }}
          />
        }
      />
      <Page.Body
        loading={loading}
        error={getErrorMessage(error)}
        retryOnError={() => refetchSources()}
        noData={{
          when: () => activitySources?.length === 0,
          icon: 'warning-sign',
          buttonText: getString('cv.admin.activitySources.addActivitySource'),
          message: getString('cv.admin.activitySources.noDataMessage'),
          onClick: () => history.push(routes.toCVAdminSetup({ ...params }))
        }}
      >
        <Container className={css.main}>
          <Button
            text={getString('cv.admin.activitySources.addActivitySource')}
            intent="primary"
            onClick={() => history.push(routes.toCVAdminSetup({ ...params }))}
          />
          <Table<TableData>
            data={tableData}
            onRowClick={(rowData: TableData) => {
              if (CVNG_CDNG_INTEGRATION) {
                !!rowData.editable &&
                  history.push(
                    routes.toCVActivitySourceEditSetup({
                      projectIdentifier: params.projectIdentifier,
                      orgIdentifier: params.orgIdentifier,
                      activitySource: typeToPathParam(rowData.type),
                      activitySourceId: rowData.identifier,
                      accountId: params.accountId
                    })
                  )
              } else {
                history.push(
                  routes.toCVActivitySourceEditSetup({
                    projectIdentifier: params.projectIdentifier,
                    orgIdentifier: params.orgIdentifier,
                    activitySource: typeToPathParam(rowData.type),
                    activitySourceId: rowData.identifier,
                    accountId: params.accountId
                  })
                )
              }
            }}
            pagination={{
              pageSize: pageSize || 0,
              pageIndex: pageIndex,
              pageCount: totalPages,
              itemCount: totalItems,
              gotoPage: newPageIndex => setFilterAndPageOffset({ pageOffset: newPageIndex, filter, debounce: 0 })
            }}
            columns={[
              {
                accessor: 'name',
                Header: getString('name'),
                width: '25%',
                Cell: TableCell
              },
              {
                accessor: 'type',
                Header: getString('typeLabel'),
                width: '16.5%',
                Cell: TypeTableCell,
                disableSortBy: true
              },
              {
                accessor: 'numberOfServices',
                Header: getString('numberOfServices'),
                width: '16.5%',
                Cell: TableCell
              },
              {
                accessor: 'numberOfEnvironments',
                Header: getString('cv.admin.activitySources.tableColumnNames.environments'),
                width: '16.5%',
                Cell: TableCell
              },
              {
                accessor: 'lastUpdatedOn',
                Header: getString('cv.admin.activitySources.tableColumnNames.lastUpdatedOn'),
                width: '25%',
                Cell: function LastColumn(cellProps: CellProps<TableData>) {
                  return (
                    <LastUpdatedOnWithMenu
                      {...cellProps}
                      onDelete={refetchSources}
                      cvngCdngIntFeatureFlag={CVNG_CDNG_INTEGRATION}
                    />
                  )
                }
              }
            ]}
          />
        </Container>
      </Page.Body>
    </>
  )
}
