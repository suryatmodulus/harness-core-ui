import type { FormikErrors, FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { MultiSelectOption, SelectOption } from '@wings-software/uicore'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  Failure,
  JiraFieldNG,
  JiraStatusNG,
  ResponseJiraIssueCreateMetadataNG,
  ResponseListJiraProjectBasicNG,
  StepElementConfig,
  UseGetJiraIssueCreateMetadataProps,
  UseGetJiraProjectsProps
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

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

export interface JiraApprovalData extends StepElementConfig {
  spec: {
    connectorRef: string | SelectOption
    projectKey: string | JiraProjectSelectOption
    issueType: string | JiraProjectSelectOption
    issueKey: string
    approvalCriteria: ApprovalRejectionCriteria
    rejectionCriteria: ApprovalRejectionCriteria
  }
}

export interface JiraApprovalVariableListModeProps {
  variablesData: JiraApprovalData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface JiraApprovalDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: JiraApprovalData
  onUpdate?: (data: JiraApprovalData) => void
  inputSetData?: InputSetData<JiraApprovalData>
}

export interface JiraApprovalStepModeProps {
  stepViewType?: StepViewType
  initialValues: JiraApprovalData
  onUpdate?: (data: JiraApprovalData) => void
  isNewStep?: boolean
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
}

export interface JiraProjectSelectOption extends SelectOption {
  key: string
}

export interface ConditionsInterface extends ApprovalRejectionCriteriaProps {
  allowedFieldKeys: SelectOption[]
  allowedValuesForFields: Record<string, SelectOption[]>
}

export interface JiraFormContentInterface {
  formik: FormikProps<JiraApprovalData>
  refetchProjects: (props: UseGetJiraProjectsProps) => {}
  refetchProjectMetadata: (props: UseGetJiraIssueCreateMetadataProps) => {}
  fetchingProjects: boolean
  fetchingProjectMetadata: boolean
  projectsResponse: ResponseListJiraProjectBasicNG | null
  projectMetaResponse: ResponseJiraIssueCreateMetadataNG | null
  projectsFetchError?: GetDataError<Failure | Error> | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
}

export interface JiraDeploymentModeFormContentInterface extends JiraApprovalDeploymentModeProps {
  refetchProjects: (props: UseGetJiraProjectsProps) => {}
  refetchProjectMetadata: (props: UseGetJiraIssueCreateMetadataProps) => {}
  fetchingProjects: boolean
  fetchingProjectMetadata: boolean
  projectsResponse: ResponseListJiraProjectBasicNG | null
  projectMetaResponse: ResponseJiraIssueCreateMetadataNG | null
  projectsFetchError?: GetDataError<Failure | Error> | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
}
