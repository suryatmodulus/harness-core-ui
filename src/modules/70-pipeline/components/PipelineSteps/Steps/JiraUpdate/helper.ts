import { getMultiTypeFromValue, MultiSelectOption, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { JiraCreateFieldType, JiraFieldNGWithValue } from '../JiraCreate/types'
import type { JiraUpdateData } from './types'

export const processFieldsForSubmit = (values: JiraUpdateData): JiraCreateFieldType[] => {
  const toReturn: JiraCreateFieldType[] = []
  values.spec.selectedFields?.forEach((field: JiraFieldNGWithValue) => {
    const name = field.name
    const value =
      typeof field.value === 'string' || typeof field.value === 'number'
        ? field.value
        : Array.isArray(field.value)
        ? (field.value as MultiSelectOption[]).map(opt => opt.value.toString()).join(',')
        : typeof field.value === 'object'
        ? (field.value as SelectOption).value?.toString()
        : ''
    // The return value should be comma separated string or a number
    toReturn.push({ name, value })
  })
  values.spec.fields?.forEach((kvField: JiraCreateFieldType) => {
    const alreadyPresent = toReturn.find(field => field.name === kvField.name)
    if (!alreadyPresent) {
      toReturn.push(kvField)
    }
  })
  return toReturn
}

export const processFormData = (values: JiraUpdateData): JiraUpdateData => {
  return {
    ...values,
    spec: {
      connectorRef:
        getMultiTypeFromValue(values.spec.connectorRef as SelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.connectorRef as SelectOption)?.value?.toString()
          : values.spec.connectorRef,
      issueKey: values.spec.issueKey,
      transitionTo:
        values.spec.transitionTo?.transitionName || values.spec.transitionTo?.status
          ? {
              transitionName: values.spec.transitionTo.transitionName,
              status:
                getMultiTypeFromValue(values.spec.transitionTo.status as SelectOption) === MultiTypeInputType.FIXED
                  ? (values.spec.transitionTo.status as SelectOption).value?.toString()
                  : values.spec.transitionTo.status
            }
          : undefined,
      fields: processFieldsForSubmit(values)
    }
  }
}

export const processInitialValues = (values: JiraUpdateData): JiraUpdateData => {
  return {
    ...values,
    spec: {
      connectorRef: values.spec.connectorRef,
      issueKey: values.spec.issueKey,
      transitionTo: values.spec.transitionTo
        ? {
            status:
              getMultiTypeFromValue(values.spec.transitionTo.status as string) === MultiTypeInputType.FIXED &&
              values.spec.transitionTo.status
                ? {
                    label: values.spec.transitionTo.status.toString(),
                    value: values.spec.transitionTo.status.toString()
                  }
                : values.spec.transitionTo.status,
            transitionName: values.spec.transitionTo.transitionName
          }
        : undefined,
      fields: values.spec.fields
    }
  }
}
