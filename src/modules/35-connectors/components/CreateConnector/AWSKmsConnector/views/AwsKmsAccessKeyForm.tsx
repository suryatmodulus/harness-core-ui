import React from 'react'
import type { FormikProps } from 'formik'
import { FormInput, Text, Color, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import { NameValuePair, useListAwsRegions } from 'services/portal'
import { AwsKmsConfigFormData, CredTypeValues } from './AwsKmsConfig'

interface AwsKmsAccessKeyFormProps {
  formik: FormikProps<AwsKmsConfigFormData>
  accountId: string
}

const AwsKmsAccessKeyForm: React.FC<AwsKmsAccessKeyFormProps> = ({ formik, accountId }) => {
  const { getString } = useStrings()

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions = (regionData?.resource || []).map(
    (region: NameValuePair) =>
      ({
        value: region.value,
        label: region.name
      } as SelectOption)
  )

  return (
    <>
      <Text font={{ size: 'medium' }} style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.BLACK}>
        {getString('authentication')}
      </Text>
      {formik.values?.credType === CredTypeValues.ManualConfig && (
        <>
          <FormInput.Text name="accessKey" label={getString('connectors.awsKms.accessKeyLabel')} />
          <FormInput.Text
            inputGroup={{ type: 'password' }}
            name="secretKey"
            label={getString('connectors.awsKms.secretKeyLabel')}
          />
        </>
      )}

      <FormInput.Text name="awsArn" label={getString('connectors.awsKms.arnLabel')} />
      <FormInput.MultiTypeInput
        name="region"
        selectItems={regions}
        multiTypeInputProps={{
          selectProps: {
            defaultSelectedItem: formik.values.region,
            items: regions
          }
        }}
        label={getString('pipelineSteps.regionLabel')}
      />
    </>
  )
}

export default AwsKmsAccessKeyForm
