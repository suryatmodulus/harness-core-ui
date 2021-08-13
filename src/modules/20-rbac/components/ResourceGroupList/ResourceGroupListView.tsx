import React, { useMemo } from 'react'
import cx from 'classnames'
import type { CellProps, Column, Renderer } from 'react-table'
import ReactTimeago from 'react-timeago'
import { Layout, Text, Color, Button } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { get } from 'lodash-es'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/strings'
import type {
  PageResourceGroupResponse,
  ResourceGroupResponse,
  ResourceSelector,
  StaticResourceSelector
} from 'services/resourcegroups'
import routes from '@common/RouteDefinitions'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { RbacResourceGroupTypes } from '@rbac/constants/utils'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import ResourceGroupColumnMenu from './ResourceGroupColumnMenu'

import css from './ResourceGroupList.module.scss'

interface ResourceGroupListViewProps {
  data?: PageResourceGroupResponse
  reload?: () => Promise<void>
  openResourceGroupModal: () => void
  goToPage: (pageNumber: number) => void
}

const RenderColumnDetails: Renderer<CellProps<ResourceGroupResponse>> = ({ row }) => {
  const data = row.original
  return data?.resourceGroup ? (
    <Layout.Horizontal spacing="small">
      <div style={{ backgroundColor: data?.resourceGroup?.color }} className={cx(css.resourceGroupColor)}></div>
      <Text color={Color.BLACK} lineClamp={1}>
        {data?.resourceGroup?.name}
      </Text>
    </Layout.Horizontal>
  ) : null
}

const RenderColumnLastUpdated: Renderer<CellProps<ResourceGroupResponse>> = ({ row }) => {
  const { getString } = useStrings()
  const data = row?.original
  if (data.harnessManaged) {
    return (
      <Text color={Color.BLACK} lineClamp={1}>
        {getString('rbac.resourceGroup.builtInResourceGroup')}
      </Text>
    )
  }
  return data?.lastModifiedAt ? (
    <Text color={Color.BLACK} lineClamp={1}>
      <ReactTimeago date={data?.lastModifiedAt} />
    </Text>
  ) : null
}

const RenderColumnSummary: Renderer<CellProps<ResourceGroupResponse>> = ({ row, column }) => {
  const { getString } = useStrings()
  const { resourceGroup, harnessManaged } = row.original
  const resourceSelectors = resourceGroup.resourceSelectors
  const resourceTypeName = (resource: ResourceSelector): string => {
    const label = RbacFactory.getResourceTypeHandler(resource?.resourceType)?.label
    if (label) {
      if (get(resource, 'type') === RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR) {
        return getString('rbac.resourceGroup.all', {
          name: getString(label)
        })
      }
      return `${(resource as StaticResourceSelector).identifiers?.length || 0} ${getString(label)}`
    }
    return get(resource, 'type')
  }
  if (harnessManaged) return <Text color={Color.BLACK}>{getString('rbac.allResources')}</Text>
  return resourceSelectors?.length ? (
    <Text
      color={Color.BLACK}
      lineClamp={1}
      onClick={() => {
        ;(column as any).openResourceSelector(resourceGroup.identifier)
      }}
    >
      {/* TODO: replace with the summary data  with resource number*/}
      {resourceSelectors.map(ele => resourceTypeName(ele)).join(', ')}
    </Text>
  ) : (
    <Button
      minimal
      className={css.selectResource}
      intent="primary"
      onClick={e => {
        e.stopPropagation()
        ;(column as any).openResourceSelector(resourceGroup.identifier)
      }}
    >
      {getString('selectResource')}
    </Button>
  )
}
const ResourceGroupListView: React.FC<ResourceGroupListViewProps> = props => {
  const { data, reload, openResourceGroupModal, goToPage } = props
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<ProjectPathProps & ModulePathParams>()
  const listData: ResourceGroupResponse[] = data?.content || []
  const { getString } = useStrings()
  const history = useHistory()
  const openResourceSelector = (resourceGroupIdentifier: string): void => {
    history.push(
      routes.toResourceGroupDetails({
        resourceGroupIdentifier: resourceGroupIdentifier || '',
        accountId,
        orgIdentifier,
        projectIdentifier,
        module
      })
    )
  }
  const columns: Column<ResourceGroupResponse>[] = useMemo(
    () => [
      {
        Header: getString('rbac.resourceGroup.resourceGroupColumn'),
        accessor: row => row?.resourceGroup?.name,
        id: 'name',
        width: '32%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('rbac.resourceGroup.summary'),
        accessor: row => row?.resourceGroup?.resourceSelectors,
        id: 'summary',
        width: '32%',
        Cell: RenderColumnSummary,
        openResourceSelector
      },
      {
        Header: getString('lastUpdated'),
        accessor: row => row?.lastModifiedAt,
        id: 'lastUpdated',
        width: '32%',
        Cell: RenderColumnLastUpdated
      },
      {
        Header: '',
        accessor: row => row?.resourceGroup?.identifier,
        width: '4%',
        id: 'action',
        Cell: ResourceGroupColumnMenu,
        disableSortBy: true,
        reload: reload,
        openResourceGroupModal
      }
    ],
    [props.data]
  )
  return listData.length ? (
    <Table<ResourceGroupResponse>
      className={css.tablePadding}
      columns={columns}
      data={listData}
      onRowClick={rowDetails => {
        if (!rowDetails.harnessManaged) openResourceSelector(get(rowDetails, 'resourceGroup.identifier', ''))
      }}
      pagination={{
        itemCount: data?.totalItems || 0,
        pageSize: data?.pageSize || 10,
        pageCount: data?.totalPages || -1,
        pageIndex: data?.pageIndex || 0,
        gotoPage: goToPage
      }}
    />
  ) : (
    <NoDataCard icon="resources-icon" message={getString('rbac.resourceGroup.noResourceGroup')}></NoDataCard>
  )
}

export default ResourceGroupListView
