import React, { ReactElement, useState } from 'react'
import { Layout, Page, Button, ButtonVariation } from '@wings-software/uicore'
import { ExplorePlansBtn, ViewUsageLink, UpgradeRequiredText } from './featureWarningUtil'
import type { FeatureInfoBannerProps } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

const FeatureWarningUpgradeBanner = ({ featureName, message }: FeatureInfoBannerProps): ReactElement => {
  const [display, setDisplay] = useState(true)

  const warningMessage = (
    <Layout.Horizontal spacing="small">
      <UpgradeRequiredText message={message} />
      <ViewUsageLink featureName={featureName} />
      <ExplorePlansBtn featureName={featureName} />
    </Layout.Horizontal>
  )

  if (!display) {
    return <></>
  }

  return (
    <Page.Header
      className={css.bgColorOrange}
      title={warningMessage}
      toolbar={
        <Button
          variation={ButtonVariation.ICON}
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            setDisplay(false)
          }}
        />
      }
      size="small"
    />
  )
}

export default FeatureWarningUpgradeBanner
