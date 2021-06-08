import React from 'react'
import { useParams, Redirect } from 'react-router-dom'

import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

import UserProfilePage from '@user-profile/pages/UserProfile/UserProfilePage'
import UserPreferencesPage from '@user-profile/pages/UserPreferences/UserPreferences'
import UserNav from '@user-profile/navigation/UserNav/UserNav'
import { UserInsights } from './pages/UserInsights/UserInsights'

const RedirectToUserHome = (): React.ReactElement => {
  const params = useParams<AccountPathProps>()
  return <Redirect to={routes.toUserProfile(params)} />
}

const UserProfileSideNavProps: SidebarContext = {
  navComponent: UserNav
}

export default (
  <>
    <RouteWithLayout sidebarProps={UserProfileSideNavProps} path={routes.toUser({ ...accountPathProps })} exact>
      <RedirectToUserHome />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={UserProfileSideNavProps} path={routes.toUserProfile({ ...accountPathProps })} exact>
      <UserProfilePage />
    </RouteWithLayout>
    <RouteWithLayout sidebarProps={UserProfileSideNavProps} path={routes.toUserInsights({ ...accountPathProps })} exact>
      <UserInsights />
    </RouteWithLayout>
    <RouteWithLayout
      sidebarProps={UserProfileSideNavProps}
      path={routes.toUserPreferences({ ...accountPathProps })}
      exact
    >
      <UserPreferencesPage />
    </RouteWithLayout>
  </>
)
