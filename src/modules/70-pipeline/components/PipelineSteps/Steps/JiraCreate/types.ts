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
  readonly?: boolean
}

export interface JiraCreateFormContentInterface {
  formik: FormikProps<JiraCreateData>
  refetchProjects: (props: UseGetJiraProjectsProps) => Promise<void>
  refetchProjectMetadata: (props: UseGetJiraIssueCreateMetadataProps) => Promise<void>
  fetchingProjects: boolean
  fetchingProjectMetadata: boolean
  projectsResponse: ResponseListJiraProjectBasicNG | null
  projectMetaResponse: ResponseJiraIssueCreateMetadataNG | null
  projectsFetchError?: GetDataError<Failure | Error> | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
  readonly?: boolean
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
  selectedProjectKey: string
  selectedIssueTypeKey: string
  projectOptions: JiraProjectSelectOption[]
  addSelectedFields: (fields: JiraFieldNG[], selectedProjectKey: string, selectedIssueTypeKey: string) => void
  provideFieldList: (fields: JiraCreateFieldType[]) => void
  onCancel: () => void
  showProjectDisclaimer?: boolean
}

export interface JiraDynamicFieldsSelectorContentInterface extends JiraDynamicFieldsSelectorInterface {
  refetchProjectMetadata: (props: UseGetJiraIssueCreateMetadataProps) => Promise<void>
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
  refetchProjects: (props: UseGetJiraProjectsProps) => Promise<void>
  refetchProjectMetadata: (props: UseGetJiraIssueCreateMetadataProps) => Promise<void>
  fetchingProjects: boolean
  fetchingProjectMetadata: boolean
  projectsResponse: ResponseListJiraProjectBasicNG | null
  projectMetaResponse: ResponseJiraIssueCreateMetadataNG | null
  projectsFetchError?: GetDataError<Failure | Error> | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
}
