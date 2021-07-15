import React, { useState } from 'react'
import {
  Button,
  Container,
  Heading,
  Icon,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  StepProps,
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router'
import copy from 'copy-to-clipboard'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ConnectorInfoDTO, ConnectorRequestBody, useCreateConnector, useUpdateConnector } from 'services/cd-ng'
import { useToaster } from '@common/components'
import { downloadYamlAsFile } from '@common/utils/downloadYamlUtils'
import { Connectors } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { useGetCostOptimisationYamlTemplate } from 'services/ce'
import css from './CEK8sConnector.module.scss'

interface ProvidePermissionsProps {
  name: string
  onSuccess?: (connector: ConnectorRequestBody) => void
  isEditMode: boolean
}

interface StepSecretManagerProps extends ConnectorInfoDTO {
  spec: any
}

interface CopyCodeSectionProps {
  snippet: string
}

const CopyCodeSection: React.FC<CopyCodeSectionProps> = ({ snippet }) => {
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()
  const copyCommandToClipboard = () => {
    copy(snippet) ? showSuccess(getString('clipboardCopySuccess')) : showError(getString('clipboardCopyFail'))
  }
  return (
    <Container flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }} className={css.copyCommand}>
      <Text>{snippet}</Text>
      <Icon name="step-group" title={'copy'} onClick={copyCommandToClipboard} />
    </Container>
  )
}

const ProvidePermissions: React.FC<StepProps<StepSecretManagerProps> & ProvidePermissionsProps> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [isDownloadComplete, setIsDownloadComplete] = useState<boolean>(false)
  const [isDelegateDone, setIsDelegateDone] = useState<boolean>(false)
  const [command] = useState('kubectl apply -f cost-optimisation-crd.yaml')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [secretYaml] = useState<string>(
    yamlStringify({
      apiVersion: 'v1',
      data: {
        token: '<paste token here>'
      },
      kind: 'Secret',
      metadata: {
        name: 'harness-api-key',
        namespace: 'harness-autostopping'
      },
      type: 'Opaque'
    })
  )
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: downloadYaml } = useGetCostOptimisationYamlTemplate({
    queryParams: { accountId, connectorIdentifier: props.prevStepData?.identifier as string }
  })

  const handleDownload = async () => {
    const response = await downloadYaml('ZWNobyAidGhlIGVuZCBpcyBoZXJlIg==')
    const { status } = await downloadYamlAsFile(response, 'cost-optimisation-crd.yaml')
    status && setIsDownloadComplete(true)
  }

  const handleDoneClick = () => {
    setIsDelegateDone(true)
  }

  const saveAndContinue = async (): Promise<void> => {
    setIsSaving(true)
    try {
      modalErrorHandler?.hide()
      const connector: ConnectorRequestBody = {
        connector: { ...props.prevStepData, type: Connectors.CE_KUBERNETES } as ConnectorInfoDTO
      }
      const response = props.isEditMode ? await updateConnector(connector) : await createConnector(connector)
      props.onSuccess?.(response?.data as ConnectorRequestBody)
      props.nextStep?.({ ...props.prevStepData } as ConnectorInfoDTO)
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Layout.Vertical spacing={'xlarge'} className={css.providePermissionContainer}>
      <Heading level={2} className={css.heading}>
        Provide Permissions - <span>Download YAML</span>
      </Heading>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <div>
        <ol type="1">
          <li>
            Create an api key{' '}
            <a
              href={`${window.location.origin}/#/account/${accountId}/access-management/api-keys`}
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
          </li>
          <li>Run the following command to create namespace</li>
          <CopyCodeSection snippet={'kubectl create namespace harness-autostopping'} />
          <li>Replace the api key in the following Yaml</li>
          <CopyCodeSection snippet={`${secretYaml}`} />
          <li>Run the following command</li>
          <CopyCodeSection snippet={'kubectl apply -f secret.yaml'} />
        </ol>
      </div>
      <Text>
        To provide required permissions to your cluster, please download the YAML below and continue to apply it using
        instructions given in the next step. You can preview the YAML file here.
      </Text>
      <div>
        <Text>This YAML file contains:</Text>
        <ul>
          <li>Creation of a delegate</li>
          <li>Permissions to access the pods and services of the cluster</li>
          <li>Installing components to create Autostopping rules</li>
          <li>Permissions to start and stop services as per rules</li>
        </ul>
        {!isDownloadComplete && (
          <Button
            intent={'primary'}
            outlined={true}
            onClick={handleDownload}
            text={'Download YAML'}
            className={css.stepBtn}
          />
        )}
        {isDownloadComplete && (
          <Layout.Horizontal className={css.successTextContainer}>
            <Icon name="tick" />
            <span>Download Complete</span>
          </Layout.Horizontal>
        )}
        {isDownloadComplete && (
          <div className={css.commandSection}>
            <Text>
              Copy the downloaded YAML to a machine where you have kubectl installed and have access to your Kubernetes
              cluster. Run the following command to apply the Harness delegate to your Kubernetes Cluster
            </Text>
            <CopyCodeSection snippet={`$ ${command}`} />
            {!isDelegateDone && (
              <Button
                intent={'primary'}
                outlined={true}
                onClick={handleDoneClick}
                text={'Done'}
                className={css.stepBtn}
              />
            )}
            {isDelegateDone && (
              <Layout.Horizontal className={css.successTextContainer}>
                <Icon name="tick" />
                <span>Command executed successfully</span>
              </Layout.Horizontal>
            )}
          </div>
        )}
      </div>
      <Button
        intent="primary"
        text={getString('continue')}
        rightIcon="chevron-right"
        loading={isSaving}
        disabled={isSaving || !(isDownloadComplete && isDelegateDone)}
        onClick={() => saveAndContinue()}
        className={css.submitBtn}
      />
    </Layout.Vertical>
  )
}

export default ProvidePermissions
