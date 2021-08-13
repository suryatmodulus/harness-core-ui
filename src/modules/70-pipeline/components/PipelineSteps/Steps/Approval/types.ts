import type { FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { MultiSelectOption } from '@wings-software/uicore'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { Failure, ResponsePageUserGroupDTO, StepElementConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export interface ApproverInputsSubmitCallInterface {
  name: string
  defaultValue?: string
}

export interface HarnessApprovalData extends StepElementConfig {
  // This later has to be replaced by the BE class
  spec: {
    approvalMessage: string
    includePipelineExecutionHistory: string | boolean
    approvers: {
      userGroups: string | string[] | MultiSelectOption[]
      minimumCount: string | number
      disallowPipelineExecutor: string | boolean
    }
    approverInputs: string | ApproverInputsSubmitCallInterface[]
  }
}

export interface HarnessApprovalDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: HarnessApprovalData
  onUpdate?: (data: HarnessApprovalData) => void
  inputSetData?: InputSetData<HarnessApprovalData>
  readonly?: boolean
}

export interface HarnessApprovalStepModeProps {
  stepViewType?: StepViewType
  isNewStep?: boolean
  initialValues: HarnessApprovalData
  onUpdate?: (data: HarnessApprovalData) => void
  readonly?: boolean
}

export interface HarnessApprovalVariableListModeProps {
  variablesData: HarnessApprovalData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface APIStateInterface {
  options: MultiSelectOption[]
  error?: string
  apiStatus: string
}

export interface HarnessApprovalFormContentProps {
  formik: FormikProps<HarnessApprovalData>
  isNewStep?: boolean
  readonly?: boolean
}

export interface UGMUltiSelectProps {
  initialValues: HarnessApprovalData
  onUpdate?: (data: HarnessApprovalData) => void
  inputSetData?: InputSetData<HarnessApprovalData>
  userGroupsResponse: ResponsePageUserGroupDTO | null
  userGroupsFetchError: GetDataError<Failure | Error> | null
  fetchingUserGroups: boolean
}
