import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  StepWizard,
  StepProps,
  Layout,
  Button,
  Text,
  FormInput,
  FormikForm,
  Container,
  Color
} from '@wings-software/uicore'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useToaster } from '@common/exports'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { useStrings } from 'framework/exports'
import {
  useCreateConnector,
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ConnectorRequestBody,
  ResponseBoolean,
  useUpdateConnector
} from 'services/cd-ng'
import { AppDynamicsAuthType, setSecretField } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER, CreateConnectorModalProps } from '@connectors/constants'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { buildAppDynamicsPayload as _buildAppDynamicsPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import styles from './CreateAppDynamicsConnector.module.scss'

interface CreateAppDynamicsConnectorProps extends CreateConnectorModalProps {
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  mockIdentifierValidate?: ResponseBoolean
}

export interface ConnectionConfigProps extends StepProps<ConnectorConfigDTO> {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  isEditMode: boolean
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo?: ConnectorInfoDTO | void
}

interface UsernamePasswordAndApiClientOptionProps {
  onAuthTypeChange: (authType: string) => void
  authTypeValue?: string
}

export default function CreateAppDynamicsConnector(props: CreateAppDynamicsConnectorProps): JSX.Element {
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: props.accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: props.accountId } })
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [successfullyCreated, setSuccessfullyCreated] = useState(false)
  const handleSubmit = async (
    payload: ConnectorConfigDTO,
    prevData: ConnectorConfigDTO,
    stepProps: StepProps<ConnectorConfigDTO>
  ): Promise<ConnectorInfoDTO | undefined> => {
    const { isEditMode } = props
    const res = await (isEditMode ? updateConnector : createConnector)(payload)
    if (res && res.status === 'SUCCESS') {
      showSuccess(
        isEditMode
          ? getString('cv.connectors.updatedSuccessfully', payload?.name || '')
          : getString('cv.connectors.createdSuccessfully', payload?.name || '')
      )
      if (res.data) {
        setSuccessfullyCreated(true)
        props.onConnectorCreated?.(res.data)
        props.onSuccess?.(res.data)
        stepProps?.nextStep?.(prevData)
        props.setIsEditMode?.(true)
      }
    } else {
      throw new Error(
        getString(isEditMode ? 'cv.connectors.unableToUpdateConnector' : 'cv.connectors.unableToCreateConnector')
      )
    }
    return res.data?.connector
  }

  const isEditMode = props.isEditMode || successfullyCreated
  const buildAppDynamicsPayload = useCallback(
    (formData: FormData) => _buildAppDynamicsPayload(formData, props.accountId),
    []
  )

  return (
    <StepWizard>
      <ConnectorDetailsStep
        type={Connectors.APP_DYNAMICS}
        name={getString('cv.connectors.connectorDetails')}
        isEditMode={isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mockIdentifierValidate}
      />
      <ConnectionConfigStep
        accountId={props.accountId}
        orgIdentifier={props.orgIdentifier}
        projectIdentifier={props.projectIdentifier}
        name={getString('credentials')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
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
        isEditMode={props.isEditMode}
        buildPayload={buildAppDynamicsPayload}
      />
      <VerifyOutOfClusterDelegate
        name={getString('cv.connectors.verifyConnection')}
        onClose={props.onClose}
        isStep
        isLastStep
        type={Connectors.APP_DYNAMICS}
        setIsEditMode={props.setIsEditMode}
      />
    </StepWizard>
  )
}

function UsernamePasswordAndApiClientOption(props: UsernamePasswordAndApiClientOptionProps): JSX.Element {
  const { onAuthTypeChange, authTypeValue } = props
  const { getString } = useStrings()
  const authOptions = useMemo(
    () => [
      { label: getString('usernamePassword'), value: AppDynamicsAuthType.USERNAME_PASSWORD },
      { label: getString('cv.connectors.appD.apiClient'), value: AppDynamicsAuthType.API_CLIENT_TOKEN }
    ],
    []
  )

  const fieldProps =
    authTypeValue === AppDynamicsAuthType.API_CLIENT_TOKEN
      ? [
          { name: 'clientId', label: getString('cv.connectors.appD.clientId'), key: 'clientId' },
          { name: 'clientSecretRef', label: getString('cv.connectors.appD.clientSecret'), key: 'clientSecretRef' }
        ]
      : [
          { name: 'username', label: getString('username'), key: 'username' },
          { name: 'password', label: getString('password'), key: 'password' }
        ]
  return (
    <Container>
      <Container flex style={{ alignItems: 'baseline' }}>
        <Text color={Color.BLACK} font={{ weight: 'bold' }}>
          {getString('authentication')}
        </Text>
        <FormInput.Select
          name="authType"
          items={authOptions}
          className={styles.authTypeSelect}
          onChange={updatedAuth => onAuthTypeChange(updatedAuth.value as string)}
        />
      </Container>
      <FormInput.Text {...fieldProps[0]} />
      <SecretInput {...fieldProps[1]} />
    </Container>
  )
}

