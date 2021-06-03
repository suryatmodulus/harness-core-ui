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
import { setupAzureKeyVaultFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { AzureKeyVaultFormData } from './AzureKeyVaultForm'
interface AzureKeyVaultFormFieldsProps {
  formik: FormikContext<AzureKeyVaultFormData>
  isEditing?: boolean
  identifier: string
  modalErrorHandler?: ModalErrorHandlerBinding
  connectorInfo?: ConnectorInfoDTO | void
  mock?: SelectOption
}

const hasFormChanged = (connectorInfo: ConnectorInfoDTO | void, values: AzureKeyVaultFormData) => {
  const connector = (connectorInfo && setupAzureKeyVaultFormData(connectorInfo)) || ({} as AzureKeyVaultFormData)
  if (
    connector.clientId === values.clientId &&
    connector.secretKey === values.secretKey &&
    connector.tenantId === values.tenantId &&
    connector.vaultName === values.vaultName &&
    connector.subscription === values.subscription &&
    connector.default === values.default
  ) {
    return false
  }
  return true
}

const AzureKeyVaultFormFields: React.FC<AzureKeyVaultFormFieldsProps> = ({
  formik,
  isEditing,
  identifier,
  modalErrorHandler,
  connectorInfo,
  mock
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [vaultNameOptions, setVaultNameOptions] = useState<SelectOption[]>([])
  const { mutate: getMetadata } = useGetMetadata({ queryParams: { accountIdentifier: accountId } })

  React.useEffect(() => {
    if (isEditing && formik.values.vaultName) {
      if (!hasFormChanged(connectorInfo, formik.values)) {
        setVaultNameOptions([{ label: formik.values.vaultName, value: formik.values.vaultName }])
      }
    }
  }, [isEditing, formik.values])

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
          secretKey: formData.secretKey?.trim()
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
      !formData.secretKey?.trim()
    )
      return true
    return false
  }

  return (
    <>
      <FormInput.Text name="clientId" label={getString('common.clientId')} />
      <FormInput.Text name="tenantId" label={getString('connectors.azureKeyVault.labels.tenantId')} />
      <FormInput.Text name="subscription" label={getString('connectors.azureKeyVault.labels.subscription')} />
      <FormInput.Text
        name="secretKey"
        label={getString('keyLabel')}
        inputGroup={{ type: 'password' }}
        placeholder={isEditing ? getString('encrypted') : ''}
      />
      <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <FormInput.Select
          name="vaultName"
          label={getString('connectors.azureKeyVault.labels.vaultName')}
          items={vaultNameOptions}
          disabled={vaultNameOptions.length === 0}
        />
        <Button
          margin={{ top: 'xsmall' }}
          intent="primary"
          text={getString('connectors.azureKeyVault.labels.fetchVault')}
          onClick={() => handleFetchEngines(formik.values)}
          disabled={isFetchDisabled(formik.values)}
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
