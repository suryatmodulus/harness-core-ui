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

const ProvidePermissions: React.FC<StepProps<StepSecretManagerProps> & ProvidePermissionsProps> = props => {
  const { showError, showSuccess } = useToaster()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [isDownloadComplete, setIsDownloadComplete] = useState<boolean>(false)
  const [isDelegateDone, setIsDelegateDone] = useState<boolean>(false)
  const [command] = useState('kubectl apply -f harness-delegate.yaml')
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: downloadYaml } = useGetCostOptimisationYamlTemplate({
    queryParams: { accountId, connectorIdentifier: props.prevStepData?.spec?.connectorRef }
  })

  const handleDownload = async () => {
    const response = await downloadYaml()
    const { status } = await downloadYamlAsFile(response, 'cost-optimisation-crd.yaml')
    status && setIsDownloadComplete(true)
  }

  const handleDoneClick = () => {
    setIsDelegateDone(true)
  }

  const copyCommandToClipboard = () => {
    copy(command) ? showSuccess(getString('clipboardCopySuccess')) : showError(getString('clipboardCopyFail'))
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
      <Text>
        To provide required permissions to your cluster, please download the YAML below and continue to apply it using
        instrstuctions given in the next step. You can preview the YAML file here.
      </Text>
      <div>
        <Text>This YAML file contains:</Text>
        <ul>
          <li>Creation of a delegate</li>
          <li>Permissions to access the pods and services of the cluster</li>
          <li>Installing components to create Autostopping rules</li>
          <li>Permissions to start and stop servies as per rules</li>
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
            <Container flex={{ justifyContent: 'space-between' }} className={css.copyCommand}>
              <Text>{`$ ${command}`}</Text>
              <Icon name="step-group" title={'copy'} onClick={copyCommandToClipboard} />
            </Container>
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
