import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useModalHook, Button, Layout } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { useGetSecret } from 'services/cd-ng'
import css from './usePlanModal.module.scss'

interface UseCheckoutFormProps {
  onCloseModal?: () => void
}

interface UseCheckoutFormReturn {
  openCheckoutForm: () => void
  closeCheckoutForm: () => void
}

const CheckoutForm = ({ secret }: { secret: string }): React.ReactElement => {
  const stripe = useStripe()
  const elements = useElements()

  // eslint-disable-next-line
  const handleSubmit = async event => {
    event.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    // eslint-disable-next-line
    const { error, loading } = await stripe?.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url:
          'https://localhost:8181/#/account/kmpySmUISimoRrJL6NL73w/settings/subscriptions?moduleCard=ci&&tab=PLANS&&succeed=true'
      }
    })
  }

  if (secret) {
    return (
      <form onSubmit={handleSubmit}>
        <Layout.Vertical spacing="large">
          <PaymentElement id="payment-element" />
          <button type="submit" disabled={!stripe}>
            Pay
          </button>
        </Layout.Vertical>
      </form>
    )
  }

  return <></>
}

const ElementForm = (): React.ReactElement => {
  const stripePromise = loadStripe(
    'pk_test_51IzYnIK1vsc7tc8yNAh69COkOQXcjfzfj5uewuyBX0CvD1zvmGi7Mmd6W7AfYgL0SKNZYxGAqA2TRrzL9zAxttbJ00CQZCuWuA'
  )

  // eslint-disable-next-line
  const clientSecret = useGetSecret({})?.data?.client_secret

  const [secret, setSecret] = useState<string | undefined>(undefined)
  const options = {
    // passing the client secret obtained from the server
    clientSecret: secret
  }

  useEffect(() => {
    if (clientSecret) {
      setSecret(clientSecret)
    }
  }, [clientSecret])

  return secret ? (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm secret={secret} />
    </Elements>
  ) : (
    <></>
  )
}

const useCheckoutForm = ({ onCloseModal }: UseCheckoutFormProps): UseCheckoutFormReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        onClose={() => {
          hideModal(), onCloseModal?.()
        }}
        className={cx(css.dialog, Classes.DIALOG, css.planForm)}
      >
        <ElementForm />
        <Button
          aria-label="close modal"
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal(), onCloseModal?.()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    []
  )

  return {
    openCheckoutForm: showModal,
    closeCheckoutForm: hideModal
  }
}

export default useCheckoutForm
