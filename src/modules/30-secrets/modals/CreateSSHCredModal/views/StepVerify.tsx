import React from 'react'
import { StepProps, Container, Text, Color } from '@wings-software/uicore'

import { useStrings } from 'framework/exports'
import VerifyConnection from './VerifyConnection'
import type { SSHCredSharedObj } from '../CreateSSHCredWizard'

interface StepVerifyProps {
  closeModal?: () => void
}

const StepVerify: React.FC<StepProps<SSHCredSharedObj> & StepVerifyProps> = ({ prevStepData, closeModal }) => {
  const { getString } = useStrings()
  return (
    <Container padding="small" height={500}>
      <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('secrets.stepTitleVerify')}
      </Text>
      <VerifyConnection closeModal={closeModal} identifier={prevStepData?.detailsData?.identifier as string} />
    </Container>
  )
}

export default StepVerify
