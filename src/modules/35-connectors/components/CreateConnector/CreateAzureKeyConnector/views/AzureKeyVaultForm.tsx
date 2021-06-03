import React, { useState, useEffect } from 'react'
import { pick } from 'lodash-es'
import * as Yup from 'yup'
import {
  StepProps,
  Container,
  Text,
  Formik,
  FormikForm,
  Layout,
  Button,
  ModalErrorHandlerBinding,
  ModalErrorHandler
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { AzureKeyVaultConnectorDTO, ConnectorRequestBody, useCreateConnector, useUpdateConnector } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
import { shouldShowError } from '@common/utils/errorUtils'
import { setupAzureKeyVaultFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { StepSecretManagerProps, CreateAzureKeyVaultConnectorProps } from '../CreateAzureKeyVaultConnector'
import AzureKeyVaultFormFields from './AzureKeyVaultFormFields'
import css from '../CreateAzureKeyVaultConnector.module.scss'

export interface AzureKeyVaultFormData {
  clientId?: string
  secretKey?: string
  tenantId?: string
  vaultName?: string
  subscription?: string
  default?: boolean
}

const AzureKeyVaultForm: React.FC<StepProps<StepSecretManagerProps> & CreateAzureKeyVaultConnectorProps> = props => {
  const { prevStepData, previousStep, isEditMode, nextStep, onSuccess, connectorInfo } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const defaultInitialFormData: AzureKeyVaultFormData = {
    clientId: undefined,
    tenantId: undefined,
    subscription: undefined,
    secretKey: undefined,
    vaultName: undefined,
    default: false
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)

  const { mutate: CreateAzureKeyVault, loading: createLoading } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateAzureKeyVault, loading: updateLoading } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  useEffect(() => {
    if (isEditMode && connectorInfo) {
      setInitialValues(setupAzureKeyVaultFormData(connectorInfo))
    }
  }, [isEditMode])

  const handleSubmit = async (formData: AzureKeyVaultFormData): Promise<void> => {
    modalErrorHandler?.hide()
    if (prevStepData) {
      const dataToSubmit: ConnectorRequestBody = {
        connector: {
          orgIdentifier,
          projectIdentifier,
          ...pick(prevStepData, ['name', 'identifier', 'description', 'tags']),
          type: Connectors.AZURE_KEY_VAULT,
          spec: {
            ...pick(formData, ['clientId', 'secretKey', 'tenantId', 'default', 'subscription', 'vaultName'])
          } as AzureKeyVaultConnectorDTO
        }
      }

      try {
        if (!isEditMode) {
          const response = await CreateAzureKeyVault(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: false })
          onSuccess(response.data)
          showSuccess(getString('secretManager.createmessageSuccess'))
        } else {
          const response = await updateAzureKeyVault(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: true })
          onSuccess(response.data)
          showSuccess(getString('secretManager.editmessageSuccess'))
        }
      } catch (err) {
        if (shouldShowError(err)) {
          modalErrorHandler?.showDanger(err.data?.message || err.message)
        }
      }
    }
  }

  return (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ size: 'medium' }} padding={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<AzureKeyVaultFormData>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          clientId: Yup.string().required(getString('connectors.azureKeyVault.validation.clientId')),
          tenantId: Yup.string().required(getString('connectors.azureKeyVault.validation.tenantId')),
          subscription: Yup.string().required(getString('connectors.azureKeyVault.validation.subscription')),
          secretKey: Yup.string().when('vaultName', {
            is: () => !(prevStepData?.spec as AzureKeyVaultConnectorDTO)?.vaultName,
            then: Yup.string().trim().required(getString('connectors.azureKeyVault.validation.secretKey'))
          }),
          vaultName: Yup.string().required(getString('connectors.azureKeyVault.validation.vaultName'))
        })}
        onSubmit={formData => {
          handleSubmit(formData)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Container className={css.formHeight} margin={{ top: 'medium', bottom: 'xxlarge' }}>
                <AzureKeyVaultFormFields
                  formik={formik}
                  identifier={prevStepData?.identifier || /* istanbul ignore next */ ''}
                  isEditing={isEditMode}
                  modalErrorHandler={modalErrorHandler}
                  connectorInfo={connectorInfo}
                  mock={props.mock}
                />
              </Container>
              <Layout.Horizontal spacing="medium">
                <Button text={getString('back')} onClick={() => previousStep?.(prevStepData)} />
                <Button
                  type="submit"
                  intent="primary"
                  rightIcon="chevron-right"
                  text={getString('saveAndContinue')}
                  disabled={createLoading || updateLoading}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default AzureKeyVaultForm
