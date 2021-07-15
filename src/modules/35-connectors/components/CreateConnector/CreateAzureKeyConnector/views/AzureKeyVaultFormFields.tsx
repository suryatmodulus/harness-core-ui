import React, { useState } from 'react'
import { FormInput, Layout, Button, SelectOption, ModalErrorHandlerBinding } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { FormikContext } from 'formik'
import {
  AzureKeyVaultMetadataRequestSpecDTO,
  useGetMetadata,
  AzureKeyVaultMetadataSpecDTO,
  ConnectorInfoDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { shouldShowError } from '@common/utils/errorUtils'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { AzureKeyVaultFormData } from './AzureKeyVaultForm'
interface AzureKeyVaultFormFieldsProps {
  formik: FormikContext<AzureKeyVaultFormData>
  identifier: string
  isEditing?: boolean
  modalErrorHandler?: ModalErrorHandlerBinding
  connectorInfo?: ConnectorInfoDTO | void
  mock?: SelectOption
  loadingFormData?: boolean
}

const AzureKeyVaultFormFields: React.FC<AzureKeyVaultFormFieldsProps> = ({
  formik,
  isEditing,
  identifier,
  modalErrorHandler,
  connectorInfo,
  mock,
  loadingFormData
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [vaultNameOptions, setVaultNameOptions] = useState<SelectOption[]>([])
  const { mutate: getMetadata, loading } = useGetMetadata({
    queryParams: { accountIdentifier: accountId }
  })

  React.useEffect(() => {
    if (isEditing && !loadingFormData) {
      handleFetchEngines(formik.values)
    }
  }, [isEditing, loadingFormData])

  React.useEffect(() => {
    if (isEditing && !loadingFormData && formik.values.vaultName && loading) {
      setVaultNameOptions([{ label: formik.values.vaultName, value: formik.values.vaultName }])
    }
  }, [isEditing, loadingFormData, loading])

  React.useEffect(() => {
    if (mock) {
      setVaultNameOptions([{ label: mock.label, value: mock.value }])
      formik.setFieldValue('vaultName', mock)
    }
  }, [mock])

  const handleFetchEngines = async (formData: AzureKeyVaultFormData): Promise<void> => {
    modalErrorHandler?.hide()
    try {
      const { data } = await getMetadata({
        identifier: identifier,
        encryptionType: 'AZURE_VAULT',
        orgIdentifier,
        projectIdentifier,
        spec: {
          clientId: formData.clientId?.trim(),
          tenantId: formData.tenantId?.trim(),
          subscription: formData.subscription?.trim(),
          secretKey: (connectorInfo as any)?.spec?.secretKey || formData.secretKey?.referenceString
        } as AzureKeyVaultMetadataRequestSpecDTO
      })
      setVaultNameOptions(
        (data?.spec as AzureKeyVaultMetadataSpecDTO)?.vaultNames?.map(vaultName => {
          return {
            label: vaultName,
            value: vaultName
          }
        }) || []
      )
    } catch (err) {
      if (shouldShowError(err)) {
        modalErrorHandler?.showDanger(err.data?.message || err.message)
      }
    }
  }
  const isFetchDisabled = (formData: AzureKeyVaultFormData): boolean => {
    if (
      !formData.clientId?.trim() ||
      !formData.tenantId?.trim() ||
      !formData.subscription?.trim() ||
      !formData.secretKey?.referenceString ||
      loading ||
      loadingFormData
    )
      return true
    return false
  }

  return (
    <>
      <FormInput.Text name="clientId" label={getString('common.clientId')} />
      <FormInput.Text name="tenantId" label={getString('connectors.azureKeyVault.labels.tenantId')} />
      <FormInput.Text name="subscription" label={getString('connectors.azureKeyVault.labels.subscription')} />
      <SecretInput name="secretKey" label={getString('keyLabel')} connectorTypeContext={'AzureKeyVault'} />
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <FormInput.Select
          name="vaultName"
          label={getString('connectors.azureKeyVault.labels.vaultName')}
          items={vaultNameOptions}
          disabled={vaultNameOptions.length === 0 || loading}
        />
        <Button
          margin={{ top: 'xsmall' }}
          intent="primary"
          text={getString('connectors.azureKeyVault.labels.fetchVault')}
          onClick={() => handleFetchEngines(formik.values)}
          disabled={isFetchDisabled(formik.values)}
          loading={loading}
        />
      </Layout.Horizontal>
      <FormInput.CheckBox
        name="default"
        label={getString('connectors.hashiCorpVault.defaultVault')}
        padding={{ left: 'xxlarge' }}
      />
    </>
  )
}

export default AzureKeyVaultFormFields
