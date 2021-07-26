import React, { useEffect, useState } from 'react'
import { Layout, ExpandingSearchInput } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import { useResourceGroupModal } from '@rbac/modals/ResourceGroupModal/useResourceGroupModal'
import { useGetResourceGroupList } from 'services/resourcegroups'
import ResourceGroupListView from '@rbac/components/ResourceGroupList/ResourceGroupListView'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import routes from '@common/RouteDefinitions'

const ResourceGroups: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const history = useHistory()
  useDocumentTitle(getString('resourceGroups'))
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const defaultQueryParams = {
    pageIndex: page,
    pageSize: 10,
    projectIdentifier,
    orgIdentifier,
    searchTerm,
    accountIdentifier: accountId
  }
  const { data, loading, error, refetch } = useGetResourceGroupList({
    queryParams: {
      ...defaultQueryParams
    }
  })

  useEffect(() => {
    if (searchTerm) setPage(0)
  }, [searchTerm])

  const { openResourceGroupModal } = useResourceGroupModal({
    onSuccess: resourceGroup => {
      history.push(
        routes.toResourceGroupDetails({
          accountId,
          orgIdentifier,
          projectIdentifier,
          module,
          resourceGroupIdentifier: resourceGroup.identifier
        })
      )
    }
  })

  return (
    <>
      <PageHeader
        title={
          <Layout.Horizontal padding={{ left: 'large' }}>
            <RbacButton
              text={getString('rbac.resourceGroup.newResourceGroup')}
              intent="primary"
              icon="plus"
              onClick={() => openResourceGroupModal()}
              data-testid="addNewResourceGroup"
              permission={{
                permission: PermissionIdentifier.UPDATE_RESOURCEGROUP,
                resource: {
                  resourceType: ResourceType.RESOURCEGROUP
                },
                resourceScope: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                }
              }}
            />
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              flip
              placeholder={getString('rbac.usersPage.search')}
              onChange={e => {
                setSearchTerm(e.trim())
              }}
              width={350}
            />
          </Layout.Horizontal>
        }
      />
      <PageBody loading={loading} retryOnError={() => refetch()} error={(error?.data as Error)?.message}>
        <ResourceGroupListView
          data={data?.data}
          reload={refetch}
          openResourceGroupModal={openResourceGroupModal}
          goToPage={(pageNumber: number) => setPage(pageNumber)}
        />
      </PageBody>
    </>
  )
}

export default ResourceGroups
