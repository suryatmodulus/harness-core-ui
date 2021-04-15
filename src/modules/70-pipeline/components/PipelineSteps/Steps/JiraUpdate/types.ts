import type { FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { SelectOption } from '@wings-software/uicore'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  Failure,
  ResponseListJiraProjectBasicNG,
  ResponseListJiraStatusNG,
  StepElementConfig,
  UseGetJiraProjectsProps,
  UseGetJiraStatusesProps
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { JiraCreateFieldType, JiraFieldNGWithValue } from '../JiraCreate/types'

export interface JiraUpdateData extends StepElementConfig {
  spec: {
    connectorRef: string | SelectOption
    issueKey: string
    transitionTo?: {
      status: string | SelectOption
      transitionName: string
    }
    fields: JiraCreateFieldType[]
    selectedFields?: JiraFieldNGWithValue[]
  }
}

export interface JiraUpdateVariableListModeProps {
  variablesData: JiraUpdateData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface JiraUpdateStepModeProps {
  stepViewType?: StepViewType
  initialValues: JiraUpdateData
  onUpdate?: (data: JiraUpdateData) => void
  isNewStep?: boolean
}

export interface JiraUpdateFormContentInterface {
  formik: FormikProps<JiraUpdateData>
  refetchProjects: (props: UseGetJiraProjectsProps) => {}
  refetchStatuses: (props: UseGetJiraStatusesProps) => {}
  fetchingProjects: boolean
  fetchingStatuses: boolean
  projectsResponse: ResponseListJiraProjectBasicNG | null
  statusResponse: ResponseListJiraStatusNG | null
  projectsFetchError?: GetDataError<Failure | Error> | null
  statusFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
}

export interface JiraUpdateDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: JiraUpdateData
  onUpdate?: (data: JiraUpdateData) => void
  inputSetData?: InputSetData<JiraUpdateData>
}

export interface JiraUpdateDeploymentModeFormContentInterface extends JiraUpdateDeploymentModeProps {
  refetchStatuses: (props: UseGetJiraStatusesProps) => {}
  fetchingStatuses: boolean
  statusResponse: ResponseListJiraStatusNG | null
  statusFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
}
