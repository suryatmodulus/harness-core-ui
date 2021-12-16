import React, { useState } from 'react'
import { capitalize, parseInt } from 'lodash-es'
import { Layout, Container, PillToggle, Text, Button, ButtonVariation, TextInput, Color } from '@wings-software/uicore'
import { PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'

import css from './SubscriptionCalculatorModal.module.scss'

interface SubscriptionCalculatorProps {
  unitPrice: number
  supportPrice: number
  onReviewChange: () => void
}

const Header = (): React.ReactElement => {
  const [unit, setUnit] = useState<PLAN_UNIT>(PLAN_UNIT.MONTHLY)
  const { getString } = useStrings()
  return (
    <Layout.Horizontal padding={{ bottom: 'huge' }} spacing="small">
      <PillToggle
        className={css.monthlyYearly}
        selectedView={unit}
        options={[
          {
            label: capitalize(PLAN_UNIT.MONTHLY),
            value: PLAN_UNIT.MONTHLY
          },
          {
            label: capitalize(PLAN_UNIT.YEARLY),
            value: PLAN_UNIT.YEARLY
          }
        ]}
        onChange={val => {
          setUnit(val)
        }}
      />
      <Text>{getString('authSettings.savePaying')}</Text>
    </Layout.Horizontal>
  )
}

const ServicesInput = ({
  services,
  onChange
}: {
  services: number | undefined
  onChange: (event: React.FormEvent<HTMLInputElement>) => void
}): React.ReactElement => {
  const { getString } = useStrings()
  const servicesStr = services ? services.toString() : ''
  return (
    <Layout.Vertical>
      <Text font={{ weight: 'semi-bold' }} padding={{ bottom: 'medium' }}>
        {getString('services')}
      </Text>
      <TextInput value={servicesStr} onChange={onChange} />
    </Layout.Vertical>
  )
}

const UnitPrice = ({ unitPrice }: { unitPrice: number }): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text font={{ weight: 'semi-bold' }} padding={{ bottom: 'medium' }}>
        {getString('authSettings.unitPrice')}
      </Text>
      <Text padding={{ top: 'xsmall' }}>
        {unitPrice.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })}
      </Text>
    </Layout.Vertical>
  )
}

const Support = ({ supportPrice }: { supportPrice: number }): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical flex={{ alignItems: 'start' }}>
      <Text
        font={{ weight: 'semi-bold' }}
        rightIcon="info"
        rightIconProps={{ size: 12, color: Color.PRIMARY_6 }}
        padding={{ bottom: 'medium' }}
      >
        {getString('common.support')}
      </Text>
      <Text padding={{ top: 'xsmall' }}>
        {supportPrice.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })}
      </Text>
      <Text font={'xsmall'}>{getString('common.premiumSupport')}</Text>
      <Text font={'xsmall'} className={css.changeBtn} color={Color.PRIMARY_6}>
        {capitalize(getString('common.purpose.change'))}
      </Text>
    </Layout.Vertical>
  )
}

const NextPayment = ({ nextPayment }: { nextPayment: number | undefined }): React.ReactElement => {
  const { getString } = useStrings()
  const currencyNextPayment = nextPayment
    ? nextPayment
        .toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })
        .concat('/m')
    : nextPayment
  return (
    <Layout.Vertical>
      <Text font={{ weight: 'semi-bold' }} padding={{ bottom: 'medium' }}>
        {getString('authSettings.nextPayment')}
      </Text>
      <Text padding={{ top: 'xsmall' }}>{currencyNextPayment}</Text>
    </Layout.Vertical>
  )
}

const SignText = ({ text }: { text: string }): React.ReactElement => {
  return (
    <Text
      font={{ size: 'medium' }}
      padding={{ left: 'large', right: 'large', top: 'medium', bottom: 'small' }}
      flex={{ align: 'center-center' }}
    >
      {text}
    </Text>
  )
}

const Body = ({ unitPrice, supportPrice }: { unitPrice: number; supportPrice: number }): React.ReactElement => {
  const [services, setServices] = useState<number | undefined>()

  const nextPayment = services ? services * unitPrice + supportPrice : undefined

  return (
    <Layout.Horizontal padding={{ bottom: 'huge' }}>
      <ServicesInput
        services={services}
        onChange={event => {
          const value = event.currentTarget.value
          setServices(parseInt(value))
        }}
      />
      <SignText text={'x'} />
      <UnitPrice unitPrice={unitPrice} />
      <SignText text={'+'} />
      <Support supportPrice={supportPrice} />
      <SignText text={'='} />
      <NextPayment nextPayment={nextPayment} />
    </Layout.Horizontal>
  )
}

const Footer = ({ onReviewChange }: { onReviewChange: () => void }): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Button text={getString('authSettings.reviewChanges')} intent="primary" onClick={onReviewChange} />
      <Layout.Horizontal padding={{ left: 'large' }} flex={{ alignItems: 'baseline' }}>
        <Text>{getString('common.or')}</Text>
        <Button
          text={getString('common.banners.trial.contactSales')}
          variation={ButtonVariation.LINK}
          className={css.contactSalesBtn}
        />
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}

const SubscriptionCalculator = ({
  unitPrice,
  supportPrice,
  onReviewChange
}: SubscriptionCalculatorProps): React.ReactElement => {
  return (
    <Container padding={'huge'} className={css.calculator}>
      <Layout.Vertical>
        <Header />
        <Body unitPrice={unitPrice} supportPrice={supportPrice} />
        <Footer onReviewChange={onReviewChange} />
      </Layout.Vertical>
    </Container>
  )
}

export default SubscriptionCalculator
