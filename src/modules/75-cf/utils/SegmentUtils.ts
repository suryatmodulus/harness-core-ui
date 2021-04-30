import { PatchSegmentQueryParams, usePatchSegment } from 'services/cf'

export interface TargetSegmentParams {
  accountIdentifier: string
  orgIdentifier: string
  environmentIdentifier: string
  projectIdentifier: string
}

const makeInstructions = (kind: string, targetIdentifiers: string[]) => ({
  instructions: [
    {
      kind,
      parameters: {
        targets: targetIdentifiers
      }
    }
  ]
})

const makeTargetsToSegmentHook = (patchKind: string) => ({
  accountIdentifier,
  orgIdentifier,
  environmentIdentifier,
  projectIdentifier
}: TargetSegmentParams) => {
  const { mutate } = usePatchSegment({
    identifier: '',
    queryParams: {
      account: accountIdentifier,
      accountIdentifier,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: environmentIdentifier
    } as PatchSegmentQueryParams
  })

  return (segmentIdentifier: string, targetIdentifiers: string[]) => {
    const body = makeInstructions(patchKind, targetIdentifiers)
    return mutate(body, { pathParams: { identifier: segmentIdentifier } })
  }
}

/** Add targets to an include segment list */
export const useAddTargetsToIncludeList = makeTargetsToSegmentHook('addToIncludeList')

/** Remove targets to an include segment list */
export const useRemoveTargetsFromIncludeList = makeTargetsToSegmentHook('removeFromIncludeList')

/** Add targets to an exclude segment list */
export const useAddTargetsToExcludeList = makeTargetsToSegmentHook('addToExcludeList')

/** Remove targets to an exclude segment list */
export const useRemoveTargetsFromExcludeList = makeTargetsToSegmentHook('removeFromExcludeList')
