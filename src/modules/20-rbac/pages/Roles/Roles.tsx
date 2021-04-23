import React, { useState } from 'react'
import { Button, Container, ExpandingSearchInput, Layout, Pagination } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import { Role, RoleResponse, useGetRoleList } from 'services/rbac'
import RoleCard from '@rbac/components/RoleCard/RoleCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useRoleModal } from '@rbac/modals/RoleModal/useRoleModal'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import css from './Roles.module.scss'

const Roles: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  useDocumentTitle(getString('roles'))
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState<string>()
  const { data, loading, error, refetch } = useGetRoleList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pageIndex: page,
      pageSize: 10,
      searchTerm
    }
  })

  const { openRoleModal } = useRoleModal({ onSuccess: refetch })

  const editRoleModal = (role: Role): void => {
    openRoleModal(role)
  }

  return (
    <>
      <PageHeader
        title={
          <Layout.Horizontal padding={{ left: 'large' }}>
            <Button
              text={getString('newRole')}
              data-testid="createRole"
              intent="primary"
              icon="plus"
              onClick={() => openRoleModal()}
            />
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              placeholder={getString('rbac.usersPage.search')}
              onChange={text => {
                setSearchTerm(text.trim())
              }}
            />
          </Layout.Horizontal>
        }
      />
      <PageBody
        loading={loading}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={
          !searchTerm
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('roleDetails.noDataText'),
                buttonText: getString('newRole'),
                onClick: () => openRoleModal()
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('noRoles')
              }
        }
        className={css.pageContainer}
      >
        <Container className={css.masonry}>
          <Layout.Masonry
            center
            gutter={40}
            className={css.centerContainer}
            items={data?.data?.content || []}
            renderItem={(roleResponse: RoleResponse) => (
              <RoleCard data={roleResponse} reloadRoles={refetch} editRoleModal={editRoleModal} />
            )}
            keyOf={(roleResponse: RoleResponse) => roleResponse.role.identifier}
          />
        </Container>
        <Container className={css.pagination}>
          <Pagination
            itemCount={data?.data?.totalItems || 0}
            pageSize={data?.data?.pageSize || 10}
            pageCount={data?.data?.totalPages || 0}
            pageIndex={data?.data?.pageIndex || 0}
            gotoPage={(pageNumber: number) => setPage(pageNumber)}
          />
        </Container>
      </PageBody>
    </>
  )
}

export default Roles
