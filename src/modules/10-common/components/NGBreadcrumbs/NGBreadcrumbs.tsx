import React from 'react'
import { Breadcrumbs as UiCoreBreadcrumbs, BreadcrumbsProps, Breadcrumb } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ProjectPathProps, SecretsPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { getModuleIcon } from '@common/utils/utils'
import { ModuleName } from 'framework/types/ModuleName'

import paths from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'

export const NGBreadcrumbs: React.FC<BreadcrumbsProps> = ({ links = [], className = '' }) => {
  const { getString } = useStrings()
  const params = useParams<ProjectPathProps & SecretsPathProps & ModulePathParams>()
  const { module, projectIdentifier } = params
  let primaryBreadCrumb: Breadcrumb
  const { selectedProject } = useAppStore()
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
        label = getString('changeVerificationText')
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
    primaryBreadCrumb = {
      label,
      iconProps: { name: getModuleIcon(module.toUpperCase() as ModuleName) },
      url
    }
  } else {
    primaryBreadCrumb = {
      label: getString('account'),
      iconProps: { name: 'cog', color: 'primary7' },
      url: paths.toHome(params)
    }
  }
  return <UiCoreBreadcrumbs links={[primaryBreadCrumb, ...links]} className={className} />
}
