import React from 'react'
import type { FormikProps } from 'formik'
import { FormInput, Text, Color, SelectOption, Icon } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useListAwsRegions } from 'services/portal'
import { useToaster } from '@common/exports'
import { AwsKmsConfigFormData, CredTypeValues } from '@connectors/interfaces/ConnectorInterface'
import SecretInput from '@secrets/components/SecretInput/SecretInput'

interface AwsKmsAccessKeyFormProps {
  formik: FormikProps<AwsKmsConfigFormData>
  accountId: string
}

const AwsKmsAccessKeyForm: React.FC<AwsKmsAccessKeyFormProps> = ({ formik, accountId }) => {
  const { getString } = useStrings()

  const [regions, setRegions] = React.useState<SelectOption[]>([])

  const { showError } = useToaster()
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
    showError(error.message)
  }
  React.useEffect(() => {
    const regionValues = (regionData?.resource || []).map(region => ({
      value: region.value,
      label: region.name
    }))
    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])

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
            connectorTypeContext={'AwsKms'}
          />
          <SecretInput
            name="secretKey"
            label={getString('connectors.awsKms.secretKeyLabel')}
            connectorTypeContext={'AwsKms'}
          />
        </>
      )}
      <SecretInput name="awsArn" label={getString('connectors.awsKms.arnLabel')} connectorTypeContext={'AwsKms'} />
      {loading ? (
        <Icon margin="medium" name="spinner" size={15} color={Color.BLUE_500} />
      ) : (
        <FormInput.Select name="region" items={regions} label={getString('regionLabel')} />
      )}
    </>
  )
}

export default AwsKmsAccessKeyForm
