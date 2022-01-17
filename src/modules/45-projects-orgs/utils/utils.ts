/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import { getScopeFromDTO, ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import routes from '@common/RouteDefinitions'
import type { StringKeys, StringsMap } from 'framework/strings/StringsContext'
import { ModuleName } from 'framework/types/ModuleName'

interface RoleOption extends SelectOption {
  managed: boolean
}

interface ScopedDTO {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export const getModuleTitle = (module: ModuleName): keyof StringsMap => {
  switch (module) {
    case ModuleName.CV:
      return 'projectsOrgs.purposeList.change'
    case ModuleName.CE:
      return 'common.purpose.ce.cloudCost'
    case ModuleName.CF:
      return 'common.purpose.cf.feature'
    case ModuleName.CD:
    case ModuleName.CI:
    default:
      return 'projectsOrgs.purposeList.continuous'
  }
}

export const getModulePurpose = (module: ModuleName): keyof StringsMap | undefined => {
  switch (module) {
    case ModuleName.CD:
      return 'common.purpose.cd.delivery'
    case ModuleName.CV:
      return 'common.purpose.cv.intelligence'
    case ModuleName.CI:
      return 'common.purpose.ci.integration'
    case ModuleName.CE:
      return 'common.purpose.ce.management'
    case ModuleName.CF:
      return 'common.purpose.cf.flags'
  }
}
export const getModuleDescriptionsForModuleSelectionDialog = (module: ModuleName): keyof StringsMap | undefined => {
  switch (module) {
    case ModuleName.CD:
      return 'common.selectAVersion.description'
    case ModuleName.CV:
      return 'common.purpose.cv.moduleSelectionSubHeading'
    case ModuleName.CI:
      return 'common.purpose.ci.descriptionOnly'
    case ModuleName.CE:
      return 'common.purpose.ce.moduleSelectionSubHeading'
    case ModuleName.CF:
      return 'common.purpose.cf.moduleSelectionSubHeading'
  }
}
export const getModuleDescription = (module: ModuleName): StringKeys => {
  switch (module) {
    case ModuleName.CD:
      return 'projectsOrgs.purposeList.descriptionCD'
    case ModuleName.CV:
      return 'projectsOrgs.purposeList.descriptionCV'
    case ModuleName.CI:
      return 'projectsOrgs.purposeList.descriptionCI'
    case ModuleName.CE:
      return 'projectsOrgs.purposeList.descriptionCE'
    case ModuleName.CF:
      return 'projectsOrgs.purposeList.descriptionCF'
  }
  return 'projectsOrgs.blank'
}

export const getDefaultRole = (scope: ScopedObjectDTO, getString: (key: keyof StringsMap) => string): RoleOption => {
  if (getScopeFromDTO(scope) === Scope.PROJECT) {
    return { label: getString('common.projectViewer'), value: '_project_viewer', managed: true }
  }
  if (getScopeFromDTO(scope) === Scope.ORG) {
    return {
      label: getString('common.orgViewer'),
      value: '_organization_viewer',
      managed: true
    }
  }
  return { label: getString('common.accViewer'), value: '_account_viewer', managed: true }
}

export const getDetailsUrl = ({ accountId, orgIdentifier, projectIdentifier }: ScopedDTO): string => {
  if (projectIdentifier && orgIdentifier) {
    return `${window.location.href.split('#')[0]}#${routes.toProjectDetails({
      accountId,
      orgIdentifier,
      projectIdentifier
    })}`
  }
  if (orgIdentifier) {
    return `${window.location.href.split('#')[0]}#${routes.toOrganizationDetails({ accountId, orgIdentifier })}`
  }
  return ''
}
export const getModuleFullLengthTitle = (module: ModuleName): keyof StringsMap => {
  switch (module) {
    case ModuleName.CV:
      return 'common.purpose.cv.continuous'
    case ModuleName.CE:
      return 'common.purpose.ce.continuous'
    case ModuleName.CF:
      return 'common.purpose.cf.continuous'
    case ModuleName.CI:
      return 'common.purpose.ci.continuous'
    default:
      return 'common.purpose.cd.continuous'
  }
}
