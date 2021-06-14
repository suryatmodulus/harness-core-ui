import React, { useEffect, useState } from 'react'
import { pick } from 'lodash-es'
import { useParams } from 'react-router'
import {
  Button,
  Heading,
  Layout,
  Text,
  StepProps,
  Container,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import { ConnectorInfoDTO, ConnectorConfigDTO, useCreateConnector, ConnectorRequestBody } from 'services/cd-ng'
import { useAzureStaticAPI } from 'services/ce/index'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import css from '../../CreateCeAzureConnector.module.scss'

interface CommandsProps {
  command: string
  comment: string
}

const CreateServicePrincipal: React.FC<StepProps<ConnectorInfoDTO> & StepProps<ConnectorConfigDTO>> = (
  props
): JSX.Element => {
  const [appId, setAppId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { prevStepData, previousStep, nextStep } = props
  const { accountId } = useParams<{
    accountId: string
    projectIdentifier: string
    orgIdentifier: string
  }>()

  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })

  const saveAndContinue = async () => {
    setIsSaving(true)
    try {
      modalErrorHandler?.hide()
      const spec: ConnectorConfigDTO = {
        tenantId: prevStepData?.tenantId,
        subscriptionId: prevStepData?.subscriptionId,
        featuresEnabled: prevStepData?.featuresEnabled,
        billingExportSpec: {
          storageAccountName: prevStepData?.storageAccountName,
          reportName: prevStepData?.reportName,
          containerName: prevStepData?.containerName,
          directoryName: prevStepData?.directoryName
        }
      }

      const connectorDetails: ConnectorInfoDTO = {
        ...(pick(props.prevStepData, [
          'name',
          'description',
          'identifier',
          'orgIdentifier',
          'projectIdentifier',
          'tags'
        ]) as ConnectorInfoDTO),
        type: 'CEAzure',
        spec: spec
        // projectIdentifier,
        // orgIdentifier
      }

      const connector = { connector: connectorDetails }
      await createConnector(connector as ConnectorRequestBody)
      nextStep?.({ ...connectorDetails })
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    } finally {
      setIsSaving(false)
    }
  }

  const { data, loading } = useAzureStaticAPI({})
  useEffect(() => {
    if (data?.status == 'SUCCESS') {
      setAppId(data?.data || '')
    }
  }, [loading])

  return (
    <Layout.Vertical spacing="large" className={css.stepContainer}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Heading color="grey800" level={2} style={{ fontSize: 20 }}>
        Create Service Principal
      </Heading>
      <Text>
        You can Create a Service Principal and assign permissions by running the following commands in the Command line
      </Text>
      <Container className={css.commandsContainer}>
        <Commands comment={'# Register the Harness app'} command={`az ad sp create --id ${appId}`} />
        <Commands
          comment={'# Role is assigned to this scope'}
          command={'SCOPE=`az storage account show --name cesrcbillingstorage --query "id" | xargs`'}
        />
        <Commands
          comment={'# Assign role to the app on the scope fetched above'}
          command={`az role assignment create --assignee --role 'Storage Blob Data Reader' --scope $SCOPE`}
        />
      </Container>
      <Layout.Horizontal spacing="medium" className={css.continueAndPreviousBtns}>
        <Button text="Previous" icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
        <Button
          type="submit"
          intent="primary"
          rightIcon="chevron-right"
          loading={isSaving}
          disabled={isSaving}
          onClick={() => saveAndContinue()}
        >
          Continue
        </Button>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const Commands: React.FC<CommandsProps> = ({ command, comment }) => {
  return (
    <Container style={{ marginBottom: 20 }}>
      <Text>{comment}</Text>
      <Container className={css.command}>
        <pre>{command}</pre>
        <CopyToClipboard showFeedback content={command} iconSize={16} />
      </Container>
    </Container>
  )
}

export default CreateServicePrincipal

// containerName: "sc"
// description: ""
// directoryName: "sd"
// featuresEnabled: (2) ["VISIBILITY", "OPTIMIZATION"]
// identifier: "bdj0"
// name: "bdj0"
// orgIdentifier: ""
// projectIdentifier: ""
// reportName: "rn"
// spec: {subscriptionId: "b129b2bb-5f33-4d22-bce0-730f6474e90", tenantId: "sasi", featuresEnabled: Array(2), billingExportSpec: {…}}
// storageAccountName: "san"
// subscriptionId: "sasi"
// tags: {}
// tenantId: "b129b2bb-5f33-4d22-bce0-730f6474e90"
// type: "CEAzure"
