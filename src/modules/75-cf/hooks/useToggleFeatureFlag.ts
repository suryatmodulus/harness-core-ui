import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { PatchFeatureQueryParams, PatchOperation, usePatchFeature } from 'services/cf'

export interface UseToggleFeatureFlagProps {
  accountIdentifier: string
  orgIdentifier: string
  environmentIdentifier: string
  projectIdentifier: string
  flagIdentifier: string
}

const makeInstruction = (isOn: boolean, gitDetails: any) => {
  const instruction = {
    instructions: [
      {
        kind: 'setFeatureFlagState',
        parameters: {
          state: isOn ? FeatureFlagActivationStatus.ON : FeatureFlagActivationStatus.OFF
        }
      }
    ]
  }

  return gitDetails ? { ...instruction, gitDetails } : instruction
}

const getOnInstruction = (gitDetails?: any): PatchOperation => {
  return makeInstruction(true, gitDetails)
}

const getOffInstruction = (gitDetails?: any): PatchOperation => {
  return makeInstruction(false, gitDetails)
}

export const useToggleFeatureFlag = ({
  accountIdentifier,
  orgIdentifier,
  environmentIdentifier,
  projectIdentifier,
  flagIdentifier
}: UseToggleFeatureFlagProps) => {
  const { mutate } = usePatchFeature({
    identifier: flagIdentifier,
    queryParams: {
      project: projectIdentifier,
      environment: environmentIdentifier,
      account: accountIdentifier,
      accountIdentifier,
      org: orgIdentifier
    } as PatchFeatureQueryParams
  })

  return {
    on: (gitDetails?: any) => mutate(getOnInstruction(gitDetails)),
    off: (gitDetails?: any) => mutate(getOffInstruction(gitDetails))
  }
}
