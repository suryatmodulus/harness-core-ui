import { getMultiTypeFromValue, MultiSelectOption, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import type { JiraFieldNG } from 'services/cd-ng'
import type { JiraProjectSelectOption } from '../JiraApproval/types'
import type { JiraCreateData, JiraCreateFieldType, JiraFieldNGWithValue } from './types'

export const resetForm = (formik: FormikProps<JiraCreateData>, parent: string) => {
  if (parent === 'connectorRef') {
    formik.setFieldValue('spec.projectKey', '')
    formik.setFieldValue('spec.issueType', '')
    formik.setFieldValue('spec.fields', [])
  }
  if (parent === 'projectKey') {
    formik.setFieldValue('spec.issueType', '')
    formik.setFieldValue('spec.fields', [])
  }
  if (parent === 'issueType') {
    formik.setFieldValue('spec.fields', [])
  }
}

export const processFieldsForSubmit = (values: JiraCreateData): JiraCreateFieldType[] => {
  const toReturn: JiraCreateFieldType[] = [
    {
      name: 'Summary',
      value: values.spec.summary || ''
    },
    {
      name: 'Description',
      value: values.spec.description || ''
    }
  ]
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
  return toReturn
}

export const getInitialValueForSelectedField = (
  savedFields: JiraCreateFieldType[],
  field: JiraFieldNG
): string | number | SelectOption | MultiSelectOption[] => {
  const savedValue = savedFields.find(sf => sf.name === field.name)?.value
  if (typeof savedValue === 'number') {
    return savedValue as number
  } else if (typeof savedValue === 'string') {
    if (field.allowedValues && field.schema.type === 'option' && field.schema.array) {
      // multiselect
      // return multiselectoption[]
      const splitValues = (savedValue as string).split(',')
      return splitValues.map(splitvalue => ({ label: splitvalue, value: splitvalue })) as MultiSelectOption[]
    } else if (field.allowedValues && field.schema.type === 'option') {
      // singleselect
      // return selectoption
      return { label: savedValue, value: savedValue } as SelectOption
    }
    return savedValue as string
  }
  return ''
}

export const processFormData = (values: JiraCreateData): JiraCreateData => {
  return {
    ...values,
    spec: {
      connectorRef:
        getMultiTypeFromValue(values.spec.connectorRef as SelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.connectorRef as SelectOption).value?.toString()
          : values.spec.connectorRef,
      projectKey:
        getMultiTypeFromValue(values.spec.projectKey as JiraProjectSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.projectKey as JiraProjectSelectOption).key?.toString()
          : values.spec.projectKey,
      issueType:
        getMultiTypeFromValue(values.spec.issueType as JiraProjectSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.issueType as JiraProjectSelectOption).key?.toString()
          : values.spec.issueType,
      fields: processFieldsForSubmit(values)
    }
  }
}

export const getKVFields = (values: JiraCreateData): JiraCreateFieldType[] => {
  return processFieldsForSubmit(values)
}

export const processInitialValues = (values: JiraCreateData): JiraCreateData => {
  return {
    ...values,
    spec: {
      connectorRef: values.spec.connectorRef,
      projectKey:
        values.spec.projectKey && getMultiTypeFromValue(values.spec.projectKey) === MultiTypeInputType.FIXED
          ? {
              label: values.spec.projectKey.toString(),
              value: values.spec.projectKey.toString(),
              key: values.spec.projectKey.toString()
            }
          : values.spec.projectKey,
      issueType:
        values.spec.issueType && getMultiTypeFromValue(values.spec.issueType) === MultiTypeInputType.FIXED
          ? {
              label: values.spec.issueType.toString(),
              value: values.spec.issueType.toString(),
              key: values.spec.issueType.toString()
            }
          : values.spec.issueType,
      summary: values.spec.fields.find(field => field.name === 'Summary')?.value.toString(),
      description: values.spec.fields.find(field => field.name === 'Description')?.value.toString(),
      fields: values.spec.fields
    }
  }
}
