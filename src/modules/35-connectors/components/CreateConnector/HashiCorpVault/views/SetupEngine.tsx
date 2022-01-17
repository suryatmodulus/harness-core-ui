/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'
import {
  Container,
  Text,
  Formik,
  FormikForm,
  Button,
  Layout,
  FormInput,
  StepProps,
  SelectOption,
  Color,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  FontVariation,
  ButtonVariation,
  shouldShowError
} from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  StepDetailsProps,
  ConnectorDetailsProps,
  SetupEngineFormData,
  HashiCorpVaultAccessTypes
} from '@connectors/interfaces/ConnectorInterface'
import { setupEngineFormData, buildVaultPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { PageSpinner } from '@common/components'
import {
  useGetMetadata,
  VaultMetadataRequestSpecDTO,
  VaultAppRoleCredentialDTO,
  VaultAuthTokenCredentialDTO,
  VaultMetadataSpecDTO,
  useCreateConnector,
  useUpdateConnector,
  ConnectorRequestBody,
  ConnectorConfigDTO,
  VaultAgentCredentialDTO
} from 'services/cd-ng'
import { useToaster } from '@common/exports'

const defaultInitialFormData: SetupEngineFormData = {
  secretEngine: '',
  engineType: 'fetch',
  secretEngineName: '',
  secretEngineVersion: 2
}

const SetupEngine: React.FC<StepProps<StepDetailsProps> & ConnectorDetailsProps> = ({
  prevStepData,
  previousStep,
  nextStep,
  onConnectorCreated,
  isEditMode,
  connectorInfo,
  accountId
}) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingFormData, setLoadingFormData] = useState(isEditMode)
  const [savingDataInProgress, setSavingDataInProgress] = useState<boolean>(false)
  const [secretEngineOptions, setSecretEngineOptions] = useState<SelectOption[]>([])
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const { mutate: getMetadata, loading } = useGetMetadata({ queryParams: { accountIdentifier: accountId } })
  const { mutate: createConnector, loading: creating } = useCreateConnector({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateConnector, loading: updating } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  const engineTypeOptions: IOptionProps[] = [
    {
      label: getString('connectors.hashiCorpVault.fetchEngines'),
      value: 'fetch'
    },
    {
      label: getString('connectors.hashiCorpVault.manuallyConfigureEngine'),
      value: 'manual'
    }
  ]

  useEffect(() => {
    if (isEditMode && connectorInfo) {
      setupEngineFormData(connectorInfo).then(data => {
        setInitialValues(data as SetupEngineFormData)
        setLoadingFormData(false)
      })
    }
  }, [isEditMode, connectorInfo, accountId])

  const handleFetchEngines = async (formData: ConnectorConfigDTO): Promise<void> => {
    try {
      const res = await getMetadata({
        identifier: formData.identifier,
        encryptionType: 'VAULT',
        orgIdentifier: formData.orgIdentifier,
        projectIdentifier: formData.projectIdentifier,
        spec: {
          url: formData.vaultUrl,
          accessType: formData.accessType,
          delegateSelectors: formData.delegateSelectors,
          namespace: formData.namespace,
          spec:
            formData.accessType === HashiCorpVaultAccessTypes.APP_ROLE
              ? ({
                  appRoleId: formData.appRoleId,
                  secretId: formData.secretId?.referenceString
                } as VaultAppRoleCredentialDTO)
              : formData.accessType === HashiCorpVaultAccessTypes.TOKEN
              ? ({
                  authToken: formData.authToken?.referenceString
                } as VaultAuthTokenCredentialDTO)
              : ({
                  sinkPath: formData.sinkPath
                } as VaultAgentCredentialDTO)
        } as VaultMetadataRequestSpecDTO
      })

      setSecretEngineOptions(
        (res.data?.spec as VaultMetadataSpecDTO)?.secretEngines?.map(secretEngine => {
          return {
            label: secretEngine.name || '',
            value: `${secretEngine.name || ''}@@@${secretEngine.version || 2}`
          }
        }) || []
      )
    } catch (err) {
      /* istanbul ignore else */
      //added condition to don't show the toaster if it's an abort error
      if (shouldShowError(err)) {
        showError(err.data?.message || err.message)
      }
    }
  }

  useEffect(() => {
    if (
      isEditMode &&
      !loadingFormData &&
      prevStepData &&
      connectorInfo &&
      !connectorInfo.spec.secretEngineManuallyConfigured
    ) {
      handleFetchEngines(prevStepData as ConnectorConfigDTO)
    }
  }, [isEditMode, loadingFormData, prevStepData, connectorInfo])

  useEffect(() => {
    if (
      isEditMode &&
      !loadingFormData &&
      loading &&
      connectorInfo &&
      !connectorInfo.spec.secretEngineManuallyConfigured
    ) {
      setSecretEngineOptions([
        {
          label: connectorInfo.spec.secretEngineName || '',
          value: `${connectorInfo.spec.secretEngineName || ''}@@@${connectorInfo.spec.secretEngineVersion || 2}`
        }
      ])
    }
  }, [isEditMode, loadingFormData, loading, connectorInfo])

  const handleCreateOrEdit = async (formData: SetupEngineFormData): Promise<void> => {
    modalErrorHandler?.hide()
    if (prevStepData) {
      const data: ConnectorRequestBody = buildVaultPayload({ ...prevStepData, ...formData })

      try {
        setSavingDataInProgress(true)
        if (isEditMode) {
          const response = await updateConnector(data)
          nextStep?.({ ...prevStepData, ...formData })
          onConnectorCreated?.(response.data)
          showSuccess(getString('connectors.updatedSuccessfully'))
        } else {
          const response = await createConnector(data)
          nextStep?.({ ...prevStepData, ...formData })
          onConnectorCreated?.(response.data)
          showSuccess(getString('connectors.createdSuccessfully'))
        }
      } catch (err) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(err?.data?.message)
      } finally {
        setSavingDataInProgress(false)
      }
    }
  }

  return loadingFormData || savingDataInProgress ? (
    <PageSpinner message={savingDataInProgress ? getString('connectors.hashiCorpVault.saveInProgress') : undefined} />
  ) : (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ variation: FontVariation.H3 }} padding={{ bottom: 'xlarge' }} color={Color.BLACK}>
        {getString('connectors.hashiCorpVault.setupEngine')}
      </Text>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<SetupEngineFormData>
        enableReinitialize
        initialValues={initialValues}
        formName="vaultConfigForm"
        validationSchema={Yup.object().shape({
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
          })
        })}
        onSubmit={formData => {
          handleCreateOrEdit(formData)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Container height={490}>
                <FormInput.RadioGroup
                  name="engineType"
                  label={getString('connectors.hashiCorpVault.secretEngine')}
                  radioGroup={{ inline: true }}
                  items={engineTypeOptions}
                />
                {formik.values['engineType'] === 'fetch' ? (
                  <Layout.Horizontal spacing="medium">
                    <FormInput.Select
                      name="secretEngine"
                      items={secretEngineOptions}
                      disabled={secretEngineOptions.length === 0 || loading}
                    />
                    <Button
                      intent="primary"
                      text={getString('connectors.hashiCorpVault.fetchEngines')}
                      onClick={() => handleFetchEngines(prevStepData as ConnectorConfigDTO)}
                      disabled={loading}
                      loading={loading}
                    />
                  </Layout.Horizontal>
                ) : null}
                {formik.values['engineType'] === 'manual' ? (
                  <Layout.Horizontal spacing="medium">
                    <FormInput.Text name="secretEngineName" label={getString('connectors.hashiCorpVault.engineName')} />
                    <FormInput.Text
                      name="secretEngineVersion"
                      label={getString('connectors.hashiCorpVault.engineVersion')}
                    />
                  </Layout.Horizontal>
                ) : null}
              </Container>
              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.SECONDARY}
                  icon="chevron-left"
                  text={getString('back')}
                  onClick={() => previousStep?.(prevStepData)}
                />
                <Button
                  type="submit"
                  intent="primary"
                  rightIcon="chevron-right"
                  text={getString('saveAndContinue')}
                  disabled={creating || updating}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default SetupEngine
