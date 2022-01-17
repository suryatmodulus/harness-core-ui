/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiSelectOption, MultiTypeInputType, SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import type { JiraFieldAllowedValueNG, JiraFieldNG, JiraIssueTypeNG, JiraStatusNG } from 'services/cd-ng'
import {
  ApprovalRejectionCriteria,
  ApprovalRejectionCriteriaCondition,
  ApprovalRejectionCriteriaType
} from '@pipeline/components/PipelineSteps/Steps/Common/types'
import type { JiraApprovalData, JiraProjectSelectOption } from './types'

const getApprovalRejectionConditionValuesForSubmit = (values: string | SelectOption | MultiSelectOption[]): string => {
  // The selected values can be string, selectoption or multiselect options
  if (typeof values === 'string') {
    // Simple text input
    return values
  }
  if (Array.isArray(values)) {
    // Multi select
    return values.map(v => v.value?.toString()).join(',')
  }
  // Single select
  return values.value.toString()
}

export const filterNonEmptyConditions = (condition: ApprovalRejectionCriteriaCondition) =>
  condition.key && condition.value

export const getApprovalRejectionCriteriaForSubmit = (
  criteria: ApprovalRejectionCriteria
): ApprovalRejectionCriteria => {
  // Convert the approval/rejection criteria 'value' field to string/string[], from selectoption
  const criteriaToReturn: ApprovalRejectionCriteria = {
    type: criteria.type,
    spec: {
      matchAnyCondition: criteria.spec.matchAnyCondition,
      expression: criteria.spec.expression,
      conditions: criteria.spec.conditions
        ?.filter(filterNonEmptyConditions)
        .map((condition: ApprovalRejectionCriteriaCondition) => {
          return {
            key: condition.key,
            operator: condition.operator,
            value:
              getMultiTypeFromValue(condition.value) !== MultiTypeInputType.EXPRESSION
                ? getApprovalRejectionConditionValuesForSubmit(condition.value)
                : condition.value
          }
        })
    }
  }
  if (criteriaToReturn.type === ApprovalRejectionCriteriaType.Jexl) {
    delete criteriaToReturn.spec.conditions
    delete criteriaToReturn.spec.matchAnyCondition
  } else if (criteriaToReturn.type === ApprovalRejectionCriteriaType.KeyValues) {
    delete criteriaToReturn.spec.expression
  }
  return criteriaToReturn
}

export const processFormData = (values: JiraApprovalData): JiraApprovalData => {
  return {
    ...values,
    spec: {
      ...values.spec,
      connectorRef:
        getMultiTypeFromValue(values.spec.connectorRef as SelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.connectorRef as SelectOption)?.value?.toString()
          : values.spec.connectorRef,
      projectKey:
        getMultiTypeFromValue(values.spec.projectKey as JiraProjectSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.projectKey as JiraProjectSelectOption)?.key?.toString()
          : values.spec.projectKey,
      issueType:
        getMultiTypeFromValue(values.spec.issueType as JiraProjectSelectOption) === MultiTypeInputType.FIXED
          ? (values.spec.issueType as JiraProjectSelectOption)?.key?.toString()
          : values.spec.issueType,
      issueKey: values.spec.issueKey,
      approvalCriteria: getApprovalRejectionCriteriaForSubmit(values.spec.approvalCriteria),
      rejectionCriteria: getApprovalRejectionCriteriaForSubmit(values.spec.rejectionCriteria)
    }
  }
}

const getInitialApprovalRejectionConditionValues = (
  condition: ApprovalRejectionCriteriaCondition,
  statusList: JiraStatusNG[] = [],
  fieldList: JiraFieldNG[] = []
): string | SelectOption | MultiSelectOption[] => {
  // The value in YAML is always a string.
  // We'll figure out the component from operator and key
  const { operator, value, key } = condition
  const list = key === 'Status' ? statusList : fieldList.find(field => field.name === key)?.allowedValues

  if (isEmpty(list)) {
    // Simple text input
    return value?.toString()
  }

  if ((operator === 'in' || operator === 'not in') && typeof value === 'string') {
    // Multi select
    return value.split(',').map(each => ({
      label: each,
      value: each
    }))
  }
  // Single select
  return {
    label: value.toString(),
    value: value.toString()
  }
}

export const getDefaultCriterias = (): ApprovalRejectionCriteria => ({
  type: ApprovalRejectionCriteriaType.KeyValues,
  spec: {
    matchAnyCondition: true,
    conditions: []
  }
})

export const getApprovalRejectionCriteriaForInitialValues = (
  criteria: ApprovalRejectionCriteria,
  statusList: JiraStatusNG[] = [],
  fieldList: JiraFieldNG[] = []
): ApprovalRejectionCriteria => {
  // Convert the approval/rejection criteria 'value' field to selectoption, from string/string[]
  if (!criteria) {
    return getDefaultCriterias()
  }
  return {
    ...criteria,
    spec: {
      ...criteria.spec,
      conditions: Array.isArray(criteria.spec.conditions)
        ? criteria.spec.conditions?.map((condition: ApprovalRejectionCriteriaCondition) => ({
            key: condition.key,
            operator: condition.operator,
            value:
              getMultiTypeFromValue(condition.value) === MultiTypeInputType.FIXED
                ? getInitialApprovalRejectionConditionValues(condition, statusList, fieldList)
                : condition.value
          }))
        : []
    }
  }
}

