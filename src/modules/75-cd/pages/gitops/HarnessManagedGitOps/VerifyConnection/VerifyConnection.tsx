/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from 'react'
import { Layout, Container, StepsProgress, Intent, Button, Icon, ButtonVariation } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import type { BaseProviderStepProps } from '../../types'
import css from './VerifyConnection.module.scss'

export enum Status {
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

type TestConnectionProps = BaseProviderStepProps

const yamlPath = 'harness-gitops-server.yaml'

export default function TestConnection(props: TestConnectionProps): React.ReactElement {
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.PROCESS)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const { getString } = useStrings()
  const handleSuccess = (): void => {
    props.onClose?.()
  }

  useEffect(() => {
    setCurrentStatus(Status.DONE)
    setCurrentIntent(Intent.PRIMARY)
  }, [])

  return (
    <Layout.Vertical className={css.stepContainer}>
      <div className={css.heading}>Verify Connection</div>

      <Container className={css.connectorForm}>
        <Container style={{ minHeight: 460 }}>
          <Layout.Vertical spacing="large" className={css.stepFormContainer}>
            <h4 className={css.selectConfigHeading}> Select your configuration type </h4>

            <div className={css.verifyYamlContainer}>
              <div className={css.yamlPath}>
                <label> {yamlPath} </label>
                <Icon name="copy-alt" intent="primary" />
              </div>
              <Button variation={ButtonVariation.SECONDARY} text={getString('verify')} data-name="verifyBtn" />
            </div>

            <StepsProgress
              steps={[
                'Heartbeat received',
                'GitOps agent installed',
                'Repo server installed',
                'Redis cache installed',
                'Application controller installed',
                'Initialization complete'
              ]}
              intent={currentIntent}
              current={6}
              currentStatus={currentStatus}
            />
          </Layout.Vertical>
        </Container>

        <Layout.Horizontal spacing="large">
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('finish')}
            onClick={handleSuccess}
            className={css.nextButton}
          />
        </Layout.Horizontal>
      </Container>
    </Layout.Vertical>
  )
}
