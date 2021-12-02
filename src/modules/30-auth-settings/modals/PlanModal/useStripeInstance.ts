import { loadStripe, Stripe } from '@stripe/stripe-js'

export function useStripeInstance(): Promise<Stripe | null> {
  const stripe = loadStripe(
    'pk_test_51IzYnIK1vsc7tc8yNAh69COkOQXcjfzfj5uewuyBX0CvD1zvmGi7Mmd6W7AfYgL0SKNZYxGAqA2TRrzL9zAxttbJ00CQZCuWuA'
  )
  return stripe
}
