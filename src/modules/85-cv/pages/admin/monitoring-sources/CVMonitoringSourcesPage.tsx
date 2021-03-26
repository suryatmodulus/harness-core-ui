import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps } from 'react-table'
import { Container, Icon, Text, Button, TextInput } from '@wings-software/uicore'
import moment from 'moment'
import { Page } from '@common/exports'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useStrings } from 'framework/exports'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetMonitoringSources, MonitoringSource, useDeleteDSConfig } from 'services/cv'
import Table from '@common/components/Table/Table'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { getRoutePathByType } from '@cv/utils/routeUtils'
import ContextMenuActions from '../../../components/ContextMenuActions/ContextMenuActions'
import styles from './CVMonitoringSourcesPage.module.scss'

const DATE_FORMAT_STRING = 'MMM D, YYYY h:mm a'

const getRouteType = (type: string) => {
  const typeMappings: any = {
    APP_DYNAMICS: 'APP_DYNAMICS',
    STACKDRIVER: 'STACKDRIVER',
    NEW_RELIC: 'NEW_RELIC'
  }
  return getRoutePathByType(typeMappings[type])
}

export default function CVMonitoringSourcesPage() {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const { getString } = useStrings()
  const history = useHistory()
  const [page, setPage] = useState(0)
  const [textFilter, setTextFilter] = useState('')
  const { data, refetch, loading, error } = useGetMonitoringSources({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      pageIndex: page,
      pageSize: 5,
      filter: textFilter
    },
    debounce: 400
  })

  const { mutate: deleteMonitoringSource, loading: isDeleting } = useDeleteDSConfig({})

  const onCreateNew = () =>
    history.push(
      routes.toCVAdminSetup({
        accountId,
        projectIdentifier,
        orgIdentifier
      }) + '?step=2'
    )

  const onEdit = (identifier: string, type: string) =>
    history.push(
      routes.toCVAdminSetupMonitoringSourceEdit({
        accountId,
        projectIdentifier,
        orgIdentifier,
        monitoringSource: getRouteType(type),
        identifier
      })
    )

  const onDelete = async (identifier: string) => {
    await deleteMonitoringSource('' as any, {
      queryParams: {
        accountId,
        projectIdentifier,
        orgIdentifier,
        monitoringSourceIdentifier: identifier
      }
    })
    const { pageItemCount, pageIndex } = data?.data!
    if (pageIndex! > 0 && pageItemCount === 1) {
      setPage(page - 1)
    } else {
      refetch()
    }
  }

  const { content, pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = data?.data ?? ({} as any)

  return (
    <>
      <Page.Header
        title={
          <Breadcrumbs
            links={[
              {
                url: routes.toCVProjectOverview({ accountId, projectIdentifier, orgIdentifier }),
                label: projectIdentifier
              },
              {
                url: '#',
                label: getString('cv.navLinks.adminSideNavLinks.monitoringSources')
              }
            ]}
          />
        }
        toolbar={
          <TextInput
            leftIcon="search"
            placeholder={getString('cv.admin.monitoringSources.searchPlaceholder')}
            className={styles.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPage(0)
              setTextFilter(e.target.value.trim())
            }}
          />
        }
      />
      <Page.Body
        className={styles.main}
        error={error?.message}
        noData={{
          when: () => !loading && !content?.length,
          icon: 'warning-sign',
          buttonText: getString('cv.admin.monitoringSources.newMonitoringSource'),
          message: getString('cv.admin.monitoringSources.noDataMessage'),
          onClick: onCreateNew
        }}
      >
        <Button
          intent="primary"
          icon="plus"
          text={getString('cv.admin.monitoringSources.newMonitoringSource')}
          margin={{ bottom: 'small' }}
          onClick={onCreateNew}
        />
        {(loading || isDeleting) && <PageSpinner />}
        {content?.length && (
          <Table<MonitoringSource>
            onRowClick={val => {
              onEdit(val.monitoringSourceIdentifier!, val.type!)
            }}
            columns={[
              {
                Header: getString('name'),
                accessor: 'monitoringSourceName',
                width: '25%'
              },
              {
                Header: getString('typeLabel'),
                accessor: 'type',
                width: '15%',
                Cell: TypeTableCell
              },
              {
                Header: getString('numberOfServices'),
                accessor: 'numberOfServices',
                width: '20%'
              },
              {
                Header: getString('cv.admin.activitySources.tableColumnNames.lastUpdatedOn'),
                accessor: 'importedAt',
                width: '40%',
                Cell: function ImportedCellWrap(props) {
                  return <ImportedOnCell {...props} onEdit={onEdit} onDelete={onDelete} />
                }
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
        )}
      </Page.Body>
    </>
  )
}

function TypeTableCell(tableProps: CellProps<MonitoringSource>): JSX.Element {
  return (
    <Container>
      {tableProps.value === 'APP_DYNAMICS' && <Icon name="service-appdynamics" size={18} />}
      {tableProps.value === 'STACKDRIVER' && <Icon name="service-stackdriver" size={18} />}
      {tableProps.value === 'NEW_RELIC' && <Icon name="service-newrelic" size={18} />}
    </Container>
  )
}

function ImportedOnCell(
  props: CellProps<MonitoringSource> & {
    onEdit(id?: string, type?: string): void
    onDelete(id?: string): void
  }
): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container flex>
      <Text>{moment(props.value).format(DATE_FORMAT_STRING)}</Text>
      <ContextMenuActions
        onEdit={() => props?.onEdit(props.row.original.monitoringSourceIdentifier, props.row.original.type)}
        onDelete={() => props?.onDelete(props.row.original.monitoringSourceIdentifier)}
        titleText={getString('cv.admin.monitoringSources.confirmDeleteTitle')}
        contentText={
          getString('cv.admin.monitoringSources.confirmDeleteContent', {
            name: props.row.original.monitoringSourceName
          }) + '?'
        }
      />
    </Container>
  )
}
