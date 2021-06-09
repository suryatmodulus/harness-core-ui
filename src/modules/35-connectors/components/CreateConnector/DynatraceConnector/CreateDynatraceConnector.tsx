import React, { useState, useEffect } from 'react'
import * as Yup from 'yup'
import { Container, Formik, FormikForm, Button, Layout, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { PageSpinner, useToaster } from '@common/components'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { buildDynatracePayload, setSecretField } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { StepDetailsHeader } from '../CommonCVConnector/CredentialsStepHeader'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import { initializeDynatraceConnectorWithStepData } from './utils'
import css from './CreateDynatraceConnector.module.scss'

export function DynatraceConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, projectIdentifier, orgIdentifier, accountId } = props
  const { getString } = useStrings()
  const [loadingSecrets, setLoadingSecrets] = useState(
    Boolean(props.prevStepData?.spec || props.prevStepData?.apiTokenRef)
  )
  const { showError, clear } = useToaster()
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    url: undefined,
    accountId,
    projectIdentifier,
    orgIdentifier
  })

  useEffect(() => {
    const updatedInitialValues = initializeDynatraceConnectorWithStepData(prevStepData)
    if (updatedInitialValues) {
      setInitialValues(originalValues => ({ ...originalValues, ...updatedInitialValues }))
    }

    if (updatedInitialValues?.apiTokenRef) {
      setSecretField(updatedInitialValues.apiTokenRef?.referenceString || updatedInitialValues.apiTokenRef, {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier
      })
        .then(result => {
          updatedInitialValues.apiTokenRef = result
          setLoadingSecrets(false)
          setInitialValues(currInitialVals => ({ ...currInitialVals, ...updatedInitialValues }))
        })
        .catch(e => {
          clear()
          showError(e, 7000)
          setLoadingSecrets(false)
        })
    }
  }, [prevStepData])

  if (loadingSecrets) {
    return <PageSpinner />
  }

  return (
    <Container className={css.credentials}>
      <StepDetailsHeader connectorTypeLabel={getString('connectors.dynatraceLabel')} />
      <Formik
        enableReinitialize
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('connectors.dynatrace.urlValidation')),
          apiTokenRef: Yup.string().trim().required(getString('connectors.dynatrace.apiTokenValidation'))
        })}
        onSubmit={(formData: ConnectorConfigDTO) => nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })}
      >
        <FormikForm className={css.form}>
          <FormInput.Text label={getString('UrlLabel')} name="url" />
          <SecretInput label={getString('connectors.dynatrace.apiToken')} name="apiTokenRef" />
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
  connectorType: 'Dynatrace',
  ConnectorCredentialsStep: DynatraceConfigStep,
  buildSubmissionPayload: buildDynatracePayload
})
