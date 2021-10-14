import React, { useContext, useState } from 'react'
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
import { ConnectorInfoDTO, ConnectorRequestBody, useCreateConnector, useUpdateConnector } from 'services/cd-ng'
import { downloadYamlAsFile } from '@common/utils/downloadYamlUtils'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import { useToaster } from '@common/exports'
import { Connectors } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { useCloudCostK8sClusterSetup } from 'services/ce'
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
  const { showError } = useToaster()
  const [isDownloadComplete, setIsDownloadComplete] = useState<boolean>(false)
  const [isDelegateDone, setIsDelegateDone] = useState<boolean>(false)
  const [command] = useState(`kubectl apply -f ${yamlFileName}`)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { triggerExtension } = useContext(DialogExtensionContext)

  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: downloadYaml } = useCloudCostK8sClusterSetup({
    queryParams: { accountIdentifier: accountId, accountId }
  })

  const handleDownload = async () => {
    try {
      const response = await downloadYaml({
        connectorIdentifier: _defaultTo(props.prevStepData?.spec?.connectorRef, ''),
        featuresEnabled: props.prevStepData?.spec?.featuresEnabled,
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
      <Text>
        {getString('connectors.ceK8.providePermissionsStep.downloadYamlText')}
        <span className={css.previewLink} onClick={() => triggerExtension(<PermissionYAMLPreview />)}>
          here
        </span>
        .
      </Text>
      <div>
        <Text>{getString('connectors.ceK8.providePermissionsStep.fileDescription.heading')}</Text>
        <ul>
          <li>{getString('connectors.ceK8.providePermissionsStep.fileDescription.info1')}</li>
          <li>{getString('connectors.ceK8.providePermissionsStep.fileDescription.info2')}</li>
          <li>{getString('connectors.ceK8.providePermissionsStep.fileDescription.info3')}</li>
          <li>{getString('connectors.ceK8.providePermissionsStep.fileDescription.info4')}</li>
        </ul>
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
