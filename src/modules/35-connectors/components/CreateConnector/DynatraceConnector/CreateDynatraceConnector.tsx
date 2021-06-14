import React from 'react'
import * as Yup from 'yup'
import { Container, Formik, FormikForm, Button, Layout, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { buildDynatracePayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { StepDetailsHeader } from '../CommonCVConnector/components/CredentialsStepHeader/CredentialsStepHeader'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import { initializeDynatraceConnectorWithStepData } from './utils'
import { ConnectorSecretField } from '../CommonCVConnector/components/ConnectorSecretField/ConnectorSecretField'
import css from './CreateDynatraceConnector.module.scss'

export function DynatraceConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, projectIdentifier, orgIdentifier, accountId } = props
  const { getString } = useStrings()
  const initialValues = initializeDynatraceConnectorWithStepData({
    prevStepData,
    accountId,
    projectIdentifier,
    orgIdentifier
  })
  const secretValue = prevStepData?.apiTokenRef?.referenceString || prevStepData?.spec?.apiTokenRef

  return (
    <Container className={css.credentials}>
      <StepDetailsHeader connectorTypeLabel={getString('connectors.dynatraceLabel')} />
      <Formik
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('connectors.dynatrace.urlValidation')),
          apiTokenRef: Yup.string().trim().required(getString('connectors.dynatrace.apiTokenValidation'))
        })}
        onSubmit={(formData: ConnectorConfigDTO) => nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })}
      >
        {formikProps => (
          <FormikForm className={css.form}>
            <FormInput.Text label={getString('UrlLabel')} name="url" />
            <ConnectorSecretField
              secretFieldValue={secretValue}
              secretInputProps={{ label: getString('connectors.dynatrace.apiToken'), name: 'apiTokenRef' }}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              onSuccessfulFetch={result => formikProps.setFieldValue('apiTokenRef', result)}
            />
            <Layout.Horizontal spacing="large" className={css.buttonContainer}>
              <Button onClick={() => props.previousStep?.({ ...props.prevStepData })} text={getString('back')} />
              <Button type="submit" text={getString('next')} intent="primary" />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}

export default cvConnectorHOC({
  connectorType: 'Dynatrace',
  ConnectorCredentialsStep: DynatraceConfigStep,
  buildSubmissionPayload: buildDynatracePayload
})
