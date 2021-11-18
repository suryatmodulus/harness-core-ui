import React, { ReactElement, useState } from 'react'
import { Color, Layout, PageHeader, Text, Button, FontVariation, ButtonVariation } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { ExploreSaasPlansBtn } from './featureWarningUtil'
import css from './FeatureWarning.module.scss'

const WarningInfo = (): ReactElement => {
  const { getString } = useStrings()
  return (
    <Text
      icon="stars"
      color={Color.PRIMARY_10}
      font={{ variation: FontVariation.SMALL }}
      iconProps={{ color: Color.PRIMARY_7, padding: { right: 'small' }, size: 25 }}
    >
      {getString('common.onPremSaaSPlansMsg')}
    </Text>
  )
}

export const OnPremFeatureWarningInfoBanner = (): ReactElement => {
  const [display, setDisplay] = useState(true)

  const warningMessage = (
    <Layout.Horizontal spacing="small">
      <WarningInfo />
      <ExploreSaasPlansBtn />
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

export default OnPremFeatureWarningInfoBanner
