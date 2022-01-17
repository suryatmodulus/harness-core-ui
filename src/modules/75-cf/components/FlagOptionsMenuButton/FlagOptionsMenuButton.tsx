/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useModalHook, useToaster, Text } from '@wings-software/uicore'
import type { MutateRequestOptions } from 'restful-react/dist/Mutate'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { DeleteFeatureFlagQueryParams, Feature, GitSyncErrorResponse } from 'services/cf'
import { PermissionIdentifier, ResourceType } from 'microfrontends'
import { useConfirmAction } from '@common/hooks'
import { GitSyncFormValues, GIT_SYNC_ERROR_CODE, UseGitSync } from '@cf/hooks/useGitSync'
import { AUTO_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import { getErrorMessage, showToaster } from '@cf/utils/CFUtils'
import SaveFlagToGitModal from '../SaveFlagToGitModal/SaveFlagToGitModal'

export interface FlagOptionsMenuButtonProps {
  environment?: string
  flagData: Feature
  gitSync: UseGitSync
  deleteFlag: (
    data: string,
    mutateRequestOptions?: MutateRequestOptions<DeleteFeatureFlagQueryParams, void> | undefined
  ) => void
  queryParams: DeleteFeatureFlagQueryParams
  refetchFlags: () => void
}

const FlagOptionsMenuButton = (props: FlagOptionsMenuButtonProps): ReactElement => {
  const { environment, flagData, gitSync, deleteFlag, queryParams, refetchFlags } = props

  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { withActiveEnvironment } = useActiveEnvironment()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()

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

  const [showGitModal, hideGitModal] = useModalHook(() => {
    return (
      <SaveFlagToGitModal
        flagName={flagData.name}
        flagIdentifier={flagData.identifier}
        onSubmit={handleDeleteFlag}
        onClose={() => {
          hideGitModal()
        }}
      />
    )
  }, [flagData.name, flagData.identifier])

  const confirmDeleteFlag = useConfirmAction({
    title: getString('cf.featureFlags.deleteFlag'),
    confirmText: getString('delete'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{ __html: getString('cf.featureFlags.deleteFlagMessage', { name: flagData.name }) }}
        />
      </Text>
    ),
    action: async () => {
      if (gitSync?.isGitSyncEnabled && !gitSync?.isAutoCommitEnabled) {
        showGitModal()
      } else {
        handleDeleteFlag()
      }
    }
  })

  const handleDeleteFlag = async (gitSyncFormValues?: GitSyncFormValues): Promise<void> => {
    let commitMsg = ''

    if (gitSync.isGitSyncEnabled) {
      const { gitSyncInitialValues } = gitSync.getGitSyncFormMeta(AUTO_COMMIT_MESSAGES.DELETED_FLAG)

      if (gitSync.isAutoCommitEnabled) {
        commitMsg = gitSyncInitialValues.gitDetails.commitMsg
      } else {
        commitMsg = gitSyncFormValues?.gitDetails.commitMsg || ''
      }
    }

    try {
      clear()

      await deleteFlag(flagData.identifier, { queryParams: { ...queryParams, commitMsg } })

      if (gitSync.isGitSyncEnabled && gitSyncFormValues?.autoCommit) {
        await gitSync.handleAutoCommit(gitSyncFormValues?.autoCommit)
      }

      showToaster(getString('cf.messages.flagDeleted'))
      refetchFlags?.()
    } catch (error: any) {
      if (error.status === GIT_SYNC_ERROR_CODE) {
        gitSync.handleError(error.data as GitSyncErrorResponse)
      } else {
        showError(getErrorMessage(error), 0, 'cf.toggle.ff.status.error')
      }
    }
  }

  const gotoDetailPage = (): void => {
    history.push(
      withActiveEnvironment(
        routes.toCFFeatureFlagsDetail({
          orgIdentifier: orgIdentifier as string,
          projectIdentifier: projectIdentifier as string,
          featureFlagIdentifier: flagData.identifier,
          accountId
        }),
        environment
      )
    )
  }

  return (
    <RbacOptionsMenuButton
      items={[
        {
          icon: 'edit',
          text: getString('edit'),
          onClick: gotoDetailPage,
          permission: {
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: environment },
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

export default FlagOptionsMenuButton
