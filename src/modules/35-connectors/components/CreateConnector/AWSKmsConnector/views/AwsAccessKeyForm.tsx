import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'
import {
  FormInput,
  SelectOption,
  Text,
  Color,
  Container,
  FormikForm,
  Formik,
  Button,
  Layout
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { useListAwsRegions } from 'services/portal'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import { setupAwsKmsFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { AwsKmsConfigDataProps } from './AwsKmsConfig'

export interface AwsAccessKeyFormData {
  accessKey?: string
  secretKey?: SecretReference
  awsArn?: SecretReference
  region?: SelectOption
}

const defaultInitialFormData: AwsAccessKeyFormData = {
  accessKey: undefined,
  secretKey: undefined,
  awsArn: undefined,
  region: undefined
}

const AwsAccessKeyForm: React.FC<AwsKmsConfigDataProps> = ({
  onSubmit,
  connectorInfo,
  isEditMode,
  isLoading,
  previousStep,
  prevStepData
}) => {
  const { getString } = useStrings()
  const { accountId } = useParams()
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && isEditMode)

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })
  const regions = (regionData?.resource || []).map((region: any) => ({
    value: region.value,
    label: region.name
  }))

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (isEditMode) {
        if (connectorInfo) {
          setupAwsKmsFormData(connectorInfo, accountId).then(data => {
            setInitialValues(data as AwsAccessKeyFormData)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  return (
    <Formik<AwsAccessKeyFormData>
      initialValues={{ ...initialValues }}
      validationSchema={Yup.object().shape({
        accessKey: Yup.string().trim().required(getString('connectors.aws.validation.accessKey')),
        secretKey: Yup.string().trim().required(getString('connectors.aws.validation.secretKeyRef')),
        awsArn: Yup.string().trim().required(getString('connectors.aws.validation.crossAccountRoleArn'))
      })}
      onSubmit={formData => {
        onSubmit(formData)
      }}
    >
      {formik => {
        return (
          <FormikForm>
            <Container style={{ minHeight: 460, marginTop: 'var(--spacing-xxlarge)' }}>
              <Text font={{ size: 'medium' }} style={{ marginBottom: 'var(--spacing-medium)' }} color={Color.BLACK}>
                {getString('authentication')}
              </Text>
              <FormInput.Text name="accessKey" label={getString('connectors.awsKms.accessKeyLabel')} />
              <SecretInput name="secretKey" label={getString('connectors.awsKms.secretKeyLabel')} />
              <SecretInput name="awsArn" label={getString('connectors.awsKms.arnLabel')} />
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
            </Container>
            <Layout.Horizontal spacing="medium">
              <Button text={getString('back')} onClick={() => previousStep?.(prevStepData)} />
              <Button
                type="submit"
                intent="primary"
                rightIcon="chevron-right"
                text={getString('saveAndContinue')}
                disabled={isLoading}
              />
            </Layout.Horizontal>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export default AwsAccessKeyForm
