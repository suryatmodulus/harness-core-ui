import React, { useState } from 'react'
import * as Yup from 'yup'
import { StepProps, Container, Text, Formik, FormikForm, Layout, Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { AzureKeyVaultConnectorDTO } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import { setupAzureKeyVaultFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import type { StepDetailsProps, ConnectorDetailsProps } from '@connectors/interfaces/ConnectorInterface'
import AzureKeyVaultFormFields from './AzureKeyVaultFormFields'
import css from '../CreateAzureKeyVaultConnector.module.scss'

export interface AzureKeyVaultFormData {
  clientId?: string
  secretKey?: SecretReference
  tenantId?: string
  subscription?: string
  default?: boolean
}

const AzureKeyVaultForm: React.FC<StepProps<StepDetailsProps> & ConnectorDetailsProps> = props => {
  const { prevStepData, previousStep, isEditMode, nextStep, connectorInfo, accountId } = props
  const { getString } = useStrings()

  const defaultInitialFormData: AzureKeyVaultFormData = {
    clientId: undefined,
    tenantId: undefined,
    subscription: undefined,
    secretKey: undefined,
    default: false
  }

  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingFormData, setLoadingFormData] = useState(isEditMode)

  React.useEffect(() => {
    if (isEditMode && connectorInfo) {
      setupAzureKeyVaultFormData(connectorInfo, accountId).then(data => {
        setInitialValues(data as AzureKeyVaultFormData)
        setLoadingFormData(false)
      })
    }
  }, [isEditMode, connectorInfo])

  return (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ size: 'medium' }} padding={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>
      <Formik<AzureKeyVaultFormData>
        formName="azureKeyVaultForm"
        enableReinitialize
        initialValues={{ ...initialValues, ...prevStepData }}
        validationSchema={Yup.object().shape({
          clientId: Yup.string().required(getString('connectors.azureKeyVault.validation.clientId')),
          tenantId: Yup.string().required(getString('connectors.azureKeyVault.validation.tenantId')),
          subscription: Yup.string().required(getString('connectors.azureKeyVault.validation.subscription')),
          secretKey: Yup.string().when('vaultName', {
            is: () => !(prevStepData?.spec as AzureKeyVaultConnectorDTO)?.vaultName,
            then: Yup.string().trim().required(getString('common.validation.keyIsRequired'))
          })
        })}
        onSubmit={formData => {
          nextStep?.({ ...connectorInfo, ...prevStepData, ...formData } as StepDetailsProps)
        }}
      >
        <FormikForm>
          <Container className={css.formHeight} margin={{ top: 'medium', bottom: 'xxlarge' }}>
            <AzureKeyVaultFormFields />
          </Container>
          <Layout.Horizontal spacing="medium">
            <Button text={getString('back')} onClick={() => previousStep?.(prevStepData)} />
            <Button
              type="submit"
              intent="primary"
              rightIcon="chevron-right"
              text={getString('continue')}
              disabled={loadingFormData}
            />
          </Layout.Horizontal>
        </FormikForm>
      </Formik>
      {loadingFormData ? <PageSpinner /> : null}
    </Container>
  )
}

export default AzureKeyVaultForm
