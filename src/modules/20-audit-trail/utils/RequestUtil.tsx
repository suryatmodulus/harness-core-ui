import type { MultiSelectOption } from '@wings-software/uicore'
import type { AuditTrailFormType } from '@audit-trail/components/FilterDrawer/FilterDrawer'
import type { AuditEventDTO, AuditFilterProperties, ResourceDTO } from 'services/audit'
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

const getScopes = (formData: AuditTrailFormType, accountId: string): Pick<AuditFilterProperties, 'scopes'> => {
  const { organizations, projects } = formData

  if (organizations && organizations?.length <= 0) {
    return {}
  }

  if (projects && projects?.length > 0) {
    return {
      scopes: projects.map(project => ({
        projectIdentifier: project.value as string,
        accountIdentifier: accountId
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
    ...getScopes(formData, accountId),
    principals: formData?.users?.map(user => ({
      type: 'USER',
      identifier: user.value
    })) as AuditFilterProperties['principals'],
    resources: formData?.resourceType?.map(resourceType => ({
      type: resourceType.value
    })) as AuditFilterProperties['resources']
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
    organizations:
      filterProperties?.scopes?.map(scope => ({
        label: scope.orgIdentifier || '',
        value: scope.orgIdentifier || ''
      })) || [],
    resourceType: filterProperties?.resources?.map(resource => ({
      label: resourceTypeToLabelMapping[resource.type],
      value: resource.type
    }))
  }
}
