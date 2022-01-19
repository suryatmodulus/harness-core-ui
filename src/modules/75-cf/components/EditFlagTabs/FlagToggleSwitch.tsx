/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { FontVariation, Text } from '@wings-software/uicore'
import { Classes, Switch } from '@blueprintjs/core'
import cx from 'classnames'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import type { Feature, FeatureState } from 'services/cf'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { useFeature } from '@common/hooks/useFeatures'
import css from '../FlagActivation/FlagActivation.module.scss'

export interface FlagToggleSwitchProps {
  feature: Feature
  environmentIdentifier: string
  currentState: string
  currentEnvironmentState: FeatureState | undefined
  handleToggle: () => void
}

const FlagToggleSwitch = (props: FlagToggleSwitchProps): ReactElement => {
  const { environmentIdentifier, currentEnvironmentState, handleToggle, currentState } = props

  const { getString } = useStrings()

  const isFlagSwitchChanged = currentEnvironmentState !== currentState
  const switchOff = (currentState || FeatureFlagActivationStatus.OFF) === FeatureFlagActivationStatus.OFF

  const [canToggle] = usePermission(
    {
      resource: {
        resourceType: ResourceType.ENVIRONMENT,
        resourceIdentifier: environmentIdentifier
      },
      permissions: [PermissionIdentifier.TOGGLE_FF_FEATUREFLAG]
    },
    [environmentIdentifier]
  )

  const { isPlanEnforcementEnabled, isFreePlan } = usePlanEnforcement()

  const { enabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.MAUS
    }
  })

  const switchDisabled = isPlanEnforcementEnabled && !enabled && isFreePlan

  const getTooltip = (): ReactElement | undefined => {
    if (!canToggle) {
      return (
        <RBACTooltip permission={PermissionIdentifier.TOGGLE_FF_FEATUREFLAG} resourceType={ResourceType.ENVIRONMENT} />
      )
    } else if (switchDisabled) {
      return <FeatureWarningTooltip featureName={FeatureIdentifier.MAUS} />
    }

    return undefined
  }

  return (
    <>
      <Text tooltip={getTooltip()}>
        <Switch
          data-testid="flag-status-switch"
          onChange={handleToggle}
          alignIndicator="right"
          className={cx(Classes.LARGE, css.switch)}
          checked={currentState === FeatureFlagActivationStatus.ON}
          disabled={switchDisabled || !canToggle}
        />
      </Text>
      <Text font={{ variation: FontVariation.FORM_INPUT_TEXT }} padding={{ left: 'small' }}>
        {isFlagSwitchChanged
          ? getString(switchOff ? 'cf.featureFlags.flagWillTurnOff' : 'cf.featureFlags.flagWillTurnOn')
          : switchOff
          ? getString('cf.featureFlags.flagOff')
          : getString('cf.featureFlags.flagOn')}
      </Text>
    </>
  )
}

export default FlagToggleSwitch
