import React from 'react'
import type { FormikProps } from 'formik'
import { FormInput, Text, Color, ModalErrorHandlerBinding, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { AwsSecretManagerConfigFormData, CredTypeValues } from '@connectors/interfaces/ConnectorInterface'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { Connectors } from '@connectors/constants'

interface AwsSecretManagerAccessKeyFormProps {
  formik: FormikProps<AwsSecretManagerConfigFormData>
  accountId: string
  modalErrorHandler?: ModalErrorHandlerBinding
}

const AwsSecretManagerAccessKeyForm: React.FC<AwsSecretManagerAccessKeyFormProps> = ({
  formik,
  accountId,
  modalErrorHandler
}) => {
  const { getString } = useStrings()

  const {
    data: regionData,
    loading,
    error
  } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  if (error) {
    modalErrorHandler?.showDanger(error.message)
  }

  const regionValues =
    regionData?.resource?.map(region => ({
      value: region.value,
      label: region.name || ''
    })) || []

  return (
    <>
      <Text font={{ size: 'medium' }} style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.BLACK}>
        {getString('authentication')}
      </Text>
      {formik.values?.credType === CredTypeValues.ManualConfig && (
        <>
          <SecretInput
            name="accessKey"
            label={getString('connectors.awsKms.accessKeyLabel')}
            connectorTypeContext={Connectors.AWS_SECRET_MANAGER}
          />
          <SecretInput
            name="secretKey"
            label={getString('connectors.awsKms.secretKeyLabel')}
            connectorTypeContext={Connectors.AWS_SECRET_MANAGER}
          />
        </>
      )}
      <FormInput.Text name="secretNamePrefix" label={getString('connectors.awsSecretManager.secretNamePrefix')} />
      {loading ? (
        <Icon margin="medium" name="spinner" size={15} color={Color.BLUE_500} />
      ) : (
        <FormInput.Select name="region" items={regionValues} label={getString('regionLabel')} />
      )}
    </>
  )
}

export default AwsSecretManagerAccessKeyForm
