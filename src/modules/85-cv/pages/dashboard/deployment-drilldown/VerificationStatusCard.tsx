import React from 'react'
import { Container, Color } from '@wings-software/uicore'
import type { VerificationResult } from 'services/cv'
import { useStrings } from 'framework/exports'
import styles from './DeploymentDrilldownView.module.scss'

export default function VerificationStatusCard({ status }: { status: VerificationResult['status'] }) {
  let statusMessage: string | undefined = undefined
  let color: Color | undefined = undefined
  let backgroundColor: Color | undefined = undefined
  const { getString } = useStrings()
  switch (status) {
    case 'IN_PROGRESS':
      statusMessage = getString('inProgress')
      color = Color.BLUE_500
      backgroundColor = Color.BLUE_350
      break
    case 'VERIFICATION_FAILED':
      statusMessage = getString('failed')
      color = Color.RED_500
      backgroundColor = Color.RED_350
      break
    case 'ERROR':
      statusMessage = getString('error')
      color = Color.RED_500
      backgroundColor = Color.RED_350
      break
    case 'VERIFICATION_PASSED':
      statusMessage = getString('passed')
      color = Color.GREEN_500
      backgroundColor = Color.GREEN_350
      break
    default:
      statusMessage = undefined
  }
  if (!statusMessage) {
    return null
  }
  return (
    <Container className={styles.verificationStatusCard} color={color} background={backgroundColor}>
      {statusMessage}
    </Container>
  )
}
