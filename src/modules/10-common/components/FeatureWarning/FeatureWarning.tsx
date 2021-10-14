import React, { ReactElement } from 'react'
import cx from 'classnames'
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import { Color, Layout, Text } from '@wings-software/uicore'
import type { PopoverPosition } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import css from './FeatureWarning.module.scss'

interface FeatureWarningTooltipProps {
  featureName: string
  module?: Module
}

interface FeatureWarningProps {
  featureName: string
  module?: Module
  className?: string
  tooltipProps?: {
    position: PopoverPosition
    [key: string]: string | boolean
  }
}

export interface ExplorePlansBtnProps {
  module?: Module
}

interface WarningTextProps {
  tooltip?: ReactElement
  tooltipProps?: {
    position: PopoverPosition
    [key: string]: string | boolean
  }
}

const ExplorePlansBtn = ({ module }: ExplorePlansBtnProps): ReactElement => {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  return (
    <Text
      className={css.explorePlans}
      onClick={() => history.push(routes.toSubscriptions({ accountId, moduleCard: module, tab: 'PLANS' }))}
      color={Color.PRIMARY_6}
    >
      {getString('common.explorePlans')}
    </Text>
  )
}

const WarningText = ({ tooltip, tooltipProps }: WarningTextProps): ReactElement => {
  const { getString } = useStrings()
  return (
    <Text
      className={css.warning}
      padding={{ top: 'small' }}
      icon="warning-sign"
      color={Color.ORANGE_800}
      font={{ weight: 'semi-bold' }}
      iconProps={{ color: Color.ORANGE_800, padding: { right: 'small' } }}
      tooltip={tooltip}
      tooltipProps={tooltipProps}
    >
      {getString('common.feature.upgradeRequired.title').toUpperCase()}
    </Text>
  )
}

export const FeatureWarningTooltip = ({ featureName, module }: FeatureWarningTooltipProps): ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical padding="medium" className={css.tooltip}>
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_800} padding={{ bottom: 'small' }}>
        {getString('common.feature.upgradeRequired.title')}
      </Text>
      <Layout.Vertical spacing="small">
        <Text font={{ size: 'small' }} color={Color.GREY_700}>
          {getString('common.feature.upgradeRequired.description', { featureName: featureName })}
        </Text>
        <ExplorePlansBtn module={module} />
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export const FeatureWarningWithTooltip = ({ featureName, module, tooltipProps }: FeatureWarningProps): ReactElement => {
  const tooltip = <FeatureWarningTooltip featureName={featureName} module={module} />
  return <WarningText tooltip={tooltip} tooltipProps={{ position: 'bottom-left', ...tooltipProps }} />
}

export const FeatureWarning = ({ module, featureName, className }: FeatureWarningProps): ReactElement => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal
      padding="small"
      spacing="small"
      className={cx(css.expanded, className)}
      flex={{ alignItems: 'baseline' }}
    >
      <WarningText />
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_800}>
        {getString('common.feature.upgradeRequired.description', { featureName: featureName })}
      </Text>
      <ExplorePlansBtn module={module} />
    </Layout.Horizontal>
  )
}
