import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, Text } from '@wings-software/uicore'

import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/exports'
import { signOut } from '@common/utils/SignOut'
import css from './UserNav.module.scss'

export default function UserNav(): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  return (
    <div>
      <SidebarLink exact label={getString('profile')} to={routes.toUserProfile({ accountId })} />
      <SidebarLink label={getString('preferences')} to={routes.toUserPreferences({ accountId })} />
      <div className={css.signout}>
        <Button minimal icon="log-out" iconProps={{ size: 20, padding: { right: 'medium' } }} onClick={signOut}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{getString('signOut')}</Text>
        </Button>
      </div>
    </div>
  )
}
