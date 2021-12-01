import React, { useEffect, useMemo, useState } from 'react'
import { Avatar, Layout, TableV2, Text, Icon } from '@wings-software/uicore'
import type { Column, Renderer, CellProps } from 'react-table'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { AuditEventDTO, useGetAuditList } from 'services/audit'
import { getReadableDateTime } from '@common/utils/dateUtils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ResponsePageAuditEventDTO } from 'services/audit'
import AuditTrailFactory from '@audit-trail/factories/AuditTrailFactory'
import EventSummary from './EventSummary/EventSummary'
import AuditTrailSubHeader, { TableFiltersPayload } from './AuditTrailSubHeader/AuditTrailSubHeader'
import css from './AuditTrail.module.scss'

const renderColumnTimeStamp: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  const time = getReadableDateTime(row.original.timestamp, 'hh:mm a')
  const date = getReadableDateTime(row.original.timestamp, 'MMM DD, YYYY')
  return (
    <>
      <Text margin={{ bottom: 'small' }}>{time}</Text>
      <Text>{date}</Text>
    </>
  )
}

const renderColumnUser: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Layout.Horizontal padding={{ right: 'medium' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar name={row.original.authenticationInfo.principal.identifier} hoverCard={false} />
      <Text lineClamp={1}>{row.original.authenticationInfo.principal.identifier}</Text>
    </Layout.Horizontal>
  )
}

const renderColumnAction: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  // format action and render icon, mapping is missing.
  return (
    <Layout.Horizontal padding={{ right: 'medium' }}>
      <Text lineClamp={1}>{row.original.action}</Text>
    </Layout.Horizontal>
  )
}

const renderColumnResource: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  const { resourceRenderer } = AuditTrailFactory.getModuleProperties(row.original.module) || {}
  return resourceRenderer?.(row.original) || ''
}

const renderColumnOrganization: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Text padding={{ right: 'medium' }} lineClamp={1}>
      {row.original.resourceScope.orgIdentifier}
    </Text>
  )
}

const renderColumnProject: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Text padding={{ right: 'medium' }} lineClamp={1}>
      {row.original?.resourceScope?.projectIdentifier}
    </Text>
  )
}

const renderColumnModule: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  const { iconName } = AuditTrailFactory.getModuleProperties(row.original.module) || {}
  return iconName ? <Icon name={iconName} /> : ''
}

const renderColumnEnvironment: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original.environment?.identifier || ''
}

const PAGE_SIZE = 10

const AuditTrail: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [auditList, setAuditList] = useState<ResponsePageAuditEventDTO>({})
  const [selectedAuditId, setAuditId] = useState<string>()
  const [page, setPage] = useState(0)

  const { mutate: fetchAuditList, loading } = useGetAuditList({
    queryParams: {
      accountIdentifier: accountId,
      pageSize: PAGE_SIZE,
      pageIndex: page
    }
  })

  const getAuditList = async (): Promise<void> => {
    const auditListResponse = await fetchAuditList({ scopes: [{ accountIdentifier: accountId }], filterType: 'Audit' })
    setAuditList(auditListResponse)
  }

  useEffect(() => {
    getAuditList()
  }, [fetchAuditList])

  const renderNotesColumn: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    const { auditId } = row.original
    return (
      <Icon
        name="notes"
        size={20}
        onClick={() => {
          setAuditId(auditId)
        }}
      />
    )
  }

  const columns: Column<AuditEventDTO>[] = useMemo(
    () => [
      {
        Header: getString('timePst'),
        id: 'time',
        width: '9%',
        accessor: row => row.timestamp,
        Cell: renderColumnTimeStamp
      },
      {
        Header: () => <Text margin={{ left: 'small' }}>{getString('rbac.user')}</Text>,
        id: 'user',
        width: '15%',
        accessor: row => row.timestamp,
        Cell: renderColumnUser
      },
      {
        Header: getString('action'),
        id: 'action',
        width: '11%',
        accessor: row => row.timestamp,
        Cell: renderColumnAction
      },
      {
        Header: getString('pipeline.testsReports.resource'),
        id: 'resource',
        width: '15%',
        accessor: row => row.timestamp,
        Cell: renderColumnResource
      },
      {
        Header: getString('orgLabel'),
        id: 'organization',
        width: '15%',
        accessor: row => row.timestamp,
        Cell: renderColumnOrganization
      },
      {
        Header: getString('projectLabel'),
        id: 'project',
        width: '15%',
        accessor: row => row.timestamp,
        Cell: renderColumnProject
      },
      {
        Header: getString('module'),
        id: 'module',
        width: '10%',
        accessor: row => row.timestamp,
        Cell: renderColumnModule
      },
      {
        Header: getString('environment'),
        id: 'environment',
        width: '10%',
        accessor: row => row.timestamp,
        Cell: renderColumnEnvironment
      },
      {
        Header: '',
        id: 'yaml',
        width: '5%',
        accessor: row => row.timestamp,
        Cell: renderNotesColumn
      }
    ],
    []
  )

  const handleFiltersChange = (_filtersPayload: TableFiltersPayload): void => {
    // Backend isn't ready
  }

  const onDownloadClick = (): void => {
    // Backend is not ready yet.
  }

  const { data } = auditList
  return (
    <>
      <Page.Header title={getString('common.auditTrail')} breadcrumbs={<NGBreadcrumbs />} />
      <AuditTrailSubHeader onChange={handleFiltersChange} handleDownloadClick={onDownloadClick} />
      <Page.Body loading={loading}>
        <TableV2<AuditEventDTO>
          data={data?.content || []}
          columns={columns}
          className={css.table}
          pagination={{
            itemCount: data?.totalItems || 0,
            pageSize: data?.pageSize || 10,
            pageCount: data?.totalPages || 0,
            pageIndex: data?.pageIndex || 0,
            gotoPage: setPage
          }}
        />
        {selectedAuditId && (
          <EventSummary
            onClose={() => {
              setAuditId(undefined)
            }}
            accountIdentifier={accountId}
            auditId={selectedAuditId}
          />
        )}
      </Page.Body>
    </>
  )
}

export default AuditTrail
