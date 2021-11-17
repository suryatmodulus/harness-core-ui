import React from 'react'
import { Breadcrumbs as UiCoreBreadcrumbs, BreadcrumbsProps, Breadcrumb } from '@wings-software/uicore'
import { defaults } from 'lodash-es'
import { useLocation, useParams } from 'react-router-dom'

import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ProjectPathProps, SecretsPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { getModuleIcon } from '@common/utils/utils'
import { ModuleName } from 'framework/types/ModuleName'

import paths from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'

export interface NGBreadcrumbsProps extends BreadcrumbsProps {
  orgBreadCrumbOptional: boolean
  customPathParams?: Partial<ProjectPathProps & SecretsPathProps & ModulePathParams>
}
export const NGBreadcrumbs: React.FC<Partial<NGBreadcrumbsProps>> = ({
  links = [],
  className = '',
  orgBreadCrumbOptional = false,
  customPathParams = {}
}) => {
  const { getString } = useStrings()
  const originalParams = useParams<ProjectPathProps & SecretsPathProps & ModulePathParams>()
  const params = defaults(customPathParams, originalParams)
  const { module, projectIdentifier, orgIdentifier } = params
  const { selectedProject, selectedOrg } = useAppStore()
  const { pathname } = useLocation()
  let moduleBreadCrumb: Breadcrumb = {
    label: getString('common.accountSettings'),
    iconProps: { name: 'cog', color: 'primary7' },
    url: paths.toAccountSettings(params)
  }

  const isHome = pathname.indexOf(paths.toHome({ accountId: params.accountId })) !== -1
  const isDashBoards = pathname.indexOf(paths.toCustomDashboard({ accountId: params.accountId })) !== -1

  if (isHome) {
    moduleBreadCrumb = {
      label: getString('common.home'),
      iconProps: { name: 'harness', color: 'primary7' },
      url: paths.toHome(params)
    }
  } else if (isDashBoards) {
    moduleBreadCrumb = {
      label: getString('common.dashboards'),
      iconProps: { name: 'dashboard', color: 'primary7' },
      url: paths.toCustomDashboard(params)
    }
  }

  if (module) {
    let url = paths.toHome(params)
    let label = getString('common.home')
    switch (module.toUpperCase() as ModuleName) {
      case ModuleName.CD:
        url = paths.toCD(params)
        label = getString('deploymentsText')
        break
      case ModuleName.CV:
        url = paths.toCV(params)
        label = getString('common.changeIntelligence')
        break
      case ModuleName.CI:
        url = paths.toCI(params)
        label = getString('buildsText')
        break
      case ModuleName.CE:
        url = paths.toCE(params)
        label = getString('cloudCostsText')
        break
      case ModuleName.CF:
        url = paths.toCF(params)
        label = getString('featureFlagsText')
        break
    }
    if (projectIdentifier) {
      // falling back to projectidentifier  from url if selected project in appstore does not match with project identifier in url
      label =
        selectedProject?.name && projectIdentifier === selectedProject?.identifier
          ? selectedProject.name
          : projectIdentifier
    }
    moduleBreadCrumb = {
      label,
      iconProps: { name: getModuleIcon(module.toUpperCase() as ModuleName) },
      url
    }
  }
  const breadCrumbsList = [moduleBreadCrumb]
  // display org breadcrumb only in org scope and not in project scope (project scope will also have org scope nested in it)
  if (orgIdentifier && !projectIdentifier && !orgBreadCrumbOptional) {
    const orgBreadCrumb = {
      label: selectedOrg?.name && orgIdentifier === selectedOrg?.identifier ? selectedOrg.name : orgIdentifier,
      url: paths.toOrganizationDetails(params)
    }
    breadCrumbsList.push(orgBreadCrumb)
  }
  breadCrumbsList.push(...links)
  return <UiCoreBreadcrumbs links={breadCrumbsList} className={className} />
}
