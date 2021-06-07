import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'
import { Container, Formik, FormikForm, Button, Layout, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { buildDynatracePayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { StepDetailsHeader } from '../CommonCVConnector/CredentialsStepHeader'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import { initializeDynatraceConnectorWithStepData } from './utils'
import css from './CreateDynatraceConnector.module.scss'

export function DynatraceConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, projectIdentifier, orgIdentifier, accountId } = props
  const { getString } = useStrings()
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    url: undefined,
    accountId,
    projectIdentifier,
    orgIdentifier
  })

  useEffect(() => {
    const updatedInitialValues = initializeDynatraceConnectorWithStepData(prevStepData)
    if (updatedInitialValues) {
      setInitialValues({ ...updatedInitialValues })
    }
  }, [prevStepData])

  return (
    <Container className={css.credentials}>
      <StepDetailsHeader connectorTypeLabel={getString('connectors.dynatraceLabel')} />
      <Formik
        enableReinitialize
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('connectors.dynatrace.urlValidation')),
          apiToken: Yup.string().trim().required(getString('connectors.dynatrace.apiTokenValidation'))
        })}
        onSubmit={(formData: ConnectorConfigDTO) => nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })}
      >
        <FormikForm className={css.form}>
          <FormInput.Text label={getString('UrlLabel')} name="url" />
          <SecretInput label={getString('connectors.dynatrace.apiToken')} name="apiToken" />
          <Layout.Horizontal spacing="large" className={css.buttonContainer}>
            <Button onClick={() => props.previousStep?.({ ...props.prevStepData })} text={getString('back')} />
            <Button type="submit" text={getString('next')} intent="primary" />
          </Layout.Horizontal>
        </FormikForm>
      </Formik>
    </Container>
  )
}

export default cvConnectorHOC({
  connectorType: 'Prometheus',
  ConnectorCredentialsStep: DynatraceConfigStep,
  buildSubmissionPayload: buildDynatracePayload
})
