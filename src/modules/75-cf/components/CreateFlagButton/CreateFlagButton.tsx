/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useFeatureFlagTelemetry } from '@cf/hooks/useFeatureFlagTelemetry'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useStrings } from 'framework/strings'
import css from './CreateFlagButton.module.scss'

export interface CreateFlagButtonProps {
  disabled?: boolean
  showModal: () => void
}

const CreateFlagButton = (props: CreateFlagButtonProps): ReactElement => {
  const { disabled, showModal } = props

  const { getString } = useStrings()
  const events = useFeatureFlagTelemetry()
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
    <RbacButton
      data-testid="create-flag-button"
      disabled={disabled}
      text={getString('cf.featureFlags.newFlag')}
      intent="primary"
      onClick={() => {
        events.createFeatureFlagStart()
        showModal()
      }}
      className={css.openModalBtn}
      permission={{
        permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG,
        resource: { resourceType: ResourceType.FEATUREFLAG }
      }}
      {...planEnforcementProps}
    />
  )
}

export default CreateFlagButton
