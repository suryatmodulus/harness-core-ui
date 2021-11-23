import React, { useEffect } from 'react'
import { Route, useHistory, useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import type { GovernancePathProps } from '@common/interfaces/RouteInterfaces'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { GovernanceRemoteComponentMounter } from './GovernanceApp'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

const RedirectToDefaultGovernanceRoute: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<GovernancePathProps>()
  const history = useHistory()

  useEffect(() => {
    history.replace(routes.toGovernancePolicyDashboard({ accountId, orgIdentifier, projectIdentifier, module }))
  }, [history, accountId, orgIdentifier, projectIdentifier, module])

  return null
}

//
// This function constructs Governance Routes based on context. Governance can be mounted in three
// places: Account Settings, Project Detail, and Org Detail. Depends on pathProps of where this module
// is mounted, this function will generate proper Governance routes.
//
export const GovernanceRouteDestinations: React.FC<{
  sidebarProps: SidebarContext
  pathProps: GovernancePathProps
}> = ({ sidebarProps, pathProps }) => {
  return (
    <Route path={routes.toGovernance(pathProps)}>
      <Route path={routes.toGovernance(pathProps)} exact>
        <RedirectToDefaultGovernanceRoute />
      </Route>
      <RouteWithLayout path={routes.toGovernance(pathProps)} sidebarProps={sidebarProps}>
        <GovernanceRemoteComponentMounter
          spinner={
            <Container
              style={{
                position: 'fixed',
                top: 0,
                left: '290px',
                width: 'calc(100% - 290px)',
                height: `100%`
              }}
            >
              <ContainerSpinner />
            </Container>
          }
        />
      </RouteWithLayout>
    </Route>
  )
}

export default <>{GovernanceRouteDestinations({ sidebarProps: AccountSideNavProps, pathProps: accountPathProps })}</>
