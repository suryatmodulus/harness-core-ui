import React, { useState } from 'react'
import { Button, ExpandingSearchInput, Layout } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'
import { useGetUserGroupAggregateList } from 'services/cd-ng'
import { useUserGroupModal } from '@rbac/modals/UserGroupModal/useUserGroupModal'
import UserGroupsListView from '@rbac/pages/UserGroups/views/UserGroupsListView'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'

const UserGroupsPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const { getString } = useStrings()
  const [page, setPage] = useState(0)
  const [searchTerm, setsearchTerm] = useState<string>()
  const { data, loading, error, refetch } = useGetUserGroupAggregateList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10,
      searchTerm
    }
  })

  const { openUserGroupModal } = useUserGroupModal({
    onSuccess: () => {
      refetch()
    }
  })

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: () => {
      refetch()
    }
  })

  return (
    <>
      <PageHeader
        title={
          <Layout.Horizontal padding={{ left: 'large' }}>
            <Button
              text={getString('rbac.userGroupPage.newUserGroup')}
              intent="primary"
              icon="plus"
              onClick={() => openUserGroupModal()}
            />
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              placeholder={getString('rbac.userGroupPage.search')}
              onChange={text => {
                setsearchTerm(text.trim())
              }}
            />
          </Layout.Horizontal>
        }
      />
      <Page.Body
        loading={loading}
        error={error?.message}
        retryOnError={() => {
          refetch()
        }}
        noData={
          !searchTerm
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('rbac.userGroupPage.noDataText'),
                buttonText: getString('rbac.userGroupPage.newUserGroup'),
                onClick: () => openUserGroupModal()
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('rbac.userGroupPage.noUserGroups')
              }
        }
      >
        <UserGroupsListView
          data={data}
          openRoleAssignmentModal={openRoleAssignmentModal}
          gotoPage={(pageNumber: number) => setPage(pageNumber)}
          reload={async () => {
            refetch()
          }}
        />
      </Page.Body>
    </>
  )
}

export default UserGroupsPage
