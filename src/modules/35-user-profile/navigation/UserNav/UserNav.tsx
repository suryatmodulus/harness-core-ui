import React from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Button, Text } from '@wings-software/uicore'
import { get } from 'lodash-es'

import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { SidebarLink } from '@common/navigation/SideNav/SideNav'
import { useStrings } from 'framework/exports'
import { useLogout1 } from 'services/portal'
import AppStorage from 'framework/utils/AppStorage'
import { useToaster } from '@common/exports'
import css from './UserNav.module.scss'

export default function UserNav(): React.ReactElement {
  const { accountId } = useParams<AccountPathProps>()
  const { mutate: logout } = useLogout1({
    userId: AppStorage.get('uuid'),
    requestOptions: { headers: { 'content-type': 'application/json' } }
  })
  const { getString } = useStrings()
  const { showError } = useToaster()
  const history = useHistory()

  const signOut = async (): Promise<void> => {
    try {
      await logout()
      AppStorage.clear()
      history.push(routes.toLogin())
    } catch (err) {
      showError(get(err, 'responseMessages[0].message', getString('somethingWentWrong')))
    }
  }

  return (
    <div>
      <SidebarLink exact label={getString('profile')} to={routes.toUserProfile({ accountId })} />
      {/* Enable when Ready */}
      {/* <SidebarLink label={getString('preferences')} to={routes.toUserPreferences({ accountId })} /> */}
      <div className={css.signout}>
        <Button minimal icon="log-out" iconProps={{ size: 20, padding: { right: 'small' } }} onClick={signOut}>
          <Text font={{ size: 'medium', weight: 'semi-bold' }}>{getString('signOut')}</Text>
        </Button>
      </div>
    </div>
  )
}
