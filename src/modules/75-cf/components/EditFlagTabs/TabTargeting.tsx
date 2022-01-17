/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { FlexExpander, Layout, Text } from '@wings-software/uicore'
import { Classes, Switch } from '@blueprintjs/core'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'
import { TargetAttributesProvider } from '@cf/hooks/useTargetAttributes'
import CustomRulesView from './CustomRulesView'
import { DefaultRulesView } from './DefaultRulesView'
import type { FlagActivationFormValues } from '../FlagActivation/FlagActivation'
import css from '../FlagActivation/FlagActivation.module.scss'

export interface TabTargetingProps {
  feature: Feature
  formikProps: FormikProps<FlagActivationFormValues>
  editing: boolean
  setEditing: (flag: boolean) => void
  environmentIdentifier: string
  projectIdentifier: string
  org: string
  accountIdentifier: string
}

const TabTargeting: React.FC<TabTargetingProps> = props => {
  const {
    feature,
    formikProps,
    editing,
    setEditing,
    environmentIdentifier,
    projectIdentifier,
    org,
    accountIdentifier
  } = props
  const [isEditRulesOn, setEditRulesOn] = useState(false)
  const { getString } = useStrings()
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

  useEffect(() => {
    if (!editing && isEditRulesOn) setEditRulesOn(false)
  }, [editing, isEditRulesOn])

  const onEditBtnHandler = (): void => {
    setEditRulesOn(!isEditRulesOn)
    setEditing(true)
  }

  const showCustomRules =
    editing ||
    (feature?.envProperties?.rules?.length || 0) > 0 ||
    (feature?.envProperties?.variationMap?.length || 0) > 0
  const isFlagSwitchChanged = feature.envProperties?.state !== formikProps.values.state
  const switchOff = (formikProps.values.state || FeatureFlagActivationStatus.OFF) === FeatureFlagActivationStatus.OFF

  const onChangeSwitchEnv = (_: string, _formikProps: FormikProps<FlagActivationFormValues>): void => {
    _formikProps.setFieldValue(
      'state',
      _formikProps.values.state === FeatureFlagActivationStatus.OFF
        ? FeatureFlagActivationStatus.ON
        : FeatureFlagActivationStatus.OFF
    )
  }

  return (
    <TargetAttributesProvider
      project={projectIdentifier}
      org={org}
      accountIdentifier={accountIdentifier}
      environment={environmentIdentifier}
    >
      <Layout.Vertical padding={{ left: 'huge', right: 'large', bottom: 'large' }} spacing="medium">
        <Layout.Horizontal className={css.contentHeading} flex={{ alignItems: 'center' }}>
          <Text
            tooltip={
              !canToggle ? (
                <RBACTooltip
                  permission={PermissionIdentifier.TOGGLE_FF_FEATUREFLAG}
                  resourceType={ResourceType.ENVIRONMENT}
                />
              ) : undefined
            }
          >
            <Switch
              data-testid="flag-status-switch"
              onChange={event => {
                onChangeSwitchEnv(event.currentTarget.value, formikProps)
              }}
              alignIndicator="right"
              className={cx(Classes.LARGE, css.switch)}
              checked={formikProps.values.state === FeatureFlagActivationStatus.ON}
              disabled={feature.archived || !canToggle}
            />
          </Text>
          <Text style={{ fontSize: '12px', color: '#6B6D85' }} padding={{ left: 'small' }}>
            {isFlagSwitchChanged
              ? getString(switchOff ? 'cf.featureFlags.flagWillTurnOff' : 'cf.featureFlags.flagWillTurnOn')
              : switchOff
              ? getString('cf.featureFlags.flagOff')
              : getString('cf.featureFlags.flagOn')}
          </Text>
          <FlexExpander />
          <RbacButton
            text={getString('cf.featureFlags.rules.editRules')}
            icon="edit"
            onClick={onEditBtnHandler}
            style={{
              visibility: isEditRulesOn ? 'hidden' : undefined
            }}
            disabled={feature.archived}
            permission={{
              resource: {
                resourceType: ResourceType.ENVIRONMENT,
                resourceIdentifier: environmentIdentifier
              },
              permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
            }}
          />
        </Layout.Horizontal>

        <Layout.Vertical spacing="medium">
          <DefaultRulesView formikProps={formikProps} editing={isEditRulesOn} variations={feature.variations} />
          {showCustomRules && (
            <CustomRulesView
              feature={feature}
              editing={isEditRulesOn}
              formikProps={formikProps}
              environment={environmentIdentifier}
              project={projectIdentifier}
            />
          )}
        </Layout.Vertical>
      </Layout.Vertical>
    </TargetAttributesProvider>
  )
}

export default TabTargeting
