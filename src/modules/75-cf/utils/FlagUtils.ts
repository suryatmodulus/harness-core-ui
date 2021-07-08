import { Feature, PatchFeatureQueryParams, usePatchFeature } from 'services/cf'

export interface FlagPatchParams {
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
  environmentIdentifier: string
}

const makeInstruction = (kind: string, featureFlag: Feature, variation: string, targetIdentifiers: string[]) => {
  const removeInstructions: Array<{ kind: string; parameters: { variation: string; targets: string[] } }> = []
  const variationMap = featureFlag.envProperties?.variationMap

  // If there's some rules in variationMap for a target that about to be mapped with the featureMap
  // Remove those rules first before adding new rules
  variationMap?.forEach(({ targets: _targets, variation: _variation }) => {
    const removeTargetIdentifiers: string[] = []

    _targets
      ?.map(t => t.identifier as string)
      .forEach(_identifier => {
        if (targetIdentifiers.includes(_identifier)) {
          removeTargetIdentifiers.push(_identifier)
        }
      })

    if (removeTargetIdentifiers.length) {
      removeInstructions.push({
        kind: 'removeTargetsToVariationTargetMap',
        parameters: {
          variation: _variation,
          targets: removeTargetIdentifiers
        }
      })
    }
  })

  return {
    instructions: [
      ...removeInstructions,
      {
        kind,
        parameters: {
          variation,
          targets: targetIdentifiers
        }
      }
    ]
  }
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

    return (featureFlag: Feature, variation: any, targetIdentifiers: string[]) => {
      const body = makeInstruction(patchKind, featureFlag, variation, targetIdentifiers)

      return mutate(body, { pathParams: { identifier: featureFlag.identifier } })
    }
  }

export const useServeFeatureFlagVariationToTargets = makePatchHook('addTargetsToVariationTargetMap')

export const useRemoveFeatureFlagVariationFromTargets = makePatchHook('removeTargetsToVariationTargetMap')