export const processInitialValues = (values: JiraApprovalData): JiraApprovalData => {
  // Convert string values in approval/rejection criteria condition to SelectOption, so that it's populated in edit
  return {
    ...values,
    spec: {
      ...values.spec,
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
      approvalCriteria: getApprovalRejectionCriteriaForInitialValues(values.spec.approvalCriteria),
      rejectionCriteria: getApprovalRejectionCriteriaForInitialValues(values.spec.rejectionCriteria)
    }
  }
}

export const removeDuplicateFieldKeys = (fieldKeys: SelectOption[]) => {
  const labelMap: Record<string, boolean> = {}
  return fieldKeys.filter(keyy => {
    if (labelMap[keyy.label]) {
      return false
    }
    labelMap[keyy.label] = true
    return true
  })
}

export const operatorValues: SelectOption[] = [
  {
    label: '=',
    value: 'equals'
  },
  {
    label: '!=',
    value: 'not equals'
  },
  {
    label: 'in',
    value: 'in'
  },
  {
    label: 'not in',
    value: 'not in'
  }
]

export const filterOutMultiOperators = (): SelectOption[] =>
  operatorValues.filter(opValue => opValue.value === 'equals' || opValue.value === 'not equals')

export const setIssueTypeOptions = (issuetypes: { [key: string]: JiraIssueTypeNG } = {}): JiraProjectSelectOption[] => {
  const keys = Object.keys(issuetypes)
  const toReturn: JiraProjectSelectOption[] = []
  keys.forEach(keyy => {
    const issueTypeObject = issuetypes[keyy]
    toReturn.push({
      label: issueTypeObject.name,
      value: issueTypeObject.name,
      key: keyy
    })
  })
  return toReturn
}

export const resetForm = (formik: FormikProps<JiraApprovalData>, parent: string) => {
  if (parent === 'connectorRef') {
    formik.setFieldValue('spec.projectKey', '')
    formik.setFieldValue('spec.issueType', '')
    formik.setFieldValue('spec.issueKey', '')
    formik.setFieldValue('spec.approvalCriteria', getDefaultCriterias())
    formik.setFieldValue('spec.rejectionCriteria', getDefaultCriterias())
  }
  if (parent === 'projectKey') {
    formik.setFieldValue('spec.issueType', '')
    formik.setFieldValue('spec.issueKey', '')
    formik.setFieldValue('spec.approvalCriteria', getDefaultCriterias())
    formik.setFieldValue('spec.rejectionCriteria', getDefaultCriterias())
  }
  if (parent === 'issueType') {
    formik.setFieldValue('spec.issueKey', '')
    formik.setFieldValue('spec.approvalCriteria', getDefaultCriterias())
    formik.setFieldValue('spec.rejectionCriteria', getDefaultCriterias())
  }
}

export const getGenuineValue = (value: SelectOption | JiraProjectSelectOption | string): string | undefined => {
  // This function returns true if the value is fixed
  // i.e. selected from dropdown
  // We'll use this value to make API calls for depedent fields
  if (typeof value === 'object') {
    // Either SelectOption or JiraProjectSelectOption - the value has been selected from the form
    return value.value.toString()
  }
  if (getMultiTypeFromValue(value) === MultiTypeInputType.FIXED && value) {
    // Value is present as string and supplied as initialValues
    return value
  }
  return undefined
}

export const setAllowedValuesOptions = (allowedValues: JiraFieldAllowedValueNG[]): MultiSelectOption[] =>
  allowedValues.map(allowedValue => ({
    label: allowedValue.value || allowedValue.name || allowedValue.id || '',
    value: allowedValue.value || allowedValue.name || allowedValue.id || ''
  }))

export const handleOperatorChange = (
  selectedOperator: SelectOption,
  onChange: (values: ApprovalRejectionCriteria) => void,
  values: ApprovalRejectionCriteria,
  i: number
) => {
  if (selectedOperator?.value === 'in' || selectedOperator?.value === 'not in') {
    // When we swiatch from sigle select to mmultiselect, populate the seelcted value in multiselect
    const conditions = values.spec.conditions
    if (typeof conditions?.[i].value === 'object' && conditions?.[i].value) {
      const tobeUpdatedConditions = [...conditions]
      tobeUpdatedConditions[i].operator = selectedOperator.value
      tobeUpdatedConditions[i].value = [conditions?.[i].value as MultiSelectOption]
      onChange({ ...values, spec: { ...values.spec, conditions: tobeUpdatedConditions } })
    }
  }
}
