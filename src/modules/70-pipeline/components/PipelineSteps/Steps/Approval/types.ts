// Different interfaces for all the approval types

import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { NGVariable, StepElementConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export interface HarnessApprovalData extends StepElementConfig {
  // This later has to be replaced by the BE class
  spec: {
    approvalMessage: string
    includePipelineExecutionHistory: string | boolean
    approvers: {
      userGroups: string | string[]
      users: string | string[]
      minimumCount: string | number
      disallowPipelineExecutor: string | boolean
    }
    approverInputs: string | NGVariable[] // change to something else if we need the 'defaultValue' key instead of 'value'
  }
}

export interface HarnessApprovalDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: HarnessApprovalData
  onUpdate?: (data: HarnessApprovalData) => void
  inputSetData?: InputSetData<HarnessApprovalData>
}

export interface HarnessApprovalStepModeProps {
  stepViewType?: StepViewType
  initialValues: HarnessApprovalData
  onUpdate?: (data: HarnessApprovalData) => void
}

export interface HarnessApprovalVariableListModeProps {
  variablesData: HarnessApprovalData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}
