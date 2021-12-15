import React from 'react'
import { Layout, Button } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import css from './SubscriptionPayModal.module.scss'

const Footer = (): React.ReactElement => {
  const { getString } = useStrings()
  const terms = <String stringID="authSettings.terms" useRichText className={css.terms} />
  return (
    <Layout.Vertical spacing="small">
      <Button intent="primary" text={getString('authSettings.subscribeAndPay')} />
      {terms}
    </Layout.Vertical>
  )
}

const PaymentForm = (): React.ReactElement => {
  return <Layout.Vertical spacing="medium" height="80%"></Layout.Vertical>
}

const PaymentInfo = (): React.ReactElement => {
  return (
    <Layout.Vertical className={css.paymentInfo} padding={{ bottom: 'huge', top: 'huge', left: 'huge' }}>
      <PaymentForm />
      <Footer />
    </Layout.Vertical>
  )
}

export default PaymentInfo
