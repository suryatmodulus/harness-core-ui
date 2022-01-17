/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Container, FormikForm, Layout, Formik, Button, PageSpinner } from '@wings-software/uicore'
import { buildPagerDutyPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { initializePagerDutyConnectorWithStepData } from './CreatePagerDutyConnector.utils'
import { StepDetailsHeader } from '../CommonCVConnector/components/CredentialsStepHeader/CredentialsStepHeader'
import css from './CreatePagerDutyConnector.module.scss'

export function PagerDutyConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, projectIdentifier, orgIdentifier, accountId } = props
  const { getString } = useStrings()
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    url: '',
    apiTokenRef: {},
    applicationKeyRef: {},
    accountId,
    projectIdentifier,
    orgIdentifier,
    loading: true
  })

  useEffect(() => {
    async function updateStepData(): Promise<void> {
      const value = await initializePagerDutyConnectorWithStepData(prevStepData, accountId)
      value && setInitialValues(value)
    }
    updateStepData()
  }, [prevStepData, accountId])

  if (initialValues?.loading) {
    return <PageSpinner />
  }

  return (
    <Container className={css.credentials}>
      <StepDetailsHeader connectorTypeLabel={getString('common.pagerDuty')} />
      <Formik
        formName="createPagerDutyConnectorsForm"
        enableReinitialize
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          apiTokenRef: Yup.string().trim().required(getString('connectors.encryptedAPIKeyValidation'))
        })}
        onSubmit={(formData: ConnectorConfigDTO) => nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })}
      >
        <FormikForm className={css.form}>
          <Layout.Vertical spacing="large" height={450}>
            <SecretInput label={getString('connectors.encryptedAPIKeyLabel')} name="apiTokenRef" />
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
  connectorType: Connectors.PAGER_DUTY,
  ConnectorCredentialsStep: PagerDutyConfigStep,
  buildSubmissionPayload: buildPagerDutyPayload
})
