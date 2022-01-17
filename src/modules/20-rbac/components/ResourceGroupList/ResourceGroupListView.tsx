/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import cx from 'classnames'
import type { CellProps, Column, Renderer } from 'react-table'
import ReactTimeago from 'react-timeago'
import { Layout, Text, Color, Button, ButtonVariation, NoDataCard, TableV2 } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { get } from 'lodash-es'
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
import { isDynamicResourceSelector } from '@rbac/utils/utils'
import ResourceGroupColumnMenu from './ResourceGroupColumnMenu'
import css from './ResourceGroupList.module.scss'

interface ResourceGroupListViewProps {
  data?: PageResourceGroupResponse
  reload?: () => Promise<void>
  openResourceGroupModal: () => void
  goToPage: (pageNumber: number) => void
}

export const RenderColumnDetails: Renderer<CellProps<ResourceGroupResponse>> = ({ row }) => {
  const data = row.original.resourceGroup
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <div style={{ backgroundColor: data.color }} className={cx(css.resourceGroupColor)}></div>
      <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
        <Text color={Color.BLACK} lineClamp={1}>
          {data.name}
        </Text>
        <Text color={Color.GREY_600} lineClamp={1} font="small">
          {getString('idLabel', { id: data.identifier })}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export const RenderColumnLastUpdated: Renderer<CellProps<ResourceGroupResponse>> = ({ row }) => {
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
      if (isDynamicResourceSelector(get(resource, 'type'))) {
        return getString('rbac.resourceGroup.all', {
          name: getString(label)
        })
      }
      return `${(resource as StaticResourceSelector).identifiers?.length || 0} ${getString(label)}`
    }
    return get(resource, 'type')
  }
  if (harnessManaged) {
    return <Text color={Color.BLACK}>{resourceGroup.name}</Text>
  }
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
      variation={ButtonVariation.LINK}
      className={css.selectResource}
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
        Header: getString('common.resourceGroupLabel'),
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
    <TableV2<ResourceGroupResponse>
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
