import React, { ReactElement } from 'react'
import type { MutateMethod, MutateRequestOptions } from 'restful-react/dist/Mutate'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import type {
  DeleteFeatureFlagQueryParams,
  Feature,
  GitSyncPatchOperation,
  PatchFeaturePathParams,
  PatchFeatureQueryParams
} from 'services/cf'
import { PermissionIdentifier, ResourceType } from 'microfrontends'
import type { UseGitSync } from '@cf/hooks/useGitSync'
import useDeleteFlagModal from '../FlagActivation/hooks/useDeleteFlagModal'
import useEditFlagDetailsModal from '../FlagActivation/hooks/useEditFlagDetailsModal'

export interface FlagDetailsOptionsMenuButtonProps {
  featureFlag: Feature
  gitSync: UseGitSync
  refetchFlag: () => void
  deleteFeatureFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  submitPatch: MutateMethod<Feature, GitSyncPatchOperation, PatchFeatureQueryParams, PatchFeaturePathParams>
  queryParams: DeleteFeatureFlagQueryParams
}

const FlagDetailsOptionsMenuButton = (props: FlagDetailsOptionsMenuButtonProps): ReactElement => {
  const { featureFlag, gitSync, queryParams, refetchFlag, submitPatch, deleteFeatureFlag } = props

  const { getString } = useStrings()

  const { confirmDeleteFlag } = useDeleteFlagModal({ featureFlag, gitSync, queryParams, deleteFeatureFlag })

  const { openEditDetailsModal } = useEditFlagDetailsModal({
    featureFlag,
    gitSync,
    refetchFlag,
    submitPatch
  })

  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  return (
    <RbacOptionsMenuButton
      items={[
        {
          icon: 'edit',
          text: getString('edit'),
          onClick: openEditDetailsModal,
          permission: {
            resource: { resourceType: ResourceType.FEATUREFLAG },
            permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
          },
          ...planEnforcementProps
        },
        {
          icon: 'trash',
          text: getString('delete'),
          onClick: confirmDeleteFlag,
          permission: {
            resource: { resourceType: ResourceType.FEATUREFLAG },
            permission: PermissionIdentifier.DELETE_FF_FEATUREFLAG
          },
          ...planEnforcementProps
        }
      ]}
    />
  )
}

export default FlagDetailsOptionsMenuButton
