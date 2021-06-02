import React, { useEffect, useState, useMemo } from 'react'
import * as Yup from 'yup'
import { Container, FormikForm, Layout, FormInput, Formik, Button, SelectOption } from '@wings-software/uicore'
import { buildSumoLogicPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { useToaster } from '@common/exports'
import { useGetSumoLogicEndPoints } from 'services/cv'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { initializeSumoLogicConnectorWithStepData } from './utils'
import { StepDetailsHeader } from '../CommonCVConnector/CredentialsStepHeader'
import css from './CreateSumoLogicConnector.module.scss'

export function SumoLogicConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, projectIdentifier, orgIdentifier, accountId, isEditMode } = props
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { data: endPoints, error: endPointError, loading: loadingEndpoints } = useGetSumoLogicEndPoints({})

  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    url: '',
    apiKeyRef: {},
    applicationKeyRef: {},
    accountId,
    projectIdentifier,
    orgIdentifier,
    loading: true
  })

  useEffect(() => {
    async function updateStepData(): Promise<void> {
      const value = await initializeSumoLogicConnectorWithStepData(prevStepData, accountId)
      value && setInitialValues(value)
    }
    updateStepData()
  }, [prevStepData, accountId])

  const endPointOptions = useMemo((): SelectOption[] => {
    if (loadingEndpoints) {
      return [{ label: getString('loading'), value: '' }]
    } else if (endPointError?.message) {
      clear()
      showError(endPointError?.message)
      return []
    }
    const filteredPoints: SelectOption[] = []
    for (const endPoint of endPoints?.data || []) {
      if (endPoint) {
        filteredPoints.push({ label: endPoint, value: endPoint })
      }
    }

    // set default value
    if (!isEditMode && !initialValues.url) {
      setInitialValues({ ...initialValues, url: filteredPoints[0].label })
    }
    return filteredPoints
  }, [endPoints, endPointError, loadingEndpoints])

  if (initialValues?.loading) {
    return <PageSpinner />
  }

  return (
    <Container className={css.credentials}>
      <StepDetailsHeader connectorTypeLabel={getString('connectors.title.sumoLogic')} />
      <Formik
        enableReinitialize
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('connectors.sumoLogic.urlValidation')),
          accessIdRef: Yup.string().trim().required(getString('connectors.sumoLogic.encryptedAccessIdValidation')),
          accesskeyRef: Yup.string().trim().required(getString('connectors.sumoLogic.encryptedAccessKeyValidation'))
        })}
        onSubmit={(formData: ConnectorConfigDTO) => nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })}
      >
        <FormikForm className={css.form}>
          <Layout.Vertical spacing="large" height={450}>
            <FormInput.Select items={endPointOptions} label={getString('connectors.sumoLogic.urlLabel')} name="url" />
            <SecretInput label={getString('connectors.sumoLogic.encryptedAccessIdLabel')} name="accessIdRef" />
            <SecretInput label={getString('connectors.sumoLogic.encryptedAccessKeyLabel')} name="accesskeyRef" />
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
  connectorType: Connectors.SUMOLOGIC,
  ConnectorCredentialsStep: SumoLogicConfigStep,
  buildSubmissionPayload: buildSumoLogicPayload
})
