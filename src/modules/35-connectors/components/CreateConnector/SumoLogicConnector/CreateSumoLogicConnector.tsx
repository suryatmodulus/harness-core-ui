import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import { Container, FormikForm, Layout, FormInput, Formik, Button, SelectOption } from '@wings-software/uicore'
import { buildSumoLogicPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { useGetSumoLogicEndPoints } from 'services/cv'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { cvConnectorHOC } from '../CommonCVConnector/CVConnectorHOC'
import type { ConnectionConfigProps } from '../CommonCVConnector/constants'
import { initializeSumoLogicConnectorWithStepData } from './utils'
import { StepDetailsHeader } from '../CommonCVConnector/CredentialsStepHeader'
import css from './CreateSumoLogicConnector.module.scss'

export function SumoLogicConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, projectIdentifier, orgIdentifier, accountId } = props
  const { getString } = useStrings()
  const { data: endPoints, loading: loadingEndpoints } = useGetSumoLogicEndPoints({})
  const [urlList, updateUrlList] = useState<SelectOption[]>([])
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
    const filteredPoints: SelectOption[] = []
    for (const endPoint of endPoints?.data || []) {
      endPoint && filteredPoints.push({ label: endPoint, value: endPoint })
    }
    updateUrlList(filteredPoints)
  }, [endPoints, loadingEndpoints])

  useEffect(() => {
    async function updateStepData(): Promise<void> {
      const value = await initializeSumoLogicConnectorWithStepData(prevStepData, accountId)
      value && setInitialValues(value)
    }
    updateStepData()
  }, [prevStepData, accountId])

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
            <FormInput.Select
              items={loadingEndpoints ? [{ label: 'loading', value: '' }] : urlList}
              label={getString('connectors.sumoLogic.urlLabel')}
              name="url"
            />
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
