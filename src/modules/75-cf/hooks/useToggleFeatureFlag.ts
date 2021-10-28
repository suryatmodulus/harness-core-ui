import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { PatchFeatureQueryParams, usePatchFeature } from 'services/cf'
import type { GitDetails } from './useGitSync'

export interface UseToggleFeatureFlagProps {
  accountIdentifier: string
  orgIdentifier: string
  environmentIdentifier: string
  projectIdentifier: string
  flagIdentifier: string
}

const makeInstruction = (isOn: boolean, gitDetails?: GitDetails) => {
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
    on: (gitDetails?: GitDetails) => mutate(makeInstruction(true, gitDetails)),
    off: (gitDetails?: GitDetails) => mutate(makeInstruction(false, gitDetails))
  }
}
