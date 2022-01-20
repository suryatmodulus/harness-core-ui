/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Container, FormikForm, Layout, FormInput, Formik, Button, PageSpinner } from '@wings-software/uicore'
import { buildErrorTrackingPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { initializeErrorTrackingConnectorWithStepData } from './utils'
import { StepDetailsHeader } from '../CommonCVConnector/components/CredentialsStepHeader/CredentialsStepHeader'
import css from './CreateErrorTrackingConnector.module.scss'

export function ErrorTrackingConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, projectIdentifier, orgIdentifier, accountId } = props
  const { getString } = useStrings()
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    url: '',
    sid: '',
    apiKeyRef: {},
    accountId,
    projectIdentifier,
    orgIdentifier,
    loading: true
  })

  useEffect(() => {
    async function updateStepData(): Promise<void> {
      const value = await initializeErrorTrackingConnectorWithStepData(prevStepData, accountId)
      value && setInitialValues(value)
    }
    updateStepData()
  }, [prevStepData, accountId])

  if (initialValues?.loading) {
    return <PageSpinner />
  }

  return (
    <Container className={css.credentials}>
      <StepDetailsHeader connectorTypeLabel={getString('connectors.title.errorTracking')} />
      <Formik
        formName="createErrorTrackingConnectorsForm"
        enableReinitialize
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('connectors.errorTracking.urlValidation')),
          sid: Yup.string().trim().required(getString('connectors.errorTracking.sidValidation')),
          apiKeyRef: Yup.string().trim().required(getString('connectors.encryptedAPIKeyValidation'))
        })}
        onSubmit={(formData: ConnectorConfigDTO) => nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })}
      >
        <FormikForm className={css.form}>
          <Layout.Vertical spacing="large" height={450}>
            <FormInput.Text label={getString('UrlLabel')} name="url" />
            <FormInput.Text label={getString('connectors.errorTracking.sidLabel')} name="sid" />
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
  connectorType: Connectors.ERROR_TRACKING,
  ConnectorCredentialsStep: ErrorTrackingConfigStep,
  buildSubmissionPayload: buildErrorTrackingPayload
})