function ConnectionConfigStep(props: ConnectionConfigProps): JSX.Element {
  const [loadingSecrets, setLoadingSecrets] = useState(
    Boolean(props.prevStepData?.spec || props.prevStepData?.authType)
  )
  const { getString } = useStrings()
  const { nextStep, prevStepData, connectorInfo } = props
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    url: '',
    accountName: '',
    username: '',
    authType: AppDynamicsAuthType.USERNAME_PASSWORD,
    password: undefined,
    projectIdentifier: props.projectIdentifier,
    orgIdentifier: props.orgIdentifier
  })

  useEffect(() => {
    if (!props.prevStepData) {
      return
    }
    const { spec, ...prevData } = props.prevStepData
    const updatedInitialValues = {
      url: prevData.url || spec?.controllerUrl || '',
      accountName: prevData.accountName || spec?.accountname || '',
      authType: prevData.authType || spec?.authType || AppDynamicsAuthType.USERNAME_PASSWORD,
      username: prevData.username || spec?.username || '',
      clientId: prevData.clientId || spec?.clientId
    }

    if (
      updatedInitialValues.authType === AppDynamicsAuthType.USERNAME_PASSWORD &&
      (prevData.password || spec?.passwordRef)
    ) {
      setSecretField(prevData.password?.referenceString || spec.passwordRef, {
        accountIdentifier: props.accountId,
        projectIdentifier: props.projectIdentifier,
        orgIdentifier: props.orgIdentifier
      })
        .then(result => {
          ;(updatedInitialValues as any).password = result
          setLoadingSecrets(false)
          setInitialValues(currentInitialValues => ({ ...currentInitialValues, ...updatedInitialValues }))
        })
        .catch(() => {
          setLoadingSecrets(false)
        })
    } else if (
      updatedInitialValues.authType === AppDynamicsAuthType.API_CLIENT_TOKEN &&
      (prevData.clientSecretRef || spec?.clientSecretRef)
    ) {
      setSecretField(prevData.clientSecretRef?.referenceString || spec.clientSecretRef, {
        accountIdentifier: props.accountId,
        projectIdentifier: props.projectIdentifier,
        orgIdentifier: props.orgIdentifier
      })
        .then(result => {
          ;(updatedInitialValues as any).clientSecretRef = result
          setLoadingSecrets(false)
          setInitialValues(currentInitialValues => ({ ...currentInitialValues, ...updatedInitialValues }))
        })
        .catch(() => {
          setLoadingSecrets(false)
        })
    }

    setInitialValues(updatedInitialValues)
  }, [])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })
  }

  if (loadingSecrets) {
    return <PageSpinner />
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{
        ...initialValues
      }}
      validationSchema={Yup.object().shape({
        url: Yup.string().trim().required(getString('cv.connectors.appD.validation.controllerURL')),
        accountName: Yup.string().trim().required(getString('validation.accountName')),
        authType: Yup.string().trim(),
        username: Yup.string()
          .nullable()
          .when('authType', {
            is: AppDynamicsAuthType.USERNAME_PASSWORD,
            then: Yup.string().required(getString('validation.username'))
          }),
        password: Yup.string()
          .nullable()
          .when('authType', {
            is: AppDynamicsAuthType.USERNAME_PASSWORD,
            then: Yup.string().required(getString('validation.password'))
          }),
        clientId: Yup.string()
          .nullable()
          .when('authType', {
            is: AppDynamicsAuthType.API_CLIENT_TOKEN,
            then: Yup.string().required(getString('cv.connectors.appD.validation.clientId'))
          }),
        clientSecretRef: Yup.string()
          .nullable()
          .when('authType', {
            is: AppDynamicsAuthType.API_CLIENT_TOKEN,
            then: Yup.string().required(getString('cv.connectors.appD.validation.clientSecret'))
          })
      })}
      onSubmit={handleSubmit}
    >
      {formikProps => (
        <FormikForm className={styles.connectionForm}>
          <Layout.Vertical spacing="large" className={styles.appDContainer}>
            <Text font="medium">{getString('cv.connectors.appD.connectionDetailsHeader')}</Text>
            <FormInput.Text label={getString('cv.connectors.appD.controllerURL')} name="url" />
            <FormInput.Text label={getString('cv.connectors.appD.accountName')} name="accountName" />
            <UsernamePasswordAndApiClientOption
              authTypeValue={formikProps.values.authType}
              onAuthTypeChange={updatedAuth => {
                if (updatedAuth === AppDynamicsAuthType.API_CLIENT_TOKEN) {
                  formikProps.setValues({
                    ...formikProps.values,
                    authType: updatedAuth,
                    username: null,
                    password: null
                  })
                } else if (updatedAuth === AppDynamicsAuthType.USERNAME_PASSWORD) {
                  formikProps.setValues({
                    ...formikProps.values,
                    authType: updatedAuth,
                    clientId: null,
                    clientSecretRef: null
                  })
                }
              }}
            />
          </Layout.Vertical>
          <Layout.Horizontal spacing="large">
            <Button onClick={() => props.previousStep?.({ ...props.prevStepData })} text={getString('back')} />
            <Button type="submit" intent="primary" text={getString('cv.connectors.connectAndSave')} />
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}
