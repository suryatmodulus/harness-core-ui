import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { Feature, PatchFeatureQueryParams, usePatchFeature } from 'services/cf'
import type { GitDetails } from './useGitSync'

export interface UseToggleFeatureFlagProps {
  accountIdentifier: string
  orgIdentifier: string
  environmentIdentifier: string
  projectIdentifier: string
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

export interface UseToggleFeatureFlag {
  on: (flagIdentifier: string, gitDetails?: GitDetails) => Promise<Feature>
  off: (flagIdentifier: string, gitDetails?: GitDetails) => Promise<Feature>
  loading: boolean
  error: string | undefined
}

export const useToggleFeatureFlag = ({
  accountIdentifier,
  orgIdentifier,
  environmentIdentifier,
  projectIdentifier
}: UseToggleFeatureFlagProps): UseToggleFeatureFlag => {
  const { mutate, loading, error } = usePatchFeature({
    identifier: '',
    queryParams: {
      project: projectIdentifier,
      environment: environmentIdentifier,
      account: accountIdentifier,
      accountIdentifier,
      org: orgIdentifier
    } as PatchFeatureQueryParams
  })

  return {
    on: (flagIdentifier: string, gitDetails?: GitDetails): Promise<Feature> =>
      mutate(makeInstruction(true, gitDetails), {
        pathParams: { identifier: flagIdentifier }
      }),
    off: (flagIdentifier: string, gitDetails?: GitDetails): Promise<Feature> =>
      mutate(makeInstruction(false, gitDetails), {
        pathParams: { identifier: flagIdentifier }
      }),
    loading,
    error: error?.message
  }
}
