import React, { useEffect, useState } from 'react'
import { Container, ExpandingSearchInput, Layout, Pagination } from '@wings-software/uicore'

import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { PageHeader } from '@common/components/Page/PageHeader'
import { PageBody } from '@common/components/Page/PageBody'
import { Role, RoleResponse, useGetRoleList } from 'services/rbac'
import RoleCard from '@rbac/components/RoleCard/RoleCard'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useRoleModal } from '@rbac/modals/RoleModal/useRoleModal'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import routes from '@common/RouteDefinitions'
import css from './Roles.module.scss'

const Roles: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const history = useHistory()
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

  useEffect(() => {
    if (searchTerm) setPage(0)
  }, [searchTerm])

  const { openRoleModal } = useRoleModal({
    onSuccess: role => {
      history.push(
        routes.toRoleDetails({
          accountId,
          orgIdentifier,
          projectIdentifier,
          module,
          roleIdentifier: role.identifier
        })
      )
    }
  })

  const editRoleModal = (role: Role): void => {
    openRoleModal(role)
  }

  const newRoleButton = (): JSX.Element => (
    <RbacButton
      text={getString('newRole')}
      data-testid="createRole"
      intent="primary"
      icon="plus"
      onClick={() => openRoleModal()}
      permission={{
        permission: PermissionIdentifier.UPDATE_ROLE,
        resource: {
          resourceType: ResourceType.ROLE
        },
        resourceScope: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
      }}
    />
  )

  return (
    <>
      <PageHeader
        title={<Layout.Horizontal padding={{ left: 'large' }}>{newRoleButton()}</Layout.Horizontal>}
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
                button: newRoleButton()
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
