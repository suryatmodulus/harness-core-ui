import React from 'react'
import { FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import SecretInput from '@secrets/components/SecretInput/SecretInput'

const AzureKeyVaultFormFields: React.FC = () => {
  const { getString } = useStrings()

  return (
    <>
      <FormInput.Text name="clientId" label={getString('common.clientId')} />
      <FormInput.Text name="tenantId" label={getString('connectors.azureKeyVault.labels.tenantId')} />
      <FormInput.Text name="subscription" label={getString('connectors.azureKeyVault.labels.subscription')} />
      <SecretInput name="secretKey" label={getString('keyLabel')} connectorTypeContext={'AzureKeyVault'} />

      <FormInput.CheckBox
        name="default"
        label={getString('connectors.hashiCorpVault.defaultVault')}
        padding={{ left: 'xxlarge' }}
      />
    </>
  )
}

export default AzureKeyVaultFormFields
