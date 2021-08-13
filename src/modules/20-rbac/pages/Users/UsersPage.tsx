import React, { useState } from 'react'
import { Button, ExpandingSearchInput, Layout } from '@wings-software/uicore'
import cx from 'classnames'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import ActiveUserListView from './views/ActiveUsersListView'
import PendingUserListView from './views/PendingUsersListView'
import css from './UsersPage.module.scss'

enum Views {
  PENDING = 'PENDING'
}

const UsersPage: React.FC = () => {
  const { getString } = useStrings()
  useDocumentTitle(getString('users'))
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const [searchParam, setSearchParam] = useState<string>()
  const { view } = useQueryParams<{ view: string }>()
  const [reload, setReload] = useState<boolean>()
  const history = useHistory()

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: () => {
      setReload(true)
      history.push({
        pathname: routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }),
        search: `view=${Views.PENDING}`
      })
      setReload(false)
    }
  })

  return (
    <>
      <Page.Header
        title={
          <Layout.Horizontal padding={{ left: 'large' }} spacing="small" width={350}>
            <RbacButton
              text={getString('rbac.user')}
              intent="primary"
              icon="plus"
              onClick={() => openRoleAssignmentModal()}
              permission={{
                resource: {
                  resourceType: ResourceType.USER
                },
                permission: PermissionIdentifier.INVITE_USER
              }}
            />
          </Layout.Horizontal>
        }
        content={
          <Layout.Horizontal height="inherit" flex={{ alignItems: 'flex-end' }} spacing="small">
            <Button
              text={getString('rbac.activeUsers')}
              minimal
              className={cx({ [css.selectedTabs]: view != Views.PENDING })}
              intent={view === Views.PENDING ? 'none' : 'primary'}
              onClick={() => history.push(routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }))}
            />
            <Button
              text={getString('rbac.pendingUsers')}
              minimal
              className={cx({ [css.selectedTabs]: view === Views.PENDING })}
              intent={view === Views.PENDING ? 'primary' : 'none'}
              onClick={() =>
                history.push({
                  pathname: routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }),
                  search: `view=${Views.PENDING}`
                })
              }
            />
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge" className={css.toolbar} width={350}>
            <ExpandingSearchInput
              alwaysExpanded
              placeholder={getString('rbac.usersPage.search')}
              onChange={text => {
                setSearchParam(text.trim())
              }}
              width={250}
            />
          </Layout.Horizontal>
        }
      />
      {view == Views.PENDING ? (
        <PendingUserListView reload={reload} searchTerm={searchParam} />
      ) : (
        <ActiveUserListView searchTerm={searchParam} openRoleAssignmentModal={openRoleAssignmentModal} />
      )}
    </>
  )
}

export default UsersPage
