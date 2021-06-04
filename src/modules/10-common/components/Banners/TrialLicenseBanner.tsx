import React, { useState } from 'react'
import moment from 'moment'
import cx from 'classnames'
import { Text, Layout, Button, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ModuleName } from 'framework/types/ModuleName'
import type { StringsMap } from 'stringTypes'
import { useContactSalesModal, ContactSalesFormProps } from '@common/modals/ContactSales/useContactSalesModal'
import { Page } from '../Page/Page'
import css from './TrialLicenseBanner.module.scss'

interface TrialBannerProps {
  expiryTime?: number
  licenseType?: string
  module: ModuleName
}

export const TrialLicenseBanner = (trialBannerProps: TrialBannerProps): React.ReactElement => {
  const { getString } = useStrings()
  const [display, setDisplay] = useState(true)
  const { module, expiryTime, licenseType } = trialBannerProps
  const moduleName = module.toString().toLowerCase()
  const moduleDescription = getString(`${moduleName}.continuous` as keyof StringsMap)

  const days = Math.round(moment(expiryTime).diff(moment.now(), 'days', true))
  const isExpired = days < 0
  const expiredDays = Math.abs(days)
  const expiredClassName = isExpired ? css.expired : css.notExpired

  const alertMsg = isExpired ? (
    <Text font={{ weight: 'semi-bold' }} icon="info" iconProps={{ size: 18, color: Color.RED_500 }}>
      {getString('common.banners.trial.expired.description', {
        expiredDays,
        moduleDescription
      })}
    </Text>
  ) : (
    <Text font={{ weight: 'semi-bold' }} icon="info" iconProps={{ size: 18, color: Color.ORANGE_500 }}>
      {getString('common.banners.trial.description', {
        module,
        days,
        moduleDescription
      })}
    </Text>
  )

  const { openContactSalesModal } = useContactSalesModal({
    onSubmit: (_values: ContactSalesFormProps) => {
      // TO-DO: call the API
    }
  })

  if (licenseType !== 'TRIAL' || !display) {
    return <></>
  }

  return (
    <Page.Header
      className={cx(css.trialLicenseBanner, expiredClassName)}
      title={''}
      content={
        <Layout.Horizontal spacing="xxxlarge">
          <Layout.Horizontal spacing="small" padding={{ right: 'xxxlarge' }}>
            {alertMsg}
          </Layout.Horizontal>
          <Button
            className={css.contactSales}
            border={{ color: Color.PRIMARY_7 }}
            padding="xsmall"
            text={getString('common.banners.trial.contactSales')}
            onClick={openContactSalesModal}
          />
          {isExpired && (
            <Text padding={'small'} color={Color.PRIMARY_7} className={css.extendTrial}>
              {getString('common.banners.trial.expired.extendTrial')}
            </Text>
          )}
        </Layout.Horizontal>
      }
      toolbar={
        <Button
          aria-label="close banner"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => setDisplay(false)}
        />
      }
    />
  )
}
