import React, { useState } from 'react'
import { Button, ExpandingSearchInput, Layout } from '@wings-software/uicore'

import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import { Page } from '@common/exports'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import ActiveUserListView from './views/ActiveUsersListView'
import PendingUserListView from './views/PendingUsersListView'
import css from './UsersPage.module.scss'

enum Views {
  PENDING = 'PENDING'
}

const UsersPage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams()
  const [searchParam, setSearchParam] = useState<string>()
  const { view } = useQueryParams()
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
          <Layout.Horizontal padding={{ left: 'large' }} spacing="small">
            <Button
              text={getString('newUser')}
              intent="primary"
              icon="plus"
              onClick={() => openRoleAssignmentModal()}
            />
          </Layout.Horizontal>
        }
        content={
          <Layout.Horizontal height="inherit" flex={{ alignItems: 'flex-end' }} spacing="small" className={css.tabs}>
            <Button
              text={getString('rbac.activeUsers')}
              minimal
              intent={view === Views.PENDING ? 'none' : 'primary'}
              onClick={() => history.push(routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }))}
            />
            <Button
              text={getString('rbac.pendingUsers')}
              minimal
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
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge" className={css.toolbar}>
            <ExpandingSearchInput
              placeholder={getString('rbac.usersPage.search')}
              onChange={text => {
                setSearchParam(text.trim())
              }}
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
