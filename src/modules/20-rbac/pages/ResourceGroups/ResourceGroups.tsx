import React, { useState } from 'react'
import { Layout, Button, ExpandingSearchInput, Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import { useResourceGroupModal } from '@rbac/modals/ResourceGroupModal/useResourceGroupModal'
import { useGetResourceGroupList } from 'services/cd-ng'
import ResourceGroupListView from '@rbac/components/ResourceGroupList/ResourceGroupListView'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

const ResourceGroups: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
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
  const { openResourceGroupModal } = useResourceGroupModal({ onSuccess: refetch })

  return (
    <>
      <PageHeader
        title={
          <Layout.Horizontal padding={{ left: 'large' }}>
            <Button
              text={getString('resourceGroup.newResourceGroup')}
              intent="primary"
              icon="plus"
              onClick={() => openResourceGroupModal()}
              data-testid="addNewResourceGroup"
            />
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              placeholder={getString('rbac.usersPage.search')}
              onChange={e => {
                setSearchTerm(e.trim())
              }}
            />
          </Layout.Horizontal>
        }
      />
      <PageBody loading={loading} retryOnError={() => refetch()} error={(error?.data as Error)?.message}>
        <Container padding="xlarge">
          <ResourceGroupListView
            data={data?.data}
            reload={refetch}
            openResourceGroupModal={openResourceGroupModal}
            goToPage={(pageNumber: number) => setPage(pageNumber)}
          />
        </Container>
      </PageBody>
    </>
  )
}

export default ResourceGroups
