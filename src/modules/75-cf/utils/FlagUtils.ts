import { Feature, GitDetails, PatchFeatureQueryParams, usePatchFeature } from 'services/cf'

export interface FlagPatchParams {
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
  environmentIdentifier: string
}

const makeInstruction = (kind: string, variation: string, targetIdentifiers: string[], gitDetails?: GitDetails) => {
  const instructions = {
    instructions: [
      {
        kind,
        parameters: {
          variation,
          targets: targetIdentifiers
        }
      }
    ]
  }

  return gitDetails ? { ...instructions, gitDetails } : instructions
}

const makePatchHook =
  (patchKind: string) =>
  ({ accountIdentifier, orgIdentifier, projectIdentifier, environmentIdentifier }: FlagPatchParams) => {
    const { mutate } = usePatchFeature({
      identifier: '',
      queryParams: {
        account: accountIdentifier,
        accountIdentifier,
        org: orgIdentifier,
        project: projectIdentifier,
        environment: environmentIdentifier
      } as PatchFeatureQueryParams
    })

    return (featureFlag: Feature, variation: any, targetIdentifiers: string[], gitDetails?: GitDetails) => {
      const body = makeInstruction(patchKind, variation, targetIdentifiers, gitDetails)

      return mutate(body, { pathParams: { identifier: featureFlag.identifier } })
    }
  }

export const useServeFeatureFlagVariationToTargets = makePatchHook('addTargetsToVariationTargetMap')

export const useRemoveFeatureFlagVariationFromTargets = makePatchHook('removeTargetsToVariationTargetMap')
