import React, { useState } from 'react'
import { FormInput, Layout, Button, SelectOption } from '@wings-software/uicore'
import type { IOptionProps } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import type { FormikContext } from 'formik'
import {
  VaultAppRoleCredentialDTO,
  VaultAuthTokenCredentialDTO,
  VaultMetadataRequestSpecDTO,
  VaultMetadataSpecDTO,
  useGetMetadata,
  VaultConnectorDTO
} from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { shouldShowError } from '@common/utils/errorUtils'
import type { VaultConfigFormData } from './VaultConfigForm'

const accessTypeOptions: IOptionProps[] = [
  {
    label: 'App Role',
    value: 'APP_ROLE'
  },
  {
    label: 'Token',
    value: 'TOKEN'
  }
]

const engineTypeOptions: IOptionProps[] = [
  {
    label: 'Fetch Engines',
    value: 'fetch'
  },
  {
    label: 'Manually Configure Engine',
    value: 'manual'
  }
]

interface VaultConnectorFormFieldsProps {
  formik: FormikContext<VaultConfigFormData>
  isEditing?: boolean
  identifier: string
  accessType?: VaultConnectorDTO['accessType']
  onMetadataLoadingStateChange: (val: boolean) => void
}

const VaultConnectorFormFields: React.FC<VaultConnectorFormFieldsProps> = ({
  formik,
  identifier,
  isEditing,
  accessType,
  onMetadataLoadingStateChange
}) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showError } = useToaster()
  const { getString } = useStrings()
  const [secretEngineOptions, setSecretEngineOptions] = useState<SelectOption[]>([])
  const { mutate: getMetadata, loading } = useGetMetadata({ queryParams: { accountIdentifier: accountId } })

  const handleFetchEngines = async (formData: VaultConfigFormData): Promise<void> => {
    try {
      const res = await getMetadata({
        identifier,
        encryptionType: 'VAULT',
        orgIdentifier,
        projectIdentifier,
        spec: {
          url: formData.vaultUrl,
          accessType: formData.accessType.toUpperCase(),
          spec:
            formData.accessType === 'APP_ROLE'
              ? ({
                  appRoleId: formData.appRoleId,
                  secretId: formData.secretId
                } as VaultAppRoleCredentialDTO)
              : ({
                  authToken: formData.authToken
                } as VaultAuthTokenCredentialDTO)
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
  const isFetchDisabled = (formData: VaultConfigFormData): boolean => {
    if (!formData.vaultUrl?.trim()) return true
    switch (formData.accessType) {
      case 'APP_ROLE':
        if (!formData.appRoleId?.trim() || !formData.secretId?.trim()) return true
        break
      case 'TOKEN':
        if (!formData.authToken?.trim()) return true
        break
    }
    return false
  }

  React.useEffect(() => {
    if (isEditing && formik.values.engineType === 'fetch') handleFetchEngines(formik.values)
  }, [isEditing])

  React.useEffect(() => {
    onMetadataLoadingStateChange(loading)
  }, [loading])

  return (
    <>
      <FormInput.Text name="vaultUrl" label={getString('connectors.hashiCorpVault.vaultUrl')} />
      <FormInput.Text name="basePath" label={getString('connectors.hashiCorpVault.baseSecretPath')} />
      <FormInput.RadioGroup
        name="accessType"
        label={getString('authentication')}
        radioGroup={{ inline: true }}
        items={accessTypeOptions}
      />
      {formik?.values['accessType'] === 'APP_ROLE' ? (
        <Layout.Horizontal spacing="medium">
          <FormInput.Text name="appRoleId" label={getString('connectors.hashiCorpVault.appRoleId')} />
          <FormInput.Text
            name="secretId"
            label={getString('connectors.hashiCorpVault.secretId')}
            placeholder={isEditing && accessType === 'APP_ROLE' ? getString('encrypted') : ''}
            inputGroup={{ type: 'password' }}
          />
        </Layout.Horizontal>
      ) : (
        <FormInput.Text
          name="authToken"
          label={getString('token')}
          inputGroup={{ type: 'password' }}
          placeholder={isEditing && accessType === 'TOKEN' ? getString('encrypted') : ''}
        />
      )}
      <FormInput.RadioGroup
        name="engineType"
        label="Secret Engine"
        radioGroup={{ inline: true }}
        items={engineTypeOptions}
      />
      {formik.values['engineType'] === 'fetch' ? (
        <Layout.Horizontal spacing="medium">
          <FormInput.Select
            name="secretEngine"
            items={secretEngineOptions}
            disabled={secretEngineOptions.length === 0}
          />
          <Button
            intent="primary"
            text="Fetch Engines"
            onClick={() => handleFetchEngines(formik.values)}
            disabled={isEditing ? false : isFetchDisabled(formik.values)}
          />
        </Layout.Horizontal>
      ) : null}
      {formik.values['engineType'] === 'manual' ? (
        <Layout.Horizontal spacing="medium">
          <FormInput.Text name="secretEngineName" label={getString('connectors.hashiCorpVault.engineName')} />
          <FormInput.Text name="secretEngineVersion" label={getString('connectors.hashiCorpVault.engineVersion')} />
        </Layout.Horizontal>
      ) : null}

      <FormInput.Text name="renewalIntervalMinutes" label={getString('connectors.hashiCorpVault.renewal')} />
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
