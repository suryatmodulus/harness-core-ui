import { getMultiTypeFromValue, MultiSelectOption, MultiTypeInputType } from '@wings-software/uicore'
import type { ApproverInputsSubmitCallInterface, HarnessApprovalData } from './types'

/*
Process and convert form data to submit call data
Flatten the usergroups object, and only send the ids
*/
export const processFormData = (data: HarnessApprovalData): HarnessApprovalData => {
  const toReturn: HarnessApprovalData = {
    ...data,
    spec: {
      ...data.spec,
      approvers: {
        ...data.spec.approvers,
        userGroups:
          getMultiTypeFromValue(data.spec.approvers.userGroups as string) === MultiTypeInputType.RUNTIME
            ? data.spec.approvers.userGroups
            : (data.spec.approvers.userGroups as MultiSelectOption[]).map(ug => ug.value?.toString()),
        minimumCount:
          getMultiTypeFromValue(data.spec.approvers.minimumCount as string) === MultiTypeInputType.RUNTIME
            ? data.spec.approvers.minimumCount
            : Number(data.spec.approvers.minimumCount)
      },
      approverInputs:
        getMultiTypeFromValue(data.spec.approverInputs as string) === MultiTypeInputType.RUNTIME
          ? data.spec.approverInputs
          : Array.isArray(data.spec.approverInputs)
          ? (data.spec.approverInputs as ApproverInputsSubmitCallInterface[]).map(
              (input: ApproverInputsSubmitCallInterface) =>
                ({
                  name: input.name,
                  defaultValue: input.defaultValue
                } as ApproverInputsSubmitCallInterface)
            )
          : []
    }
  }
  return toReturn
}

// Converting API call data for formik values, to populate while editing the step
export const processForInitialValues = (data: HarnessApprovalData, isDeploymentView = false): HarnessApprovalData => {
  const toReturn: HarnessApprovalData = {
    ...data,
    spec: {
      ...data.spec,
      approvers: {
        ...data.spec.approvers,
        userGroups: isDeploymentView ? [] : data.spec.approvers.userGroups,
        minimumCount:
          getMultiTypeFromValue(data.spec.approvers.minimumCount as string) === MultiTypeInputType.RUNTIME
            ? data.spec.approvers.minimumCount
            : data.spec.approvers.minimumCount
            ? Number(data.spec.approvers.minimumCount)
            : 1
      },
      approverInputs:
        getMultiTypeFromValue(data.spec.approverInputs as string) === MultiTypeInputType.RUNTIME
          ? data.spec.approverInputs
          : Array.isArray(data.spec.approverInputs)
          ? (data.spec.approverInputs as ApproverInputsSubmitCallInterface[]).map(
              (input: ApproverInputsSubmitCallInterface) =>
                ({
                  name: input.name,
                  defaultValue: input.defaultValue
                } as ApproverInputsSubmitCallInterface)
            )
          : []
    }
  }

  return toReturn
}

export const isArrayOfStrings = (array: any): array is string[] =>
  Array.isArray(array) && array.every(element => typeof element === 'string')
