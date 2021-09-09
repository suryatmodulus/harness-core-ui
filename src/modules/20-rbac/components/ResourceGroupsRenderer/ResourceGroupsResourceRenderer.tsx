import React from 'react'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import { PageSpinner } from '@common/components'
import { RenderColumnDetails } from '@rbac/components/ResourceGroupList/ResourceGroupListView'
import { useGetFilterResourceGroupList } from 'services/resourcegroups'
import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import type { ResourceGroupColumn } from './ResourceGroupsResourceModalBody'

const ResourceGroupsResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
  const { data, loading } = useMutateAsGet(useGetFilterResourceGroupList, {
    body: { accountIdentifier, orgIdentifier, projectIdentifier, identifierFilter: identifiers },
    queryParams: {
      pageIndex: 0,
      pageSize: identifiers.length
    }
  })

  const resourceGroups = data?.data?.content?.map(resource => ({
    ...resource,
    identifier: resource.resourceGroup.identifier
  }))

  if (loading) return <PageSpinner />
  return resourceGroups?.length ? (
    <StaticResourceRenderer<ResourceGroupColumn>
      data={resourceGroups}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={[
        {
          Header: '',
          id: 'name',
          accessor: row => row.resourceGroup.name,
          width: '95%',
          Cell: RenderColumnDetails,
          disableSortBy: true
        }
      ]}
    />
  ) : null
}

export default ResourceGroupsResourceRenderer
