/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  Layout,
  StepProps,
  StepsProgress,
  Intent,
  Heading,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useGetTestConnectionResult } from 'services/cd-ng'
import css from '../CreateCeAwsConnector.module.scss'

enum Status {
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

interface TestConnectionProps extends StepProps<ConnectorInfoDTO> {
  onClose?: () => void
}

const TestConnection: React.FC<TestConnectionProps> = props => {
  const { getString } = useStrings()

  const { prevStepData } = props
  const { accountId } = useParams<{
    accountId: string
  }>()
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.ERROR)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const steps: string[] = [
    getString('connectors.ceAws.testConnection.step1'),
    getString('connectors.ceAws.testConnection.step2'),
    getString('connectors.ceAws.testConnection.step3')
  ]

  const { mutate: testConnection } = useGetTestConnectionResult({
    identifier: prevStepData?.identifier || '',
    queryParams: {
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const verifyTestConnection = async (): Promise<void> => {
    try {
      setCurrentStatus(Status.PROCESS)
      const result = await testConnection()
      if (result.data?.status === 'SUCCESS') {
        setCurrentIntent(Intent.SUCCESS)
        setCurrentStatus(Status.DONE)
        setCurrentStep(3)
      } else {
        throw new Error('connectors.ceAws.testConnection.error')
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message)
      setCurrentStatus(Status.ERROR)
      setCurrentIntent(Intent.DANGER)
    }
  }
  useEffect(() => {
    verifyTestConnection()
  }, [])

  return (
    <Layout.Vertical className={css.stepContainer}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAws.testConnection.heading')}
      </Heading>
      <StepsProgress steps={steps} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />
      <Button
        type="submit"
        intent="primary"
        text={'Finish'}
        rightIcon="chevron-right"
        className={css.submitBtn}
        onClick={() => {
          props.onClose?.()
        }}
      />
    </Layout.Vertical>
  )
}

export default TestConnection
