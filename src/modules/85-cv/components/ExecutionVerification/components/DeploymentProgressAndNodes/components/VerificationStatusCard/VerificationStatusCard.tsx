import React from 'react'
import { Container, Color } from '@wings-software/uicore'
import type { VerificationResult } from 'services/cv'
import { useStrings } from 'framework/strings'
import css from './VerificationStatusCard.module.scss'

export default function VerificationStatusCard({ status }: { status: VerificationResult['status'] }) {
  let statusMessage: string | undefined = undefined
  let color: Color | undefined = undefined
  let backgroundColor: Color | undefined = undefined
  const { getString } = useStrings()
  switch (status) {
    case 'IN_PROGRESS':
      statusMessage = getString('inProgress')
      color = Color.PRIMARY_2
      backgroundColor = Color.PRIMARY_6
      break
    case 'VERIFICATION_FAILED':
      statusMessage = getString('failed')
      color = Color.RED_500
      backgroundColor = Color.RED_200
      break
    case 'ERROR':
      statusMessage = getString('error')
      color = Color.RED_500
      backgroundColor = Color.RED_200
      break
    case 'VERIFICATION_PASSED':
      statusMessage = getString('passed')
      color = Color.GREEN_700
      backgroundColor = Color.GREEN_350
      break
    default:
      statusMessage = undefined
  }
  if (!statusMessage) {
    return null
  }
  return (
    <Container className={css.verificationStatusCard} color={color} background={backgroundColor}>
      {statusMessage}
    </Container>
  )
}
