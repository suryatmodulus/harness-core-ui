import type { MultiSelectOption } from '@wings-software/uicore'
import type { AuditTrailFormType } from '@audit-trails/components/FilterDrawer/FilterDrawer'
import type { AuditEventDTO, AuditFilterProperties } from 'services/audit'
import type { StringKeys } from 'framework/strings'

export const actionToLabelMap: Record<AuditEventDTO['action'], StringKeys> = {
  CREATE: 'created',
  UPDATE: 'auditTrails.actions.updated',
  RESTORE: 'auditTrails.actions.restored',
  DELETE: 'deleted',
  UPSERT: 'auditTrails.actions.updated',
  INVITE: 'auditTrails.actions.invited',
  RESEND_INVITE: 'auditTrails.actions.invite_resent',
  REVOKE_INVITE: 'auditTrails.actions.invite_revoked',
  ADD_COLLABORATOR: 'auditTrails.actions.added_collaborator',
  REMOVE_COLLABORATOR: 'auditTrails.actions.removed_collaborator',
  ADD_MEMBERSHIP: 'auditTrails.actions.added_membership',
  REMOVE_MEMBERSHIP: 'auditTrails.actions.removed_membership'
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

const resourceTypeToLabelMapping: Record<string, string> = {
  ResourceTypeOne: 'ResourceTypeOne',
  ResourceTypeTwo: 'ResourceTypeTwo'
}

export const getResourceTypeForMultiselect = (): MultiSelectOption[] => {
  return Object.keys(resourceTypeToLabelMapping).map(key => ({
    label: resourceTypeToLabelMapping[key],
    value: key
  }))
}

// create different multiselect types
export const getFilterPropertiesFromForm = (formData: AuditTrailFormType, accountId: string): AuditFilterProperties => {
  return {
    filterType: 'Audit',
    actions: formData?.actions?.map(action => action.value) as AuditFilterProperties['actions'],
    modules: formData?.modules?.map((module: MultiSelectOption) => module.value) as AuditFilterProperties['modules'],
    scopes:
      formData?.organizations?.map(org => ({
        orgIdentifier: org.value as string,
        accountIdentifier: accountId
      })) || [],
    principals: formData?.users?.map(user => ({
      type: 'USER',
      identifier: user.value
    })) as AuditFilterProperties['principals']
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
      })) || []
  }
}
