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

export const moduleToLabelMap: Record<AuditEventDTO['module'], StringKeys> = {
  CD: 'common.module.cd',
  CE: 'common.module.ce',
  CF: 'common.module.cf',
  CV: 'common.module.cv',
  CI: 'common.module.ci',
  CORE: 'common.module.core',
  PMS: 'common.module.pms',
  TEMPLATESERVICE: 'common.module.templateService'
}

export const resourceTypeToLabelMapping: Record<ResourceDTO['type'], StringKeys> = {
  ORGANIZATION: 'orgLabel',
  PROJECT: 'projectLabel',
  USER_GROUP: 'common.userGroup',
  SECRET: 'secretType',
  RESOURCE_GROUP: 'common.resourceGroupLabel',
  USER: 'common.userLabel',
  ROLE: 'common.role',
  ROLE_ASSIGNMENT: 'common.roleAssignmentLabel',
  PIPELINE: 'common.pipeline',
  TRIGGER: 'common.triggerLabel',
  TEMPLATE: 'common.template.label',
  INPUT_SET: 'inputSets.inputSetLabel',
  DELEGATE_CONFIGURATION: 'delegate.delegateConfiguration',
  SERVICE: 'service',
  ENVIRONMENT: 'environment',
  DELEGATE: 'delegate.DelegateName',
  SERVICE_ACCOUNT: 'serviceAccount',
  CONNECTOR: 'connector',
  API_KEY: 'common.apikey',
  TOKEN: 'token',
  DELEGATE_TOKEN: 'common.delegateTokenLabel'
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
