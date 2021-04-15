import type { FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { MultiSelectOption, SelectOption } from '@wings-software/uicore'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  Failure,
  JiraFieldNG,
  ResponseJiraIssueCreateMetadataNG,
  ResponseListJiraProjectBasicNG,
  StepElementConfig,
  UseGetJiraIssueCreateMetadataProps,
  UseGetJiraProjectsProps
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { JiraProjectSelectOption } from '../JiraApproval/types'

export interface JiraCreateFieldType {
  name: string
  value: string | number | SelectOption | MultiSelectOption[]
}

export interface JiraFieldNGWithValue extends JiraFieldNG {
  value: string | number | SelectOption | MultiSelectOption[]
}

export interface JiraCreateData extends StepElementConfig {
  spec: {
    connectorRef: string | SelectOption
    projectKey: string | JiraProjectSelectOption
    issueType: string | JiraProjectSelectOption
    summary?: string
    description?: string
    fields: JiraCreateFieldType[]
    selectedFields?: JiraFieldNGWithValue[]
  }
}

export interface JiraCreateVariableListModeProps {
  variablesData: JiraCreateData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface JiraCreateStepModeProps {
  stepViewType?: StepViewType
  initialValues: JiraCreateData
  onUpdate?: (data: JiraCreateData) => void
  isNewStep?: boolean
}

export interface JiraCreateFormContentInterface {
  formik: FormikProps<JiraCreateData>
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

export enum JiraCreateFormFieldSelector {
  FIXED = 'FIXED',
  EXPRESSION = 'EXPRESSION'
}

export interface JiraFieldSelectorProps {
  fields: JiraFieldNG[]
  selectedFields: JiraFieldNG[]
  addSelectedFields: (selectedFields: JiraFieldNG[]) => void
  onCancel: () => void
}

export interface JiraDynamicFieldsSelectorInterface {
  connectorRef: string
  projectOptions: JiraProjectSelectOption[]
  addSelectedFields: (fields: JiraFieldNG[]) => void
  provideFieldList: (fields: JiraCreateFieldType[]) => void
  onCancel: () => void
}

export interface JiraDynamicFieldsSelectorContentInterface extends JiraDynamicFieldsSelectorInterface {
  refetchProjectMetadata: (props: UseGetJiraIssueCreateMetadataProps) => {}
  fetchingProjectMetadata: boolean
  projectMetaResponse: ResponseJiraIssueCreateMetadataNG | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
}

export interface JiraCreateDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: JiraCreateData
  onUpdate?: (data: JiraCreateData) => void
  inputSetData?: InputSetData<JiraCreateData>
}

export interface JiraCreateDeploymentModeFormContentInterface extends JiraCreateDeploymentModeProps {
  refetchProjects: (props: UseGetJiraProjectsProps) => {}
  refetchProjectMetadata: (props: UseGetJiraIssueCreateMetadataProps) => {}
  fetchingProjects: boolean
  fetchingProjectMetadata: boolean
  projectsResponse: ResponseListJiraProjectBasicNG | null
  projectMetaResponse: ResponseJiraIssueCreateMetadataNG | null
  projectsFetchError?: GetDataError<Failure | Error> | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
}
