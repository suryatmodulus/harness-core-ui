import type { Project, ModuleLicenseDTO } from 'services/cd-ng'
import { isCDCommunity } from 'framework/LicenseStore/LicenseStoreContext'
import routes from '@common/RouteDefinitions'
import { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import type { Module } from '@common/interfaces/RouteInterfaces'

interface ProjectCreateSuccessHandlerProps {
  project?: Project
  licenseInformation:
    | Record<string, undefined>
    | {
        [key: string]: ModuleLicenseDTO
      }
    | undefined
  experience?: ModuleLicenseType
  pushToPipelineStudio: (pipelinId: string, projectData?: Project, search?: string) => void
  push: (path: string) => void
  accountId: string
  module: Module
}

export function handleProjectCreateSuccess({
  project,
  licenseInformation,
  experience,
  pushToPipelineStudio,
  push,
  accountId,
  module
}: ProjectCreateSuccessHandlerProps): void {
  if (isCDCommunity(licenseInformation) && experience === ModuleLicenseType.COMMUNITY) {
    pushToPipelineStudio('-1', project, `?modal=${experience}`)
    return
  }

  if (project) {
    push(
      routes.toProjectOverview({
        projectIdentifier: project.identifier,
        orgIdentifier: project.orgIdentifier || /* istanbul ignore next */ '',
        accountId,
        module
      })
    )
  }
}
