import React, { useState } from 'react'
import type { Stripe } from '@stripe/stripe-js'
import type { MutateMethod } from 'restful-react'
import { PaymentElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js'
import {
  Layout,
  Button,
  Text,
  FontVariation,
  Container,
  Select,
  RadioGroup,
  Radio,
  useToaster
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type {
  ResponseSubscriptionDetailDTO,
  SubscriptionDetailDTO,
  SubscriptionDTO,
  UpdateSubscriptionQueryParams,
  UpdateSubscriptionPathParams,
  PaymentMethodCollectionDTO
} from 'services/cd-ng'
import type { NewSubscribeProps } from './useSubscribePayModal'
import css from './SubscriptionPayModal.module.scss'

interface PaymentInfoFormProps {
  selectedPayment: string
  selectItems: {
    label: string
    value: string
  }[]
  setSelectedPayment: (value: string) => void
  isSelect: boolean
  setIsSelect: (value: boolean) => void
}

interface PaymentInfoProps {
  onClose: () => void
  paySources?: PaymentMethodCollectionDTO
  clientSecret: string
  subscription?: SubscriptionDetailDTO
  newSubscribeProps?: NewSubscribeProps[]
  updateSubscription: MutateMethod<
    ResponseSubscriptionDetailDTO,
    SubscriptionDTO,
    UpdateSubscriptionQueryParams,
    UpdateSubscriptionPathParams
  >
  stripe: Promise<Stripe | null>
}

interface FooterProps {
  onClose: () => void
  isSelect: boolean
  paymentId: string
  clientSecret?: string
  subscription?: SubscriptionDetailDTO
  newSubscribeProps?: NewSubscribeProps[]
  updateSubscription: MutateMethod<
    ResponseSubscriptionDetailDTO,
    SubscriptionDTO,
    UpdateSubscriptionQueryParams,
    UpdateSubscriptionPathParams
  >
}

const Footer = ({
  onClose,
  isSelect,
  paymentId,
  clientSecret,
  subscription,
  newSubscribeProps,
  updateSubscription
}: FooterProps): React.ReactElement => {
  const stripe = useStripe()
  const elements = useElements()
  const { showError, showSuccess } = useToaster()

  async function handlePayment(event: React.MouseEvent<Element, MouseEvent>): Promise<void> {
    event.preventDefault()
    if (!stripe || !elements || !clientSecret) {
      // Stripe.js has not yet loaded.
      return
    }

    if (subscription?.status === 'active' && newSubscribeProps) {
      updateSubscription({
        customerId: subscription.customerId,
        moduleType: subscription.moduletype,
        items: newSubscribeProps
      })
        .then(() => {
          showSuccess('Congrats!')
        })
        .catch(err => {
          // showError(err?.message)
        })
        .finally(() => {
          onClose()
        })
    }

    // eslint-disable-next-line
    if (!isSelect) {
      // with a new credit card info
      stripe
        .confirmPayment({
          elements,
          confirmParams: {
            return_url:
              'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/settings/subscriptions?moduleCard=ci&&tab=PLANS&&succeed=true'
          }
        })
        .then(() => {
          window.location.href =
            'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/settings/subscriptions?moduleCard=ci&&tab=PLANS&&succeed=true'
        })
    } else {
      // with selected payment method from dropdown list
      if (clientSecret) {
        stripe
          .confirmCardPayment(clientSecret, {
            payment_method: paymentId
          })
          .then(() => {
            window.location.href =
              'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/settings/subscriptions?moduleCard=ci&&tab=PLANS&&succeed=true'
          })
      }
    }
  }

  const { getString } = useStrings()
  return (
    <Layout.Horizontal padding={{ top: 'medium' }}>
      <Button
        intent="primary"
        text={getString('authSettings.subscribeAndPay')}
        onClick={handlePayment}
        padding={{ top: 'huge' }}
        width={300}
      />
    </Layout.Horizontal>
  )
}

const PaymentForm = ({
  isSelect,
  setIsSelect,
  selectItems,
  setSelectedPayment,
  selectedPayment
}: PaymentInfoFormProps): React.ReactElement => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical padding={{ left: 'huge' }}>
      <RadioGroup>
        <Radio
          label={getString('authSettings.selectPayment')}
          onClick={() => {
            setIsSelect(true)
          }}
          checked={isSelect}
        />
        {isSelect && (
          <Select
            items={selectItems}
            value={selectItems.find(item => item.value === selectedPayment)}
            onChange={e => {
              setSelectedPayment(e.value as string)
            }}
          />
        )}
        <Radio
          label={getString('authSettings.addNewPayment')}
          onClick={() => {
            setIsSelect(false)
          }}
          checked={!isSelect}
          padding={{ top: 'medium', bottom: 'xsmall' }}
        />
        {!isSelect && <PaymentElement id="payment-element" />}
      </RadioGroup>
    </Layout.Vertical>
  )
}

const PaymentInfo = ({
  onClose,
  paySources,
  clientSecret,
  updateSubscription,
  subscription,
  newSubscribeProps,
  stripe
}: PaymentInfoProps): React.ReactElement => {
  const { getString } = useStrings()
  const selectItems: { label: string; value: string }[] = paySources?.paymentMethods?.reduce((acc, source) => {
    if (source.last4 && source.id) {
      acc.push({ label: source.last4, value: source.id })
    }
    return acc
  }, [])
  const [selectedPayment, setSelectedPayment] = useState<string>('')
  const [isSelect, setIsSelect] = useState<boolean>(true)
  const options = {
    // passing the client secret obtained from the server
    clientSecret
  }
  return (
    <Elements stripe={stripe} options={options}>
      <Container>
        <Layout.Horizontal padding={{ top: 'huge', left: 'huge' }}>
          <Text font={{ variation: FontVariation.FORM_TITLE }} padding={{ top: 'huge' }}>
            {getString('authSettings.paymentDetails')}
          </Text>
        </Layout.Horizontal>

        <Layout.Vertical
          className={css.paymentInfo}
          padding={{ top: 'huge', left: 'huge', bottom: 'huge' }}
          flex={{ justifyContent: 'space-between', alignItems: 'start' }}
        >
          <PaymentForm
            setIsSelect={setIsSelect}
            isSelect={isSelect}
            selectItems={selectItems}
            selectedPayment={selectedPayment}
            setSelectedPayment={setSelectedPayment}
          />
          <Layout.Horizontal>
            <Footer
              isSelect={isSelect}
              paymentId={selectedPayment}
              clientSecret={clientSecret}
              subscription={subscription}
              updateSubscription={updateSubscription}
              newSubscribeProps={newSubscribeProps}
              onClose={onClose}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      </Container>
    </Elements>
  )
}

export default PaymentInfo
