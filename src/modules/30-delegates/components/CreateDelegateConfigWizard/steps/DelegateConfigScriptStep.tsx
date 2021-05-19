import React, { useState } from 'react'
import { Button, Layout, Color, Container, Heading, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { dataObj } from '../CreateDelegateConfigWizard'

import css from './DelegateConfigSteps.module.scss'

interface DelegateConfigScopeStepProps {
  name: string
  previousStep?: (data: dataObj) => void
  nextStep?: (obj: dataObj) => void
  closeModal?: () => void
  onSuccess?: () => void
  prevStepData?: dataObj
}

const DelegateConfigScopeStep: React.FC<DelegateConfigScopeStepProps> = ({ previousStep, nextStep, prevStepData }) => {
  const { getString } = useStrings()
  const [script, setScript] = useState(prevStepData?.script || '')
  const onNext = () => {
    nextStep?.({ ...prevStepData, script })
  }
  const onPreviousStep = (): void => {
    previousStep?.({ ...prevStepData, script })
  }
  return (
    <Layout.Vertical className={css.stepContainer} padding="xxlarge">
      <Container>
        <Heading level={2} color={Color.GREY_800} margin={{ bottom: 'xxlarge' }}>
          {getString('delegates.newDelegateConfigWizard.scriptTitle')}
        </Heading>
        <Text>{getString('script')}</Text>
        <textarea className={css.scriptTextarea} onChange={event => setScript(event.target.value)} value={script} />
      </Container>
      <Layout.Horizontal spacing="xsmall">
        <Button type="button" text={getString('back')} onClick={onPreviousStep} />
        <Button type="button" intent="primary" text={getString('saveAndContinue')} onClick={onNext} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default DelegateConfigScopeStep
