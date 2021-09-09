import React, { useState } from 'react'
import { useParams } from 'react-router'
import { pick } from 'lodash-es'
import {
  Button,
  Container,
  Heading,
  Layout,
  StepProps,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Icon
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGcpserviceaccount } from 'services/ce'
import { useCreateConnector, useUpdateConnector, Failure } from 'services/cd-ng'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import type { CEGcpConnectorDTO } from './OverviewStep'
import css from '../CreateCeGcpConnector.module.scss'

const GrantPermission: React.FC<StepProps<CEGcpConnectorDTO>> = props => {
  const { getString } = useStrings()

  const { accountId } = useParams<{
    accountId: string
  }>()
  const { prevStepData, nextStep, previousStep } = props
  const [isSubmitLoading, setIsSubmitLoading] = useState<boolean>(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const { mutate: createConnector } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  const { data, loading: loadingServiceAccount } = useGcpserviceaccount({
    queryParams: { accountIdentifier: accountId }
  })
  const serviceAccount = data?.data

  const handleSubmit = async () => {
    setIsSubmitLoading(true)

    try {
      if (prevStepData) {
        const connectorInfo: CEGcpConnectorDTO = {
          ...pick(prevStepData, ['name', 'identifier', 'description', 'tags', 'spec', 'type'])
        }

        const response = await (prevStepData.isEditMode
          ? updateConnector({ connector: connectorInfo })
          : createConnector({ connector: connectorInfo }))

        if (response.status !== 'SUCCESS') {
          throw response as Failure
        }

        nextStep?.(prevStepData)
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e?.data?.message)
    }
    setIsSubmitLoading(false)
  }

  const handlePrev = () => {
    previousStep?.({ ...(prevStepData as CEGcpConnectorDTO) })
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceGcp.grantPermission.heading')}
      </Heading>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <ol className={css.grantPermissionSteps}>
        <li>
          <Layout.Vertical spacing="small">
            <div>{getString('connectors.ceGcp.grantPermission.step1')}</div>
            <Button
              className={css.bigQueryPage}
              text={getString('connectors.ceGcp.grantPermission.bigQueryButtonText')}
              rightIcon="chevron-right"
              onClick={() => {
                window.open('https://console.aws.amazon.com/console/home')
              }}
            />
          </Layout.Vertical>
        </li>
        <li>
          <div>{getString('connectors.ceGcp.grantPermission.step2')}</div>
        </li>
        <li>
          <div>{getString('connectors.ceGcp.grantPermission.step3')}</div>
        </li>
        <li>
          <div>{getString('connectors.ceGcp.grantPermission.step4')}</div>
        </li>
        <li>
          <Layout.Vertical spacing="small">
            <div>{getString('connectors.ceGcp.grantPermission.step5')}</div>
            <Container className={css.commandsContainer}>
              <Container className={css.command}>
                {loadingServiceAccount ? <Loader /> : <pre>{serviceAccount}</pre>}
                <CopyToClipboard showFeedback content={'harness-ce-harness-kmpys@ccm-play.iam.gserviceaccount.com'} />
              </Container>
            </Container>
          </Layout.Vertical>
        </li>
        <li>
          <div>{getString('connectors.ceGcp.grantPermission.step6')}</div>
        </li>
        <li>
          <div>{getString('connectors.ceGcp.grantPermission.step7')}</div>
        </li>
      </ol>

      <Layout.Horizontal className={css.buttonPanel} spacing="small">
        <Button text={getString('previous')} icon="chevron-left" onClick={handlePrev} disabled={isSubmitLoading} />
        <Button
          type="submit"
          intent="primary"
          text={getString('continue')}
          rightIcon="chevron-right"
          onClick={handleSubmit}
          disabled={isSubmitLoading}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const Loader = () => {
  return (
    <Container className={css.serviceAccountLoader}>
      <Icon name="spinner" color="primary7" size={18} />
    </Container>
  )
}

export default GrantPermission
