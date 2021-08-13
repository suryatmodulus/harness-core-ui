import React from 'react'
import { Color, Container, Layout, Text, Icon } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import { useParams, Link } from 'react-router-dom'
import { useGet } from 'restful-react'
import ResourceHandlerTable from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'

import { PageSpinner } from '@common/components'

import routes from '@common/RouteDefinitions'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'

import { useStrings } from 'framework/strings'

import css from './DashboardResourceModalBody.module.scss'

interface FolderList {
  id: string
  identifier: string
  name: string
  Children: { id: string; name: string }[]
}

export const RenderColumnSecret: Renderer<CellProps<FolderList>> = ({ row }) => {
  const data = row.original
  const { accountId } = useParams<{ accountId: string }>()

  return (
    <Layout.Vertical>
      <Text color={Color.BLACK} lineClamp={1}>
        {data.name} ({data.Children.length}){'  '}
        <Link
          target="_blank"
          to={routes.toCustomDashboardHome({
            folderId: data.identifier,
            accountId: accountId
          })}
        >
          <Icon name="main-share" color={Color.GREY_600} />
        </Link>
      </Text>
      <Layout.Horizontal spacing="medium">
        {data.Children.map((dashboards: { id: string; name: string }) => {
          return (
            <Layout.Horizontal className={css.dashboardDetail} key={dashboards?.name + '_' + dashboards?.id}>
              {dashboards.name}{' '}
              <Link
                target="_blank"
                to={routes.toViewCustomDashboard({
                  viewId: dashboards.id,
                  accountId: accountId,
                  folderId: data.identifier
                })}
              >
                <Icon name="main-share" color={Color.GREY_600} />
              </Link>
            </Layout.Horizontal>
          )
        })}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const DashboardResourceModalBody: React.FC<RbacResourceModalProps> = ({
  // searchTerm,
  onSelectChange,
  selectedData,
  resourceScope
}) => {
  const { accountIdentifier } = resourceScope

  const [page, setPage] = React.useState(0)
  const { getString } = useStrings()

  const { data: folders, loading: fethingFolders } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'dashboard/folder',
    queryParams: { accountId: accountIdentifier, page: page + 1, pageSize: 10, isAdmin: true }
  })

  const totalFolders: number = folders?.total

  const parsedFolders = folders?.resource?.map((folder: { id?: string; name: string; identifier?: string }) => ({
    identifier: folder['id'],
    ...folder
  }))

  if (fethingFolders) return <PageSpinner />
  return parsedFolders?.length > 0 ? (
    <Container className={css.container}>
      <ResourceHandlerTable
        data={parsedFolders}
        selectedData={selectedData}
        columns={[
          {
            id: 'name',
            accessor: 'name',
            width: '95%',
            Cell: RenderColumnSecret,
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: totalFolders || 10,
          pageSize: 10,
          pageCount: totalFolders >= 10 ? Math.round(totalFolders / 10) : 10,
          pageIndex: page || 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default DashboardResourceModalBody
