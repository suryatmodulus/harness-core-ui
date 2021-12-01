import React, { ReactElement } from 'react'
import { isEmpty } from 'lodash-es'
import { ButtonSize, Color, FontVariation, Layout, Text, Popover } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { FeatureDescriptor, CustomFeatureDescriptor } from 'framework/featureStore/FeatureDescriptor'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { useFeatureRequiredPlans } from '@common/hooks/useFeatures'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { ExplorePlansBtn } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

interface FeatureWarningTooltipProps {
  featureName: FeatureIdentifier
}

export interface FeatureWarningProps {
  featureName: FeatureIdentifier
  warningMessage?: string
  className?: string
}

export interface ExplorePlansBtnProps {
  module?: Module
  size?: ButtonSize
}

interface WarningTextProps {
  tooltip?: ReactElement
}

export const WarningText = ({ tooltip }: WarningTextProps): ReactElement => {
  const { getString } = useStrings()
  return (
    <Popover interactionKind={PopoverInteractionKind.HOVER} content={tooltip} isDark position={'bottom'}>
      <Text
        className={css.warning}
        icon="flash"
        color={Color.ORANGE_800}
        font={{ variation: FontVariation.SMALL, weight: 'bold' }}
        iconProps={{ color: Color.ORANGE_800, padding: { right: 'small' }, size: 25 }}
      >
        {getString('common.feature.upgradeRequired.title').toUpperCase()}
      </Text>
    </Popover>
  )
}

export const FeatureWarningTooltip = ({ featureName }: FeatureWarningTooltipProps): ReactElement => {
  const { getString } = useStrings()
  const featureDescription = FeatureDescriptor[featureName] ? FeatureDescriptor[featureName] : featureName
  const customFeatureDescription = CustomFeatureDescriptor[featureName]
  const requiredPlans = useFeatureRequiredPlans(featureName)
  const requiredPlansStr = requiredPlans.join(' or ')
  return (
    <Layout.Vertical padding="medium" className={css.tooltip}>
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_800} padding={{ bottom: 'small' }}>
        {getString('common.feature.upgradeRequired.title')}
      </Text>
      <Layout.Vertical spacing="small">
        <Text font={{ size: 'small' }} color={Color.GREY_700}>
          {!customFeatureDescription && getString('common.feature.upgradeRequired.description')}
          {customFeatureDescription || featureDescription}
        </Text>
        {!customFeatureDescription && !isEmpty(requiredPlans) && (
          <Text font={{ size: 'small' }} color={Color.GREY_700}>
            {getString('common.feature.upgradeRequired.requiredPlans', { requiredPlans: requiredPlansStr })}
          </Text>
        )}
        <ExplorePlansBtn featureName={featureName} />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export const FeatureWarningWithTooltip = ({ featureName }: FeatureWarningProps): ReactElement => {
  const tooltip = <FeatureWarningTooltip featureName={featureName} />
  return <WarningText tooltip={tooltip} />
}
