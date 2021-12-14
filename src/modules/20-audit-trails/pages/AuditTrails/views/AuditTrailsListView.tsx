import React, { useState } from 'react'
import { TableV2, Text, Layout, Avatar, Icon, Container, Color } from '@wings-software/uicore'
import type { Column, Renderer, CellProps } from 'react-table'
import type { AuditEventDTO, PageAuditEventDTO } from 'services/audit'
import { useStrings } from 'framework/strings'
import { getReadableDateTime } from '@common/utils/dateUtils'
import AuditTrailFactory from '@audit-trails/factories/AuditTrailFactory'
import EventSummary from '@audit-trails/components/EventSummary/EventSummary'
import { actionToLabelMap } from '@audit-trails/utils/RequestUtil'
import css from './AuditTrailsListView.module.scss'

interface AuditTrailsListViewProps {
  data: PageAuditEventDTO
  setPage: (page: number) => void
}

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
  const { labels, principal } = row.original.authenticationInfo
  return (
    <Layout.Horizontal padding={{ right: 'medium' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar name={row.original.authenticationInfo.principal.identifier} hoverCard={false} />
      <Text lineClamp={1}>{labels?.username || principal.identifier}</Text>
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
  const { icon } = AuditTrailFactory.getModuleProperties(row.original.module) || {}
  return icon?.iconName ? (
    <Container flex={{ justifyContent: 'center' }}>
      <Icon name={icon.iconName} size={icon.size} />
    </Container>
  ) : (
    ''
  )
}

const AuditTrailsListView: React.FC<AuditTrailsListViewProps> = ({ data, setPage }) => {
  const { getString } = useStrings()
  const [selectedAuditRow, setSelectedAuditRow] = useState<AuditEventDTO | undefined>(undefined)

  const renderColumnAction: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    // format action and render icon, mapping is missing.
    return (
      <Layout.Horizontal padding={{ right: 'medium' }}>
        <Text lineClamp={1}>{getString(actionToLabelMap[row.original.action])}</Text>
      </Layout.Horizontal>
    )
  }

  const renderNotesColumn: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    return (
      <Container flex={{ justifyContent: 'center' }}>
        <Icon
          name="main-notes"
          className={css.notesIcon}
          size={20}
          onClick={() => {
            setSelectedAuditRow(row.original)
          }}
        />
      </Container>
    )
  }

  const columns: Column<AuditEventDTO>[] = [
    {
      Header: getString('timePst'),
      id: 'time',
      width: '10%',
      accessor: row => row.timestamp,
      Cell: renderColumnTimeStamp
    },
    {
      Header: getString('common.user'),
      id: 'user',
      width: '15%',
      accessor: row => row.timestamp,
      Cell: renderColumnUser
    },
    {
      Header: getString('action'),
      id: 'action',
      width: '15%',
      accessor: row => row.timestamp,
      Cell: renderColumnAction
    },
    {
      Header: getString('common.resource'),
      id: 'resource',
      width: '15%',
      accessor: row => row.timestamp,
      Cell: renderColumnResource
    },
    {
      Header: getString('orgLabel'),
      id: 'organization',
      width: '13%',
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
      Header: (
        <Text color={Color.GREY_900} flex={{ justifyContent: 'center' }}>
          {getString('module')}
        </Text>
      ),
      id: 'module',
      width: '12%',
      accessor: row => row.timestamp,
      Cell: renderColumnModule
    },
    {
      Header: '',
      id: 'yaml',
      width: '5%',
      accessor: row => row.timestamp,
      Cell: renderNotesColumn
    }
  ]
  return (
    <>
      <TableV2<AuditEventDTO>
        data={data.content || []}
        columns={columns}
        className={css.table}
        pagination={{
          itemCount: data?.totalItems || 0,
          pageSize: data?.pageSize || 10,
          pageCount: data?.totalPages || 0,
          pageIndex: data?.pageIndex || 0,
          gotoPage: setPage,
          className: css.pagination
        }}
      />
      {selectedAuditRow && (
        <EventSummary
          onClose={() => {
            setSelectedAuditRow(undefined)
          }}
          auditData={selectedAuditRow}
        />
      )}
    </>
  )
}

export default AuditTrailsListView
