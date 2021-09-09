/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { Layout, Heading, Container, StepsProgress, Intent, Button, ButtonVariation } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
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

  const { getString } = useStrings()
  const handleSuccess = () => {
    props.onClose()
  }

  const validateAdapterURL = () => {
    let url = props?.prevStepData?.spec?.adapterUrl

    if (url) {
      url += url.endsWith('/') ? `api/version` : `/api/version`
    }

    fetch(url)
      .then(() => {
        setCurrentStatus(Status.DONE)
        setCurrentIntent(Intent.SUCCESS)
      })
      .catch(() => {
        setCurrentStatus(Status.ERROR)
        setCurrentIntent(Intent.DANGER)
      })
  }

  useEffect(() => {
    validateAdapterURL()
  }, [])

  return (
    <Layout.Vertical spacing="xxlarge" className={classNames(css.stepContainer, css.fullHeight)}>
      <Container>
        <Heading level={2} style={{ fontSize: '18px', color: 'black' }}>
          {'Test Connection'}
        </Heading>
      </Container>

      <Layout.Vertical spacing="large" className={css.stepFormContainer}>
        <StepsProgress steps={[stepName]} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />

        <Layout.Horizontal className={css.layoutFooter} padding={{ top: 'small' }} spacing="medium">
          {currentStatus === Status.ERROR && (
            <Button
              variation={ButtonVariation.SECONDARY}
              text={getString('back')}
              icon="chevron-left"
              onClick={() => props?.previousStep?.(props?.prevStepData)}
              data-name="commonGitBackButton"
            />
          )}
          <Button
            variation={currentStatus === Status.ERROR ? ButtonVariation.PRIMARY : ButtonVariation.SECONDARY}
            text={getString('finish')}
            onClick={handleSuccess}
            className={css.nextButton}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default TestConnection
