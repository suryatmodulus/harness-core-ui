import React, { useEffect } from 'react'
import { Route, useHistory, useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { RouteWithLayout } from '@common/router'
import type { SidebarContext } from '@common/navigation/SidebarProvider'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import type { GovernancePathProps } from '@common/interfaces/RouteInterfaces'
import { String } from 'framework/strings'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceCategory, ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { GovernanceRemoteComponentMounter } from './GovernanceApp'

export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}

RbacFactory.registerResourceTypeHandler(ResourceType.GOVERNANCE, {
  icon: 'nav-settings',
  label: 'common.governance',
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  permissionLabels: {
    [PermissionIdentifier.GOV_VIEW_POLICY]: <String stringID="rbac.permissionLabels.access" />,
    [PermissionIdentifier.GOV_EDIT_POLICY]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.GOV_DELETE_POLICY]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.GOV_VIEW_POLICYSET]: <String stringID="rbac.permissionLabels.access" />,
    [PermissionIdentifier.GOV_EDIT_POLICYSET]: <String stringID="rbac.permissionLabels.createEdit" />,
    [PermissionIdentifier.GOV_DELETE_POLICYSET]: <String stringID="rbac.permissionLabels.delete" />,
    [PermissionIdentifier.GOV_EVALUATE_POLICYSET]: <String stringID="rbac.permissionLabels.evaluate" />
  }
})

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
