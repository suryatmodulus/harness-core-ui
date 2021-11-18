import React, { ReactElement } from 'react'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useHistory, useParams } from 'react-router-dom'
import { Button, ButtonSize, ButtonVariation, Color, FontVariation, Layout, Text } from '@wings-software/uicore'
import type { PopoverPosition } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { FeatureDescriptor } from 'framework/featureStore/FeatureDescriptor'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { useFeatureModule, useFeatureRequiredPlans } from '@common/hooks/useFeatures'
import type { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { ModuleType } from 'framework/featureStore/featureStoreUtil'
import css from './FeatureWarning.module.scss'

interface FeatureWarningTooltipProps {
  featureName: FeatureIdentifier
}

interface FeatureWarningProps {
  featureName: FeatureIdentifier
  warningMessage?: string
  className?: string
  tooltipProps?: {
    position: PopoverPosition
    [key: string]: string | boolean
  }
}

export interface ExplorePlansBtnProps {
  module?: Module
  size?: ButtonSize
}

interface WarningTextProps {
  tooltip?: ReactElement
  tooltipProps?: {
    position: PopoverPosition
    [key: string]: string | boolean
  }
}

const ExplorePlansBtn = ({ module, size }: ExplorePlansBtnProps): ReactElement => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  return (
    <Button
      variation={ButtonVariation.SECONDARY}
      size={size || ButtonSize.MEDIUM}
      onClick={() => history.push(routes.toSubscriptions({ accountId, moduleCard: module, tab: 'PLANS' }))}
    >
      {getString('common.explorePlans')}
    </Button>
  )
}

const WarningText = ({ tooltip, tooltipProps }: WarningTextProps): ReactElement => {
  const { getString } = useStrings()
  return (
    <Text
      className={css.warning}
      icon="warning-sign"
      color={Color.ORANGE_800}
      font={{ variation: FontVariation.TINY, weight: 'bold' }}
      iconProps={{ color: Color.ORANGE_800, padding: { right: 'small' }, size: 15 }}
      tooltip={tooltip}
      tooltipProps={tooltipProps}
    >
      {getString('common.feature.upgradeRequired.title').toUpperCase()}
    </Text>
  )
}

export const FeatureWarningTooltip = ({ featureName }: FeatureWarningTooltipProps): ReactElement => {
  const { getString } = useStrings()
  const featureDescription = FeatureDescriptor[featureName] ? FeatureDescriptor[featureName] : featureName
  const requiredPlans = useFeatureRequiredPlans(featureName)
  const requiredPlansStr = requiredPlans.join(' or ')
  const moduleType = useFeatureModule(featureName)
  const { CD_LICENSE_STATE, CI_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE } = useLicenseStore()
  const licenseStatus = {
    CD_LICENSE_STATE,
    CI_LICENSE_STATE,
    FF_LICENSE_STATE,
    CCM_LICENSE_STATE
  }
  const planModule = getPlanModule(licenseStatus, moduleType)

  return (
    <Layout.Vertical padding="medium" className={css.tooltip}>
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_800} padding={{ bottom: 'small' }}>
        {getString('common.feature.upgradeRequired.title')}
      </Text>
      <Layout.Vertical spacing="small">
        <Text font={{ size: 'small' }} color={Color.GREY_700}>
          {getString('common.feature.upgradeRequired.description')}
          {featureDescription}
        </Text>
        {!isEmpty(requiredPlans) && (
          <Text font={{ size: 'small' }} color={Color.GREY_700}>
            {getString('common.feature.upgradeRequired.requiredPlans', { requiredPlans: requiredPlansStr })}
          </Text>
        )}
        <ExplorePlansBtn module={planModule} />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export const FeatureWarningWithTooltip = ({ featureName, tooltipProps }: FeatureWarningProps): ReactElement => {
  const tooltip = <FeatureWarningTooltip featureName={featureName} />
  return <WarningText tooltip={tooltip} tooltipProps={{ position: 'bottom-left', ...tooltipProps }} />
}

export const FeatureWarning = ({ featureName, warningMessage, className }: FeatureWarningProps): ReactElement => {
  const { getString } = useStrings()
  const featureDescription = FeatureDescriptor[featureName] ? FeatureDescriptor[featureName] : featureName

  return (
    <Layout.Horizontal padding="small" spacing="small" className={cx(css.expanded, className)} flex>
      <WarningText />
      <Text font={{ variation: FontVariation.FORM_HELP }} color={Color.PRIMARY_10}>
        {warningMessage ? (
          warningMessage
        ) : (
          <>
            {getString('common.feature.upgradeRequired.description')} {featureDescription}
          </>
        )}
      </Text>
      <ExplorePlansBtn size={ButtonSize.SMALL} />
    </Layout.Horizontal>
  )
}

export const FeatureWarningBanner = (props: FeatureWarningProps): ReactElement => {
  return (
    <Layout.Horizontal flex className={css.warningBanner}>
      <FeatureWarning {...props} />
    </Layout.Horizontal>
  )
}

interface LicenseStatusProps {
  [key: string]: LICENSE_STATE_VALUES
}

function getPlanModule(licenseStatus: LicenseStatusProps, moduleType?: ModuleType): Module | undefined {
  switch (moduleType) {
    case 'CD':
    case 'CI':
    case 'CF':
    case 'CE':
      return moduleType.toLowerCase() as Module
    default:
      return getDefaultPlanModule(licenseStatus)
  }
}

function getDefaultPlanModule(licenseStatus: LicenseStatusProps): Module | undefined {
  const { CD_LICENSE_STATE, CI_LICENSE_STATE, FF_LICENSE_STATE, CCM_LICENSE_STATE } = licenseStatus
  if (CD_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
    return 'cd'
  }
  if (CI_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
    return 'ci'
  }
  if (FF_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
    return 'cf'
  }
  if (CCM_LICENSE_STATE === LICENSE_STATE_VALUES.ACTIVE) {
    return 'ce'
  }
  return undefined
}
