import React, { ReactElement, useState } from 'react'
import { Layout, PageHeader, Button, ButtonVariation } from '@wings-software/uicore'
import { ManageSubscriptionBtn, WarningInfo } from './featureWarningUtil'
import type { FeatureInfoBannerProps } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

const FeatureWarningSubscriptionInfoBanner = ({ featureName, message }: FeatureInfoBannerProps): ReactElement => {
  const [display, setDisplay] = useState(true)

  const warningMessage = (
    <Layout.Horizontal spacing="small">
      <WarningInfo message={message} />
      <ManageSubscriptionBtn featureName={featureName} />
    </Layout.Horizontal>
  )

  if (!display) {
    return <></>
  }

  return (
    <PageHeader
      className={css.bgColorWhite}
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

export default FeatureWarningSubscriptionInfoBanner
