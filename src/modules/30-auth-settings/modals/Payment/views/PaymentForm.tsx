import React from 'react'
import { PaymentElement, CardElement, Elements } from '@stripe/react-stripe-js'
import { Layout, Button } from '@wings-software/uicore'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  'pk_test_51IzYnIK1vsc7tc8yri9N5swmDxflQhIkAQbVxepcq1YoRlvUDgCJNGaoPCcSqyfOQt5tyRy4a3OBhezumJpPtm3100xKIx3aZ6'
)

const options = {
  // passing the client secret obtained in step 2
  clientSecret:
    'sk_secret_51IzYnIK1vsc7tc8y6jZOJZyWHApHYNQJdcfCYKkhkxM4fHz1VnyzoHb3UpgqEUSeKuNQQPWnJfJcw0OufgJlnCLa00Pk2IGjvr',
  // Fully customizable with appearance API.
  appearance: {
    /*...*/
  }
}

const PaymentForm: React.FC = () => {
  return (
    <Elements stripe={stripePromise} options={options}>
      <Layout.Vertical>
        <PaymentElement />
        <CardElement />
        <Button>{'submit'}</Button>
      </Layout.Vertical>
    </Elements>
  )
}

export default PaymentForm
