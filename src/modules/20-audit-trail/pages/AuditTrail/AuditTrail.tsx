import React, { useEffect, useState } from 'react'
import { Avatar, Layout, TableV2, Text, Icon } from '@wings-software/uicore'
import type { Column, Renderer, CellProps } from 'react-table'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { AuditEventDTO, PageAuditEventDTO, useGetAuditList } from 'services/audit'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import dummyResponse from '../../mocks/response.json'
import YamlDiff from './YamlDiff/YamlDiff'
import AuditTrailSubHeader, { TableFiltersPayload } from './AuditTrailSubHeader/AuditTrailSubHeader'
import css from './AuditTrail.module.scss'

const renderColumnTimeStamp: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return formatDatetoLocale(row.original.timestamp)
}

const renderColumnUser: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar name={row.original.resourceScope.accountIdentifier} hoverCard={false} />
      <Text lineClamp={1}>{row.original.resourceScope.accountIdentifier}</Text>
    </Layout.Horizontal>
  )
}

const renderColumnAction: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original.action || '--'
}

const renderColumnResource: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Layout.Vertical>
      <Text>{row.original.resource.type}</Text>
      <Text>{row.original.resource.identifier}</Text>
    </Layout.Vertical>
  )
}

const renderColumnOrganization: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original.resourceScope.orgIdentifier || '--'
}

const renderColumnProject: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original?.resourceScope?.projectIdentifier || '--'
}

const renderColumnModule: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original.module || '--'
}

const renderColumnEnvironment: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original.environment?.identifier || '--'
}

const AuditTrail: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [showYamlDiff, setYamlDiffVisibility] = useState(false)

  const { mutate: fetchAuditList } = useGetAuditList({
    queryParams: {
      accountIdentifier: accountId,
      pageSize: 100,
      pageIndex: 0
    }
  })

  useEffect(() => {
    fetchAuditList({ scopes: [{ accountIdentifier: accountId }] })
  }, [fetchAuditList])

  const data = dummyResponse.data as PageAuditEventDTO

  const renderYamlDiffColumn: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    // const { auditId } = row.original
    return (
      <Icon
        name="file"
        onClick={() => {
          setYamlDiffVisibility(!showYamlDiff)
        }}
      />
    )
  }

  const columns: Column<AuditEventDTO>[] = [
    {
      Header: 'Time (PST)',
      id: 'timepst',
      width: '9%',
      accessor: row => row.timestamp,
      Cell: renderColumnTimeStamp
    },
    {
      Header: 'User',
      id: 'user',
      width: '13%',
      accessor: row => row.timestamp,
      Cell: renderColumnUser
    },
    {
      Header: 'Action',
      id: 'action',
      width: '13%',
      accessor: row => row.timestamp,
      Cell: renderColumnAction
    },
    {
      Header: 'Resource',
      id: 'resource',
      width: '15%',
      accessor: row => row.timestamp,
      Cell: renderColumnResource
    },
    {
      Header: 'Organization',
      id: 'organization',
      width: '15%',
      accessor: row => row.timestamp,
      Cell: renderColumnOrganization
    },
    {
      Header: 'Project',
      id: 'project',
      width: '15%',
      accessor: row => row.timestamp,
      Cell: renderColumnProject
    },
    {
      Header: 'Module',
      id: 'module',
      width: '10%',
      accessor: row => row.timestamp,
      Cell: renderColumnModule
    },
    {
      Header: 'Environment',
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
      Cell: renderYamlDiffColumn
    }
  ]

  const handleFiltersChange = (filtersPayload: TableFiltersPayload): void => {
    console.log('Trigger filter change', filtersPayload)
  }

  const onDownloadClick = (): void => {
    // handle download click here
  }

  const onColumnToggle = (): void => {
    //toggle column here
  }

  return (
    <>
      <Page.Header title={getString('common.auditTrail')} breadcrumbs={<NGBreadcrumbs />} />
      <AuditTrailSubHeader
        onChange={handleFiltersChange}
        handleDownloadClick={onDownloadClick}
        toggleColumn={onColumnToggle}
      />
      <Page.Body>
        <TableV2<AuditEventDTO>
          data={data?.content || []}
          columns={columns}
          sortable
          className={css.table}
          pagination={{
            itemCount: data?.content?.length || 0,
            pageSize: data?.pageSize || 10,
            pageCount: data?.totalPages || 0,
            pageIndex: data?.pageIndex || 0
          }}
        />
        {showYamlDiff && (
          <YamlDiff
            onDrawerClose={() => {
              setYamlDiffVisibility(false)
            }}
            accountIdentifier={accountId}
            auditId={'auditId'}
          />
        )}
      </Page.Body>
    </>
  )
}

export default AuditTrail
