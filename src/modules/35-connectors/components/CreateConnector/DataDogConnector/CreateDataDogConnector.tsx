import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Container, FormikForm, Layout, FormInput, Formik, Button } from '@wings-software/uicore'
import { buildDatadogPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { initializeDatadogConnectorWithStepData, setDatadogSecrets } from './utils'
import { StepDetailsHeader } from '../CommonCVConnector/CredentialsStepHeader'
import css from './CreateDatadogConnector.module.scss'

export function DatadogConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, projectIdentifier, orgIdentifier, accountId } = props
  const { getString } = useStrings()
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    url: '',
    apiKeyRef: {},
    applicationKeyRef: {},
    accountId,
    projectIdentifier,
    orgIdentifier
  })

  useEffect(() => {
    const updatedInitialValues = initializeDatadogConnectorWithStepData(prevStepData)
    if (updatedInitialValues) {
      setDatadogSecrets(updatedInitialValues, accountId).then(result => {
        setInitialValues(result)
      })
    }
  }, [prevStepData])

  return (
    <Container className={css.credentials}>
      <StepDetailsHeader connectorTypeLabel={getString('connectors.title.datadog')} />
      <Formik
        enableReinitialize
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('connectors.datadog.urlValidation')),
          applicationKeyRef: Yup.string().trim().required(getString('connectors.datadog.encryptedAPPKeyValidation')),
          apiKeyRef: Yup.string().trim().required(getString('connectors.encryptedAPIKeyValidation'))
        })}
        onSubmit={(formData: ConnectorConfigDTO) => nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })}
      >
        <FormikForm className={css.form}>
          <Layout.Vertical spacing="large" height={450}>
            <FormInput.Text label={getString('UrlLabel')} name="url" />
            <SecretInput label={getString('connectors.datadog.encryptedAPPKeyLabel')} name="applicationKeyRef" />
            <SecretInput label={getString('connectors.encryptedAPIKeyLabel')} name="apiKeyRef" />
          </Layout.Vertical>
          <Layout.Horizontal spacing="xlarge">
            <Button onClick={() => props.previousStep?.({ ...props.prevStepData })} text={getString('back')} />
            <Button type="submit" text={getString('next')} intent="primary" />
          </Layout.Horizontal>
        </FormikForm>
      </Formik>
    </Container>
  )
}

export default cvConnectorHOC({
  connectorType: Connectors.DATADOG,
  ConnectorCredentialsStep: DatadogConfigStep,
  buildSubmissionPayload: buildDatadogPayload
})
