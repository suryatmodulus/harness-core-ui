import type { MultiSelectOption } from '@wings-software/uicore'
import uniqBy from 'lodash/uniqBy'
import type { AuditTrailFormType, ProjectSelectOption } from '@audit-trail/components/FilterDrawer/FilterDrawer'
import type { AuditEventDTO, AuditFilterProperties, ResourceDTO, ResourceScopeDTO } from 'services/audit'
import type { StringKeys } from 'framework/strings'

export const actionToLabelMap: Record<AuditEventDTO['action'], StringKeys> = {
  CREATE: 'created',
  UPDATE: 'auditTrail.actions.updated',
  RESTORE: 'auditTrail.actions.restored',
  DELETE: 'deleted',
  UPSERT: 'auditTrail.actions.updated',
  INVITE: 'auditTrail.actions.invited',
  RESEND_INVITE: 'auditTrail.actions.invite_resent',
  REVOKE_INVITE: 'auditTrail.actions.invite_revoked',
  ADD_COLLABORATOR: 'auditTrail.actions.added_collaborator',
  REMOVE_COLLABORATOR: 'auditTrail.actions.removed_collaborator',
  ADD_MEMBERSHIP: 'auditTrail.actions.added_membership',
  REMOVE_MEMBERSHIP: 'auditTrail.actions.removed_membership',
  REVOKE_TOKEN: 'auditTrail.actions.revoke_token'
}

const resourceTypeToLabelMapping: Record<ResourceDTO['type'], string> = {
  ORGANIZATION: 'ORGANIZATION',
  PROJECT: 'PROJECT',
  USER_GROUP: 'USER_GROUP',
  SECRET: 'SECRET',
  RESOURCE_GROUP: 'RESOURCE_GROUP',
  USER: 'USER',
  ROLE: 'ROLE',
  ROLE_ASSIGNMENT: 'ROLE_ASSIGNMENT',
  PIPELINE: 'PIPELINE',
  TRIGGER: 'TRIGGER',
  TEMPLATE: 'TEMPLATE',
  INPUT_SET: 'INPUT_SET',
  DELEGATE_CONFIGURATION: 'DELEGATE_CONFIGURATION',
  SERVICE: 'SERVICE',
  ENVIRONMENT: 'ENVIRONMENT',
  DELEGATE: 'DELEGATE',
  SERVICE_ACCOUNT: 'SERVICE_ACCOUNT',
  CONNECTOR: 'CONNECTOR',
  API_KEY: 'API_KEY',
  TOKEN: 'TOKEN',
  DELEGATE_TOKEN: 'DELEGATE_TOKEN'
}

export const getResourceTypeForMultiselect = (): MultiSelectOption[] => {
  return Object.keys(resourceTypeToLabelMapping).map(key => ({
    label: resourceTypeToLabelMapping[key],
    value: key
  }))
}

const getScopesFromFormData = (
  formData: AuditTrailFormType,
  accountId: string
): Pick<AuditFilterProperties, 'scopes'> => {
  const { organizations, projects } = formData

  if (organizations && organizations?.length <= 0) {
    return {}
  }

  if (projects && projects?.length > 0) {
    return {
      scopes: projects.map(projectData => ({
        projectIdentifier: projectData.value as string,
        accountIdentifier: accountId,
        orgIdentifier: projectData.orgIdentifier
      }))
    }
  }

  return {
    scopes: formData?.organizations?.map(org => ({
      orgIdentifier: org.value as string,
      accountIdentifier: accountId
    }))
  }
}

// create different multiselect types
export const getFilterPropertiesFromForm = (formData: AuditTrailFormType, accountId: string): AuditFilterProperties => {
  return {
    filterType: 'Audit',
    actions: formData?.actions?.map(action => action.value) as AuditFilterProperties['actions'],
    modules: formData?.modules?.map((module: MultiSelectOption) => module.value) as AuditFilterProperties['modules'],
    ...getScopesFromFormData(formData, accountId),
    principals: formData?.users?.map(user => ({
      type: 'USER',
      identifier: user.value
    })) as AuditFilterProperties['principals'],
    resources: formData?.resourceType?.map(resourceType => ({
      type: resourceType.value
    })) as AuditFilterProperties['resources']
  }
}

const getOrgAndProjects = (scopes: ResourceScopeDTO[]) => {
  const organizations: MultiSelectOption[] = []
  const projects: ProjectSelectOption[] = []
  scopes.forEach(scope => {
    if (scope.orgIdentifier) {
      if (scope.projectIdentifier) {
        projects.push({
          label: scope.projectIdentifier,
          value: scope.projectIdentifier,
          orgIdentifier: scope.orgIdentifier
        })
      }
      organizations.push({ label: scope.orgIdentifier, value: scope.orgIdentifier })
    }
  })
  return {
    organizations: uniqBy(organizations, org => org.value),
    projects
  }
}

export const getFormValuesFromFilterProperties = (
  filterProperties: AuditFilterProperties,
  getString: (key: StringKeys, vars?: Record<string, any>) => string
): AuditTrailFormType => {
  return {
    actions: filterProperties?.actions?.map(action => ({ label: getString(actionToLabelMap[action]), value: action })),
    modules: filterProperties?.modules?.map(module => ({ label: getString(moduleToLabelMap[module]), value: module })),
    users: filterProperties?.principals?.map(principal => ({
      label: principal.identifier,
      value: principal.identifier
    })),
    ...(filterProperties.scopes ? getOrgAndProjects(filterProperties.scopes) : {}),
    resourceType: filterProperties?.resources?.map(resource => ({
      label: resourceTypeToLabelMapping[resource.type],
      value: resource.type
    }))
  }
}
