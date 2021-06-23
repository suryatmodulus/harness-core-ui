import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router'
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
import type { ConnectorInfoDTO, ConnectorConfigDTO } from 'services/cd-ng'
import { useGetTestConnectionResult } from 'services/cd-ng'
import css from '../../CreateCeAzureConnector_new.module.scss'

enum Status {
  PROCESS = 'PROCESS',
  DONE = 'DONE',
  ERROR = 'ERROR'
}

export interface TestConnectionProps extends ConnectorConfigDTO {
  onClose?: () => void
}

const TestConnection: React.FC<StepProps<ConnectorInfoDTO> & TestConnectionProps> = props => {
  const { prevStepData } = props
  const { accountId } = useParams<{
    accountId: string
  }>()
  const [currentStatus, setCurrentStatus] = useState<Status>(Status.ERROR)
  const [currentIntent, setCurrentIntent] = useState<Intent>(Intent.NONE)
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const { getString } = useStrings()
  const steps: string[] = [
    getString('connectors.ceAzure.testConnection.validatePermission'),
    getString('connectors.ceAzure.testConnection.verifyExport')
  ]

  const { mutate: testConnection } = useGetTestConnectionResult({
    identifier: prevStepData?.identifier || '',
    queryParams: { accountIdentifier: accountId },
    requestOptions: {
      headers: { 'content-type': 'application/json' }
    }
  })

  const verifyOptimizationPermissions = async (): Promise<void> => {
    try {
      setCurrentStatus(Status.PROCESS)
      const result = await testConnection()
      if (result.data?.status !== 'SUCCESS') {
        throw new Error("Couldn't verify the connection")
      }

      setCurrentIntent(Intent.SUCCESS)
      setCurrentStatus(Status.DONE)
      setCurrentStep(2)
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.errorSummary || e.message)
      setCurrentStatus(Status.ERROR)
      setCurrentIntent(Intent.DANGER)
    }
  }
  useEffect(() => {
    verifyOptimizationPermissions()
  }, [])

  return (
    <Layout.Vertical className={css.stepContainer}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAzure.testConnection.heading')}
      </Heading>
      <StepsProgress steps={steps} intent={currentIntent} current={currentStep} currentStatus={currentStatus} />
      <Button
        intent="primary"
        text={getString('finish')}
        rightIcon="chevron-right"
        className={css.continueAndPreviousBtns}
        onClick={() => props.onClose?.()}
      />
    </Layout.Vertical>
  )
}

export default TestConnection
