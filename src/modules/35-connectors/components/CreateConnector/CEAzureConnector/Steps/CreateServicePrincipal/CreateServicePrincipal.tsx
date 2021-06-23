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
import { useStrings } from 'framework/strings'
import { useCreateConnector, useUpdateConnector, Failure } from 'services/cd-ng'
import { useAzureStaticAPI } from 'services/ce/index'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import type { CEAzureDTO } from '../Overview/AzureConnectorOverview'
import css from '../../CreateCeAzureConnector_new.module.scss'

type ConnectorPayload = Omit<CEAzureDTO, 'existingBillingExports' | 'hasBilling' | 'isEditMode'>
interface CommandsProps {
  command: string
  comment: string
}

const CreateServicePrincipal: React.FC<StepProps<CEAzureDTO>> = (props): JSX.Element => {
  const { getString } = useStrings()
  const [appId, setAppId] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { prevStepData, previousStep, nextStep } = props
  const { accountId } = useParams<{ accountId: string }>()

  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })

  const saveAndContinue = async () => {
    setIsSaving(true)
    try {
      if (prevStepData) {
        const payload: ConnectorPayload = {
          ...pick(prevStepData, [
            'name',
            'description',
            'identifier',
            'orgIdentifier',
            'projectIdentifier',
            'tags',
            'type',
            'spec'
          ])
        }

        const response = await (prevStepData.isEditMode
          ? updateConnector({ connector: payload })
          : createConnector({ connector: payload }))

        if ('SUCCESS' !== response.status) {
          throw response as Failure
        }

        nextStep?.(prevStepData)
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
      setIsSaving(false)
    }
  }

  const { data, loading } = useAzureStaticAPI({})
  useEffect(() => {
    'SUCCESS' === data?.status && setAppId(data?.data || '')
  }, [loading])

  let commands = []
  const featuresEnabled = prevStepData?.spec?.featuresEnabled || []
  const subscriptionId = prevStepData?.spec?.subscriptionId || '<insert_subscriptionId>'
  const storageAccountName =
    prevStepData?.spec?.billingExportSpec?.storageAccountName || '<insert_storage_account_name>'
  const ENABLED = {
    BILLING: featuresEnabled.includes('BILLING'),
    VISIBILITY: featuresEnabled.includes('VISIBILITY'),
    OPTIMIZATION: featuresEnabled.includes('OPTIMIZATION')
  }

  // Keeping these commands as comment for reference purpose
  //
  // # 1. Register the Harness app
  // az ad sp create --id <id_of_the_service_principal_from_BE_api>
  //
  // # 2. Role assignment for enabling CCM Billing + Visibility
  // SCOPE=`az storage account show --name <storage account name from previous screen> --query "id" | xargs`
  // az role assignment create --assignee <id_of_the_service_principal_from_api> --role 'Storage Blob Data Reader' --scope $SCOPE
  //
  // # 3. Role assignment for enabling CCM Optimisation
  // az role assignment create --assignee-object-id <id_of_the_service_principal_from_api> --role 'Contributor' --scope /subscriptions/<subscription id from screen 1>

  // If only BILLING is selected, we need to show 1 and 2.
  if (ENABLED.BILLING || ENABLED.VISIBILITY) {
    commands.push(
      <Commands comment={'# Register the Harness app'} command={`az ad sp create --id ${appId}`} />,
      <Commands
        comment={'# Role assignment for enabling CCM Billing and Visibility'}
        command={`\`SCOPE=az storage account show --name ${storageAccountName} --query "id" | xargs\``}
      />,
      <Commands
        comment={'# Assign role to the app on the scope fetched above'}
        command={`az role assignment create --assignee ${appId}  --role 'Storage Blob Data Reader' --scope $SCOPE`}
      />
    )
  }

  // If BILLING and OPTIMIZATION are selected, we need to show 1, 2, and 3.
  // 1 & 2 are added from above
  if (ENABLED.BILLING && ENABLED.OPTIMIZATION) {
    commands.push(
      <Commands
        comment={'# Role assignment for enabling CCM Optimisation'}
        command={`az role assignment create --assignee-object-id ${appId} --role 'Contributor' --scope /subscriptions/${subscriptionId}`}
      />
    )
  }

  // If only OPTIMIZATION is selected (BILLING was pre existing),
  // we need to show only this command, which is number 3. (As our app is already registered)
  // It doesn't matter if the VISIBILITY is also selected with OPTIMIZATION
  if (!ENABLED.BILLING && ENABLED.OPTIMIZATION) {
    commands = [
      <Commands
        key={'opt'}
        comment={'# Role assignment for enabling CCM Optimisation'}
        command={`az role assignment create --assignee-object-id ${appId} --role 'Contributor' --scope /subscriptions/${subscriptionId}`}
      />
    ]
  }

  return (
    <Layout.Vertical spacing="large" className={css.stepContainer}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Heading color="grey800" level={2} style={{ fontSize: 20 }}>
        {getString('connectors.ceAzure.servicePrincipal.heading')}
      </Heading>
      <Text>{getString('connectors.ceAzure.servicePrincipal.subHeading')}</Text>
      <Container className={css.commandsContainer}>{commands}</Container>
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
          {getString('continue')}
        </Button>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const Commands = ({ command, comment }: CommandsProps) => {
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
