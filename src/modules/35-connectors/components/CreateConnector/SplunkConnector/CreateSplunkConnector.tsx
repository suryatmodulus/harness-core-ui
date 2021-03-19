import React, { useCallback, useEffect, useState } from 'react'
import { Layout, Button, Text, StepProps, StepWizard, FormInput, FormikForm } from '@wings-software/uicore'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useToaster } from '@common/exports'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import { useStrings } from 'framework/exports'
import {
  useCreateConnector,
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ConnectorRequestBody,
  useUpdateConnector,
  ResponseBoolean
} from 'services/cd-ng'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import {
  buildSplunkPayload as _buildSplunkPayload,
  SecretReferenceInterface,
  setSecretField
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { PageSpinner } from '@common/components'
import i18n from './CreateSplunkConnector.i18n'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import css from '../AppDynamicsConnector/CreateAppDynamicsConnector.module.scss'

interface CreateSplunkConnectorProps extends CreateConnectorModalProps {
  onConnectorCreated?: (data: ConnectorConfigDTO) => void | Promise<void>
  mockIdentifierValidate?: ResponseBoolean
}
interface ConnectionConfigProps extends StepProps<ConnectorConfigDTO> {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  formData: ConnectorConfigDTO | undefined
  setFormData: (data: ConnectorConfigDTO | undefined) => void
  name: string
  previousStep?: () => void
  isEditMode: boolean
  connectorInfo?: ConnectorInfoDTO | void
}

interface SplunkFormInterface {
  url: string
  username: string
  passwordRef: SecretReferenceInterface | void
  accountId: string
}

export default function CreateSplunkConnector(props: CreateSplunkConnectorProps): JSX.Element {
  const [formData, setFormData] = useState<ConnectorConfigDTO | undefined>()
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: props.accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: props.accountId } })
  const [connectorResponse, setConnectorResponse] = useState<ConnectorRequestBody | undefined>()
  const [successfullyCreated, setSuccessfullyCreated] = useState(false)
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const isEditMode = props.isEditMode || successfullyCreated

  const handleSubmit = async (
    payload: ConnectorConfigDTO,
    prevData: ConnectorConfigDTO,
    stepProps: StepProps<ConnectorConfigDTO>
  ): Promise<ConnectorInfoDTO | undefined> => {
    const res = await (isEditMode ? updateConnector : createConnector)(payload)
    if (res && res.status === 'SUCCESS') {
      showSuccess(
        isEditMode ? i18n.showSuccessUpdated(payload?.name || '') : i18n.showSuccessCreated(payload?.name || '')
      )
      if (res.data) {
        setSuccessfullyCreated(true)
        props.onConnectorCreated?.(res.data)
        props.onSuccess?.(res.data)
        setConnectorResponse(res.data)
        stepProps?.nextStep?.(prevData)
        props.setIsEditMode(true)
      }
    } else {
      throw new Error(i18n.errorCreate)
    }
    return res.data?.connector
  }

  const buildSplunkPayload = useCallback((data: FormData) => _buildSplunkPayload(data, props.accountId), [])

  return (
    <>
      <StepWizard>
        <ConnectorDetailsStep
          type={Connectors.SPLUNK}
          name={i18n.wizardStepName.connectorDetails}
          setFormData={setFormData}
          formData={formData}
          mock={props.mockIdentifierValidate}
          isEditMode={isEditMode}
          connectorInfo={props.connectorInfo}
        />
        <ConnectionConfigStep
          accountId={props.accountId}
          orgIdentifier={props.orgIdentifier}
          projectIdentifier={props.projectIdentifier}
          name={i18n.wizardStepName.credentials}
          setFormData={setFormData}
          formData={formData}
          isEditMode={isEditMode}
          connectorInfo={props.connectorInfo}
        />
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          customHandleCreate={handleSubmit}
          customHandleUpdate={handleSubmit}
          hideModal={props.onClose}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
          isEditMode={isEditMode}
          buildPayload={buildSplunkPayload}
        />
        <VerifyOutOfClusterDelegate
          name={i18n.verifyConnection}
          url={formData?.url}
          connectorIdentifier={formData?.identifier}
          onClose={() => props.onConnectorCreated?.(connectorResponse as ConnectorInfoDTO)}
          isStep
          isLastStep
          type={Connectors.SPLUNK}
          setIsEditMode={() => props.setIsEditMode(true)}
        />
      </StepWizard>
    </>
  )
}

export function ConnectionConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo } = props
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)
  const [initialValues, setInitialValues] = useState<SplunkFormInterface>({
    url: '',
    username: '',
    passwordRef: undefined,
    accountId: ''
  })

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })
  }

  useEffect(() => {
    ;(async () => {
      if (loadingConnectorSecrets) {
        if (props.isEditMode) {
          setInitialValues({
            url: props.prevStepData?.spec?.splunkUrl || '',
            username: props.prevStepData?.spec?.username || '',
            passwordRef: await setSecretField((props.connectorInfo as ConnectorInfoDTO)?.spec?.passwordRef, {
              accountIdentifier: props?.accountId,
              projectIdentifier: props?.projectIdentifier,
              orgIdentifier: props?.orgIdentifier
            }),
            accountId: props?.accountId || ''
          })
          setLoadingConnectorSecrets(false)
        }
      }
    })()
  }, [loadingConnectorSecrets])

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Formik
      initialValues={{
        ...initialValues,
        ...props.prevStepData
      }}
      validationSchema={Yup.object().shape({
        url: Yup.string().trim().required(),
        username: Yup.string().trim().required(),
        passwordRef: Yup.string().trim().required()
      })}
      onSubmit={handleSubmit}
    >
      {() => (
        <FormikForm className={css.connectionForm}>
          <Layout.Vertical spacing="large" className={css.appDContainer}>
            <Text font="medium">{i18n.connectionDetailsHeader}</Text>
            <FormInput.Text label={i18n.Url} name="url" />
            <FormInput.Text name="username" label={i18n.Username} />
            <SecretInput name="passwordRef" label={i18n.Password} />
          </Layout.Vertical>
          <Layout.Horizontal spacing="large">
            <Button onClick={() => props.previousStep?.()} text={i18n.back} />
            <Button type="submit" text={i18n.connectAndSave} />
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}
