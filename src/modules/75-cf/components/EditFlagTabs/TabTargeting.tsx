/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { FlexExpander, Layout } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { FeatureFlagActivationStatus } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import type { Feature } from 'services/cf'
import { TargetAttributesProvider } from '@cf/hooks/useTargetAttributes'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import CustomRulesView from './CustomRulesView'
import { DefaultRulesView } from './DefaultRulesView'
import type { FlagActivationFormValues } from '../FlagActivation/FlagActivation'
import FlagToggleSwitch from './FlagToggleSwitch'
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

  return (
    <TargetAttributesProvider
      project={projectIdentifier}
      org={org}
      accountIdentifier={accountIdentifier}
      environment={environmentIdentifier}
    >
      <Layout.Vertical padding={{ left: 'huge', right: 'large', bottom: 'large' }} spacing="medium">
        <Layout.Horizontal className={css.contentHeading} flex={{ alignItems: 'center' }}>
          <FlagToggleSwitch
            environmentIdentifier={environmentIdentifier}
            feature={feature}
            currentState={formikProps.values.state}
            currentEnvironmentState={feature.envProperties?.state}
            handleToggle={() =>
              formikProps.setFieldValue(
                'state',
                formikProps.values.state === FeatureFlagActivationStatus.OFF
                  ? FeatureFlagActivationStatus.ON
                  : FeatureFlagActivationStatus.OFF
              )
            }
          />
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
            {...planEnforcementProps}
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
