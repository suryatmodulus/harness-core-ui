import React from 'react'
import { TableV2, Text, Layout, Avatar, Icon, Container, Color } from '@wings-software/uicore'
import type { Column, Renderer, CellProps } from 'react-table'
import { Link } from 'react-router-dom'
import { actionToLabelMap } from '@audit-trail/utils/RequestUtil'
import type { AuditEventDTO, PageAuditEventDTO } from 'services/audit'
import { useStrings } from 'framework/strings'
import { getReadableDateTime } from '@common/utils/dateUtils'
import AuditTrailFactory, { getModuleNameFromAuditModule } from '@audit-trail/factories/AuditTrailFactory'
import css from './AuditTrailsListView.module.scss'

const DEFAULT_CELL_PLACEHOLDER = 'N/A'
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
    <Layout.Horizontal padding={{ right: 'xlarge' }} flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar className={css.avatar} name={row.original.authenticationInfo.principal.identifier} hoverCard={false} />
      <Text lineClamp={1}>{labels?.username || principal.identifier}</Text>
    </Layout.Horizontal>
  )
}

const renderColumnOrganization: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Text padding={{ right: 'xlarge' }} lineClamp={1}>
      {row.original.resourceScope.orgIdentifier || DEFAULT_CELL_PLACEHOLDER}
    </Text>
  )
}

const renderColumnProject: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Text padding={{ right: 'xlarge' }} lineClamp={1}>
      {row.original?.resourceScope?.projectIdentifier || DEFAULT_CELL_PLACEHOLDER}
    </Text>
  )
}

const renderColumnModule: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  const { moduleIcon } = AuditTrailFactory.getResourceHandler(row.original.resource.type) || {}
  // Changing the color
  const navSettingsIcon = moduleIcon?.name === 'nav-settings'
  return moduleIcon?.name ? (
    <Container flex={{ justifyContent: 'center' }}>
      <Icon
        className={navSettingsIcon ? css.navSettingIcon : undefined}
        name={moduleIcon.name}
        size={moduleIcon.size || 30}
      />
    </Container>
  ) : (
    ''
  )
}

const AuditTrailsListView: React.FC<AuditTrailsListViewProps> = ({ data, setPage }) => {
  const { getString } = useStrings()

  const renderColumnResource: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    const { resourceScope, resource, module } = row.original
    const { accountIdentifier } = resourceScope

    const url = accountIdentifier
      ? AuditTrailFactory.getResourceHandler(resource.type)?.resourceUrl?.(
          row.original.resource,
          {
            ...resourceScope,
            accountIdentifier: accountIdentifier
          },
          getModuleNameFromAuditModule(module)
        )
      : undefined

    return (
      <Layout.Vertical padding={{ right: 'xlarge' }}>
        {url ? (
          <Link className={css.resourceLink} to={url}>
            <Text lineClamp={1}>{resource.labels?.resourceName || resource.identifier}</Text>
          </Link>
        ) : (
          <Text lineClamp={1}>{resource.labels?.resourceName || resource.identifier}</Text>
        )}
        <Text padding={{ top: 'xsmall' }} lineClamp={1}>{`${getString('typeLabel')}: ${
          row.original.resource.type
        }`}</Text>
      </Layout.Vertical>
    )
  }

  const renderColumnAction: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
    return (
      <Layout.Horizontal padding={{ right: 'xlarge' }}>
        <Text lineClamp={1}>{getString(actionToLabelMap[row.original.action])}</Text>
      </Layout.Horizontal>
    )
  }

  const columns: Column<AuditEventDTO>[] = [
    {
      Header: getString('common.timePstLabel'),
      id: 'time',
      width: '10%',
      accessor: row => row.timestamp,
      Cell: renderColumnTimeStamp
    },
    {
      Header: getString('common.userLabel'),
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
      Header: getString('common.resourceLabel'),
      id: 'resource',
      width: '18%',
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
      Header: (
        <Text color={Color.GREY_900} flex={{ justifyContent: 'center' }}>
          {getString('common.moduleLabel')}
        </Text>
      ),
      id: 'module',
      width: '12%',
      accessor: row => row.timestamp,
      Cell: renderColumnModule
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
    </>
  )
}

export default AuditTrailsListView
