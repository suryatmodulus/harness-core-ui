import type { MultiSelectOption, SelectOption } from '@wings-software/uicore'
import type { FormikErrors } from 'formik'
import type { JiraFieldNG, JiraStatusNG } from 'services/cd-ng'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

export enum ApprovalRejectionCriteriaType {
  Jexl = 'Jexl',
  KeyValues = 'KeyValues'
}

export interface ApprovalRejectionCriteriaCondition {
  key: string
  operator: string
  value: string | SelectOption | MultiSelectOption[]
}

export interface ApprovalRejectionCriteria {
  type: ApprovalRejectionCriteriaType
  spec: {
    // if type is Jexl
    expression?: string

    // If type is KV
    matchAnyCondition?: boolean
    conditions?: ApprovalRejectionCriteriaCondition[]
  }
}

export interface ApprovalRejectionCriteriaProps {
  mode: string
  values: ApprovalRejectionCriteria
  onChange: (values: ApprovalRejectionCriteria) => void
  statusList: JiraStatusNG[]
  fieldList: JiraFieldNG[]
  isFetchingFields?: boolean
  formikErrors?: FormikErrors<{
    expression?: string | undefined
    matchAnyCondition?: boolean | undefined
    conditions?: ApprovalRejectionCriteriaCondition[] | undefined
  }>
  readonly?: boolean
  title: string
  stepType: StepType
}

export interface ConditionsInterface extends ApprovalRejectionCriteriaProps {
  allowedFieldKeys: SelectOption[]
  allowedValuesForFields: Record<string, SelectOption[]>
}
