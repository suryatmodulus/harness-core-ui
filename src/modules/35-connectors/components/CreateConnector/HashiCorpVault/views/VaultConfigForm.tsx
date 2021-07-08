import React, { useState } from 'react'
import * as Yup from 'yup'
import {
  Button,
  Formik,
  FormikForm,
  Layout,
  StepProps,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Container,
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'

import { useToaster } from '@common/exports'
import {
  ConnectorRequestBody,
  useCreateConnector,
  useUpdateConnector,
  VaultConnectorDTO,
  VaultMetadataRequestSpecDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { URLValidationSchema } from '@common/utils/Validation'
import { PageSpinner } from '@common/components'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import { setupVaultFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import VaultConnectorFormFields from './VaultConnectorFormFields'
import type { CreateHashiCorpVaultProps, StepSecretManagerProps } from '../CreateHashiCorpVault'

export interface VaultConfigFormData {
  vaultUrl: string
  basePath: string
  readOnly: boolean
  default: boolean
  accessType: VaultMetadataRequestSpecDTO['accessType']
  appRoleId?: string
  secretId?: SecretReference
  authToken?: SecretReference
  engineType?: 'fetch' | 'manual'
  secretEngine?: string
  secretEngineName?: string
  secretEngineVersion?: number
  renewalIntervalMinutes: number
}

const VaultConfigForm: React.FC<StepProps<StepSecretManagerProps> & CreateHashiCorpVaultProps> = ({
  prevStepData,
  previousStep,
  nextStep,
  isEditMode,
  onSuccess,
  connectorInfo
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const defaultInitialFormData: VaultConfigFormData = {
    vaultUrl: '',
    basePath: '',
    readOnly: false,
    default: false,
    accessType: 'APP_ROLE',
    appRoleId: '',
    secretId: undefined,
    authToken: undefined,
    secretEngine: '',
    engineType: 'fetch',
    secretEngineName: '',
    secretEngineVersion: 2,
    renewalIntervalMinutes: 10
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingFormData, setLoadingFormData] = useState(isEditMode)

  const { mutate: CreateHashiCorpVault, loading: createLoading } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateSecretManager, loading: updateLoading } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  React.useEffect(() => {
    if (isEditMode && connectorInfo) {
      setupVaultFormData(connectorInfo, accountId).then(data => {
        setInitialValues(data as VaultConfigFormData)
        setLoadingFormData(false)
      })
    }
  }, [isEditMode, connectorInfo])

  const handleSubmit = async (formData: VaultConfigFormData): Promise<void> => {
    if (prevStepData) {
      const dataToSubmit: ConnectorRequestBody = {
        connector: {
          orgIdentifier,
          projectIdentifier,
          ...pick(prevStepData, ['name', 'identifier', 'description', 'tags']),
          type: 'Vault',
          spec: {
            ...pick(formData, ['basePath', 'vaultUrl', 'readOnly', 'default', 'renewalIntervalMinutes']),
            authToken: formData.accessType === 'TOKEN' ? formData.authToken?.referenceString : undefined,
            appRoleId: formData.accessType === 'APP_ROLE' ? formData.appRoleId : undefined,
            secretId: formData.accessType === 'APP_ROLE' ? formData.secretId?.referenceString : undefined,
            secretEngineManuallyConfigured: formData.engineType === 'manual',
            secretEngineName:
              formData.engineType === 'manual' ? formData.secretEngineName : formData.secretEngine?.split('@@@')[0],
            secretEngineVersion:
              formData.engineType === 'manual' ? formData.secretEngineVersion : formData.secretEngine?.split('@@@')[1]
          } as VaultConnectorDTO
        }
      }

      try {
        if (!isEditMode && prevStepData.isEdit != true) {
          const response = await CreateHashiCorpVault(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: true })
          onSuccess(response.data)
          showSuccess(getString('secretManager.createmessageSuccess'))
        } else {
          const response = await updateSecretManager(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: true })
          onSuccess(response.data)
          showSuccess(getString('secretManager.editmessageSuccess'))
        }
      } catch (err) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(err?.data?.message || err?.message)
      }
    }
  }

  return (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ size: 'medium' }} padding={{ bottom: 'xlarge' }}>
        {getString('connectors.hashiCorpVault.stepTwoName')}
      </Text>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<VaultConfigFormData>
        enableReinitialize
        initialValues={initialValues}
        formName="vaultConfigForm"
        validationSchema={Yup.object().shape({
          vaultUrl: URLValidationSchema(),
          secretEngineName: Yup.string().when('engineType', {
            is: 'manual',
            then: Yup.string().trim().required(getString('validation.secretEngineName'))
          }),
          secretEngineVersion: Yup.number().when('engineType', {
            is: 'manual',
            then: Yup.number()
              .positive(getString('validation.engineVersionNumber'))
              .required(getString('validation.engineVersion'))
          }),
          secretEngine: Yup.string().when('engineType', {
            is: 'fetch',
            then: Yup.string().trim().required(getString('validation.secretEngine'))
          }),
          renewalIntervalMinutes: Yup.number()
            .positive(getString('validation.renewalNumber'))
            .required(getString('validation.renewalInterval')),
          authToken: Yup.object()
            .nullable()
            .when('accessType', {
              is: 'TOKEN',
              then: Yup.object().test('authToken', getString('validation.authToken'), function (value) {
                if ((prevStepData?.spec as VaultConnectorDTO)?.accessType === 'TOKEN') return true
                else if (value?.name?.length > 0) return true
                return false
              })
            }),
          appRoleId: Yup.string().when('accessType', {
            is: 'APP_ROLE',
            then: Yup.string().trim().required(getString('validation.appRole'))
          }),
          secretId: Yup.object().when('accessType', {
            is: 'APP_ROLE',
            then: Yup.object().test('secretId', getString('validation.secretId'), function (value) {
              if ((prevStepData?.spec as VaultConnectorDTO)?.accessType === 'APP_ROLE') return true
              else if (value?.name?.length > 0) return true
              return false
            })
          })
        })}
        onSubmit={formData => {
          handleSubmit(formData)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <VaultConnectorFormFields
                formik={formik}
                identifier={prevStepData?.identifier || /* istanbul ignore next */ ''}
                isEditing={isEditMode}
                loadingFormData={loadingFormData}
              />
              <Layout.Horizontal spacing="medium">
                <Button text={getString('back')} onClick={() => previousStep?.(prevStepData)} />
                <Button
                  type="submit"
                  intent="primary"
                  rightIcon="chevron-right"
                  text={getString('saveAndContinue')}
                  disabled={updateLoading || createLoading || loadingFormData}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
      {loadingFormData ? <PageSpinner /> : null}
    </Container>
  )
}

export default VaultConfigForm
