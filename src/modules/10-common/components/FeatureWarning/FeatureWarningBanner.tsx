import React, { ReactElement } from 'react'
import cx from 'classnames'
import { Color, FontVariation, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { FeatureDescriptor } from 'framework/featureStore/FeatureDescriptor'
import { WarningText } from './FeatureWarningWithTooltip'
import type { FeatureWarningProps } from './FeatureWarningWithTooltip'
import { ExplorePlansBtn } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

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
      <ExplorePlansBtn featureName={featureName} />
    </Layout.Horizontal>
  )
}

const FeatureWarningBanner = (props: FeatureWarningProps): ReactElement => {
  return (
    <Layout.Horizontal flex>
      <FeatureWarning {...props} />
    </Layout.Horizontal>
  )
}

export default FeatureWarningBanner
