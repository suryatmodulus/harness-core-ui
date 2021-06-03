import React, { useCallback, useEffect, useState } from 'react'
import { Layout, Button, Text, StepProps, StepWizard, FormInput, FormikForm } from '@wings-software/uicore'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useToaster } from '@common/exports'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import { useStrings } from 'framework/strings'
import {
  useCreateConnector,
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  useUpdateConnector,
  ResponseBoolean
} from 'services/cd-ng'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import {
  buildSplunkPayload as _buildSplunkPayload,
  SecretReferenceInterface,
  setSecretField
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { PageSpinner } from '@common/components'
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
        isEditMode
          ? getString('connectors.updatedSuccessfully', payload?.name || '')
          : getString('connectors.createdSuccessfully', payload?.name || '')
      )
      if (res.data) {
        setSuccessfullyCreated(true)
        props.onConnectorCreated?.(res.data)
        props.onSuccess?.(res.data)
        stepProps?.nextStep?.(prevData)
        props.setIsEditMode(true)
      }
    } else {
      throw new Error(
        getString(isEditMode ? 'connectors.unableToUpdateConnector' : 'connectors.unableToCreateConnector')
      )
    }
    return res.data?.connector
  }

  const buildSplunkPayload = useCallback((data: FormData) => _buildSplunkPayload(data, props.accountId), [])

  return (
    <>
      <StepWizard>
        <ConnectorDetailsStep
          type={Connectors.SPLUNK}
          name={getString('connectors.connectorDetails')}
          setFormData={setFormData}
          formData={formData}
          mock={props.mockIdentifierValidate}
          isEditMode={isEditMode}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
        />
        <ConnectionConfigStep
          accountId={props.accountId}
          orgIdentifier={props.orgIdentifier}
          projectIdentifier={props.projectIdentifier}
          name={getString('credentials')}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
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
          gitDetails={props.gitDetails}
          isEditMode={isEditMode}
          buildPayload={buildSplunkPayload}
        />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.verifyConnection')}
          connectorInfo={props.connectorInfo}
          url={formData?.url}
          onClose={props.onClose}
          isStep
          isLastStep
          type={Connectors.SPLUNK}
          setIsEditMode={() => props.setIsEditMode(true)}
          stepIndex={TESTCONNECTION_STEP_INDEX}
        />
      </StepWizard>
    </>
  )
}

export function ConnectionConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo } = props
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)
  const { getString } = useStrings()
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
        url: Yup.string().trim().required(getString('common.validation.urlIsRequired')),
        username: Yup.string().trim().required(getString('validation.username')),
        passwordRef: Yup.string().trim().required(getString('validation.password'))
      })}
      onSubmit={handleSubmit}
    >
      {() => (
        <FormikForm className={css.connectionForm}>
          <Layout.Vertical spacing="large" className={css.appDContainer}>
            <Text font="medium">{getString('connectors.splunk.connectorDetailsHeader')}</Text>
            <FormInput.Text label={getString('UrlLabel')} name="url" />
            <FormInput.Text name="username" label={getString('username')} />
            <SecretInput name="passwordRef" label={getString('password')} />
          </Layout.Vertical>
          <Layout.Horizontal spacing="large">
            <Button onClick={() => props.previousStep?.()} text={getString('back')} />
            <Button type="submit" text={getString('connectors.connectAndSave')} />
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}
