import React from 'react'
import { FormInput } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import type { FormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { VaultConfigFormData, HashiCorpVaultAccessTypes } from '@connectors/interfaces/ConnectorInterface'

interface VaultConnectorFormFieldsProps {
  formik: FormikContext<VaultConfigFormData>
}

const VaultConnectorFormFields: React.FC<VaultConnectorFormFieldsProps> = ({ formik }) => {
  const { getString } = useStrings()

  const accessTypeOptions: IOptionProps[] = [
    {
      label: getString('connectors.hashiCorpVault.appRole'),
      value: HashiCorpVaultAccessTypes.APP_ROLE
    },
    {
      label: getString('token'),
      value: HashiCorpVaultAccessTypes.TOKEN
    },
    {
      label: getString('connectors.hashiCorpVault.vaultAgent'),
      value: HashiCorpVaultAccessTypes.VAULT_AGENT
    }
  ]

  return (
    <>
      <FormInput.Text name="vaultUrl" label={getString('connectors.hashiCorpVault.vaultUrl')} />
      <FormInput.Text name="basePath" label={getString('connectors.hashiCorpVault.baseSecretPath')} />
      <FormInput.Text
        name="namespace"
        label={getString('common.namespace')}
        placeholder={getString('connectors.hashiCorpVault.root')}
      />
      <FormInput.RadioGroup
        name="accessType"
        label={getString('authentication')}
        radioGroup={{ inline: true }}
        items={accessTypeOptions}
      />
      {formik?.values['accessType'] === HashiCorpVaultAccessTypes.APP_ROLE ? (
        <>
          <FormInput.Text name="appRoleId" label={getString('connectors.hashiCorpVault.appRoleId')} />
          <SecretInput
            name="secretId"
            label={getString('connectors.hashiCorpVault.secretId')}
            connectorTypeContext={'Vault'}
          />
        </>
      ) : formik?.values['accessType'] === HashiCorpVaultAccessTypes.TOKEN ? (
        <SecretInput name="authToken" label={getString('token')} connectorTypeContext={'Vault'} />
      ) : (
        <FormInput.Text name="sinkPath" label={getString('connectors.hashiCorpVault.sinkPath')} />
      )}
      {formik?.values['accessType'] !== HashiCorpVaultAccessTypes.VAULT_AGENT ? (
        <FormInput.Text name="renewalIntervalMinutes" label={getString('connectors.hashiCorpVault.renewal')} />
      ) : null}
      <FormInput.CheckBox
        name="readOnly"
        label={getString('connectors.hashiCorpVault.readOnlyVault')}
        padding={{ left: 'xxlarge' }}
      />
      <FormInput.CheckBox
        name="default"
        label={getString('connectors.hashiCorpVault.defaultVault')}
        padding={{ left: 'xxlarge' }}
      />
    </>
  )
}

export default VaultConnectorFormFields
