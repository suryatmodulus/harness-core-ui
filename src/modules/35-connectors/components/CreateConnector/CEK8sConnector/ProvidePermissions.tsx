import React, { useContext, useEffect, useState } from 'react'
import {
  Button,
  Color,
  Heading,
  Icon,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  StepProps,
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { omit as _omit, defaultTo as _defaultTo } from 'lodash-es'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import {
  ConnectorInfoDTO,
  ConnectorRequestBody,
  TokenDTO,
  useCreateConnector,
  useCreateToken,
  useUpdateConnector
} from 'services/cd-ng'
import { downloadYamlAsFile } from '@common/utils/downloadYamlUtils'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import { useToaster } from '@common/exports'
import { Connectors } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useCloudCostK8sClusterSetupV2 } from 'services/ce'
import CopyCodeSection from './components/CopyCodeSection'
import PermissionYAMLPreview from './PermissionYAMLPreview'
import css from './CEK8sConnector.module.scss'

interface ProvidePermissionsProps {
  name: string
  onSuccess?: (connector: ConnectorRequestBody) => void
  isEditMode: boolean
}

interface StepSecretManagerProps extends ConnectorInfoDTO {
  spec: any
}

const yamlFileName = 'ccm-kubernetes.yaml'

const ProvidePermissions: React.FC<StepProps<StepSecretManagerProps> & ProvidePermissionsProps> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()
  const { showError } = useToaster()
  const [isDownloadComplete, setIsDownloadComplete] = useState<boolean>(false)
  const [isDelegateDone, setIsDelegateDone] = useState<boolean>(false)
  const [command] = useState(`kubectl apply -f ${yamlFileName}`)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [isExtensionOpen, setIsExtensionOpen] = useState(false)
  const [, setToken] = useState<string>()

  const { triggerExtension, closeExtension } = useContext(DialogExtensionContext)

  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: downloadYaml } = useCloudCostK8sClusterSetupV2({
    queryParams: {
      accountIdentifier: accountId,
      includeOptimization: props.prevStepData?.spec?.meta?.includeOptimization,
      includeVisibility: props.prevStepData?.spec?.meta?.includeVisibility
    }
  })

  const { mutate: createToken, loading: saving } = useCreateToken({})

  useEffect(() => {
    handleTokenCreation()
  }, [])

  const handleTokenCreation = async () => {
    const data: TokenDTO = {
      identifier: _defaultTo(props.prevStepData?.identifier, ''),
      name: _defaultTo(props.prevStepData?.identifier, ''),
      description: '',
      tags: {},
      accountIdentifier: accountId,
      apiKeyIdentifier: 'kubernetesCloudAccess',
      parentIdentifier: _defaultTo(currentUserInfo?.uuid, ''),
      apiKeyType: 'USER'
    }
    const tokenData = await createToken(data)
    setToken(tokenData.data)
  }

  const handleDownload = async () => {
    try {
      const response = await downloadYaml({
        connectorIdentifier: _defaultTo(props.prevStepData?.spec?.connectorRef, ''),
        ccmConnectorIdentifier: _defaultTo(props.prevStepData?.identifier, '')
      })
      const { status } = await downloadYamlAsFile(response, yamlFileName)
      status && setIsDownloadComplete(true)
    } catch (err) {
      showError(err?.data?.message || err?.message)
    }
  }

  const handleDoneClick = () => {
    setIsDelegateDone(true)
  }

  const saveAndContinue = async (): Promise<void> => {
    setIsSaving(true)
    try {
      modalErrorHandler?.hide()
      const connector: ConnectorRequestBody = {
        connector: {
          ...props.prevStepData,
          spec: _omit({ ...props.prevStepData?.spec }, 'fixFeatureSelection'),
          type: Connectors.CE_KUBERNETES
        } as ConnectorInfoDTO
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

  const handlePreviewYamlClick = () => {
    const currVal = !isExtensionOpen
    setIsExtensionOpen(currVal)
    if (currVal) {
      triggerExtension(<PermissionYAMLPreview />)
    } else {
      closeExtension()
    }
  }

  const handleprev = () => {
    props.previousStep?.({ ...props.prevStepData } as ConnectorInfoDTO)
  }

  return (
    <Layout.Vertical spacing={'xlarge'} className={css.providePermissionContainer}>
      <Heading level={2} className={css.heading}>
        {getString('connectors.ceK8.providePermissionsStep.heading')}
      </Heading>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Text icon={'info'} iconProps={{ color: Color.PRIMARY_7 }} color={Color.PRIMARY_7}>
        {getString('connectors.ceK8.providePermissionsStep.info')}
        <a
          href="https://ngdocs.harness.io/article/ltt65r6k39-set-up-cost-visibility-for-kubernetes#prerequisites"
          target="_blank"
          rel="noreferrer"
        >
          {getString('connectors.readMore')}
        </a>
      </Text>
      <Text>{getString('connectors.ceK8.providePermissionsStep.downloadYamlText')}</Text>
      <div>
        <Layout.Horizontal>
          {!isDownloadComplete && (
            <Button
              intent={'primary'}
              outlined={true}
              onClick={handleDownload}
              text={getString('connectors.ceK8.providePermissionsStep.downloadYamlBtnText')}
              className={css.stepBtn}
            />
          )}
          {isDownloadComplete && (
            <Layout.Horizontal className={css.successTextContainer}>
              <Icon name="tick" />
              <span>{getString('connectors.ceK8.providePermissionsStep.downloadComplete')}</span>
            </Layout.Horizontal>
          )}
          <Text
            className={css.previewLink}
            onClick={handlePreviewYamlClick}
            rightIcon={saving ? 'loading' : isExtensionOpen ? 'caret-left' : 'caret-right'}
          >
            {isExtensionOpen ? 'Collapse YAML' : 'Preview YAML'}
          </Text>
        </Layout.Horizontal>
        {isDownloadComplete && (
          <div className={css.commandSection}>
            <Text>{getString('connectors.ceK8.providePermissionsStep.applyDelegateText')}</Text>
            <CopyCodeSection snippet={`${command}`} />
            {!isDelegateDone && (
              <Button
                intent={'primary'}
                outlined={true}
                onClick={handleDoneClick}
                text={getString('done')}
                className={css.stepBtn}
              />
            )}
            {isDelegateDone && (
              <Layout.Horizontal className={css.successTextContainer}>
                <Icon name="tick" />
                <span>{getString('connectors.ceK8.providePermissionsStep.successfulCommandExec')}</span>
              </Layout.Horizontal>
            )}
          </div>
        )}
      </div>
      <Layout.Horizontal className={css.buttonPanel} spacing="small">
        <Button text={getString('previous')} icon="chevron-left" onClick={handleprev} />
        <Button
          intent="primary"
          text={getString('continue')}
          rightIcon="chevron-right"
          loading={isSaving}
          disabled={isSaving || !(isDownloadComplete && isDelegateDone)}
          onClick={() => saveAndContinue()}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default ProvidePermissions
