import React from 'react'
import { capitalize, parseInt } from 'lodash-es'
import { Layout, Container, PillToggle, Text, Button, ButtonVariation, TextInput, Color } from '@wings-software/uicore'
import { PLAN_UNIT } from '@common/constants/SubscriptionTypes'
import { useStrings } from 'framework/strings'

import css from './SubscriptionCalculatorModal.module.scss'

interface SubscriptionCalculatorProps {
  onReviewChange: () => void
  services?: number
  unit: PLAN_UNIT
  unitPrices: { count: number; price: number }[]
  supportPrice?: number
  setUnit: (unit: PLAN_UNIT) => void
  setServicesCount: (count: number) => void
}

const Header = ({ unit, setUnit }: { unit: PLAN_UNIT; setUnit: (value: PLAN_UNIT) => void }): React.ReactElement => {
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
  services?: number
  onChange: (event: React.FormEvent<HTMLInputElement>) => void
}): React.ReactElement => {
  const { getString } = useStrings()
  const servicesStr = services ? services.toString() : ''
  return (
    <Layout.Vertical>
      <Text font={{ weight: 'semi-bold' }} padding={{ bottom: 'medium' }}>
        {getString('common.developers')}
      </Text>
      <TextInput value={servicesStr} onChange={onChange} />
    </Layout.Vertical>
  )
}

const UnitPrice = ({ unitPrices }: { unitPrices: { count: number; price: number }[] }): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical>
      <Text font={{ weight: 'semi-bold' }} padding={{ bottom: 'medium' }}>
        {getString('authSettings.unitPrice')}
      </Text>
      {unitPrices.map(tierPrice => {
        const priceStr = `${tierPrice.count} * ${tierPrice.price.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })}`
        return (
          <Text key={tierPrice.price} padding={{ top: 'xsmall' }}>
            {priceStr}
          </Text>
        )
      })}
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

const NextPayment = ({
  nextPayment,
  unit
}: {
  nextPayment: number | undefined
  unit: PLAN_UNIT
}): React.ReactElement => {
  const { getString } = useStrings()
  const currencyNextPayment = nextPayment
    ? nextPayment
        .toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD'
        })
        .concat('/')
        .concat(unit.toLowerCase())
    : nextPayment
  return (
    <Layout.Vertical>
      <Text font={{ weight: 'semi-bold' }} padding={{ bottom: 'medium' }}>
        {getString('authSettings.recurringPayment')}
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

const Body = ({
  unitPrices,
  supportPrice,
  services,
  setServicesCount,
  unit
}: {
  unitPrices: { count: number; price: number }[]
  supportPrice?: number
  services?: number
  setServicesCount: (value: number) => void
  unit: PLAN_UNIT
}): React.ReactElement => {
  const productTotal = unitPrices.reduce((total, tierPrice) => {
    total = total + tierPrice.count * tierPrice.price
    return total
  }, 0)
  let nextPayment = productTotal
  if (supportPrice) {
    nextPayment = nextPayment + supportPrice
  }

  return (
    <Layout.Horizontal padding={{ bottom: 'huge' }}>
      <ServicesInput
        services={services}
        onChange={event => {
          const value = event.currentTarget.value
          setServicesCount(parseInt(value))
        }}
      />
      <SignText text={'x'} />
      <UnitPrice unitPrices={unitPrices} />
      {supportPrice && (
        <>
          <SignText text={'+'} />
          <Support supportPrice={supportPrice} />
        </>
      )}
      <SignText text={'='} />
      <NextPayment nextPayment={nextPayment} unit={unit} />
    </Layout.Horizontal>
  )
}

const Footer = ({
  onReviewChange,
  disableReviewChange
}: {
  onReviewChange: () => void
  disableReviewChange: boolean
}): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Button
        text={getString('common.reviewChanges')}
        intent="primary"
        onClick={onReviewChange}
        disabled={disableReviewChange}
      />
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
  onReviewChange,
  services,
  unitPrices,
  supportPrice,
  unit,
  setUnit,
  setServicesCount
}: SubscriptionCalculatorProps): React.ReactElement => {
  return (
    <Container padding={'huge'} className={css.calculator}>
      <Layout.Vertical>
        <Header unit={unit} setUnit={setUnit} />
        <Body
          services={services}
          setServicesCount={setServicesCount}
          unitPrices={unitPrices}
          supportPrice={supportPrice}
          unit={unit}
        />
        <Footer onReviewChange={onReviewChange} disableReviewChange={services === undefined} />
      </Layout.Vertical>
    </Container>
  )
}

export default SubscriptionCalculator
