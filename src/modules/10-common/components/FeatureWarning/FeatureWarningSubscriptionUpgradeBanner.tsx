import React, { ReactElement, useState } from 'react'
import { Layout, Page, Button, ButtonVariation } from '@wings-software/uicore'
import { UpgradeRequiredText, ManageSubscriptionBtn } from './featureWarningUtil'
import type { FeatureInfoBannerProps } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

const FeatureWarningSubscriptionUpgradeBanner = ({ featureName, message }: FeatureInfoBannerProps): ReactElement => {
  const [display, setDisplay] = useState(true)

  const warningMessage = (
    <Layout.Horizontal spacing="small">
      <UpgradeRequiredText message={message} />
      <ManageSubscriptionBtn featureName={featureName} />
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

export default FeatureWarningSubscriptionUpgradeBanner
