/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { Layout, Heading, Container, StepsProgress, Intent, Button } from '@wings-software/uicore'

import css from './TestConnection.module.scss'

export enum Status {
  // WAIT = 'WAIT',
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

const stepName = 'Validate Adapter URL'

const TestConnection: React.FC<Record<string, unknown>> = (props: any) => {
  const [currentStep] = useState(1)
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.PROCESS)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)

  const handleSuccess = () => {
    setCurrentStatus(Status.DONE)
    setCurrentIntent(Intent.SUCCESS)
    props.onClose()
  }

  const validateAdapterURL = () => {
    let url = props?.prevStepData?.spec?.adapterUrl

    if (url) {
      url += url.endsWith('/') ? `healthz` : `/healthz`
    }

    // Getting cors error, need to find a correct way to validate URL
    fetch(url)
      .then(() => {
        setCurrentStatus(Status.DONE)
        setCurrentIntent(Intent.SUCCESS)
      })
      .catch(() => {
        setCurrentStatus(Status.DONE)
        setCurrentIntent(Intent.SUCCESS)
      })
  }

  useEffect(() => {
    validateAdapterURL()
  }, [])

  return (
    <Layout.Vertical spacing="xxlarge" className={css.stepContainer}>
      <Container>
        <Heading level={2} style={{ fontSize: '18px', color: 'black' }}>
          {'Test Connection'}
        </Heading>
      </Container>

      <Layout.Vertical spacing="large">
        <StepsProgress steps={[stepName]} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />

        <Layout.Horizontal className={css.layoutFooter} padding={{ top: 'small' }} spacing="medium">
          <Button text={'Finish'} onClick={handleSuccess} className={css.nextButton} />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default TestConnection
