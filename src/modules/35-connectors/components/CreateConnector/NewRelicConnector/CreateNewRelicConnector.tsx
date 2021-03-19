import React, { useState, useEffect, useMemo } from 'react'
import {
  StepWizard,
  StepProps,
  Layout,
  Button,
  Text,
  FormInput,
  FormikForm,
  Container,
  SelectOption
} from '@wings-software/uicore'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { useToaster } from '@common/exports'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import {
  useCreateConnector,
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  ResponseBoolean,
  useUpdateConnector
} from 'services/cd-ng'
import { useGetNewRelicEndPoints } from 'services/cv'
import { setSecretField } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/exports'
import type { CreateConnectorModalProps } from '@connectors/constants'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import css from './CreateNewRelicConnector.module.scss'

const NewRelicLabel = { type: 'New Relic' }

interface CreateNewRelicConnectorProps extends CreateConnectorModalProps {
  mockIdentifierValidate?: ResponseBoolean
}

interface ConnectionConfigProps extends StepProps<ConnectorConfigDTO> {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  handleCreate: (data: ConnectorConfigDTO) => Promise<ConnectorInfoDTO | undefined>
  handleUpdate: (data: ConnectorConfigDTO) => Promise<ConnectorInfoDTO | undefined>
  isEditMode: boolean
  connectorInfo?: ConnectorInfoDTO | void
}

function ConnectionConfigStep(props: ConnectionConfigProps): JSX.Element {
  const [loadingSecrets, setLoadingSecrets] = useState(props.isEditMode)
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { data: endPoints, error: endPointError, loading: loadingEndpoints } = useGetNewRelicEndPoints({})
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    url: '',
    newRelicAccountId: '',
    apiKeyRef: undefined
  })
  useEffect(() => {
    ;(async () => {
      if (props.isEditMode) {
        setInitialValues({
          url: props.prevStepData?.spec?.url || '',
          newRelicAccountId: props.prevStepData?.spec?.newRelicAccountId || '',
          apiKeyRef: await setSecretField((props.connectorInfo as ConnectorInfoDTO)?.spec?.apiKeyRef, {
            accountIdentifier: props.accountId,
            projectIdentifier: props.projectIdentifier,
            orgIdentifier: props.orgIdentifier
          })
        })
        setLoadingSecrets(false)
      }
    })()
  }, [])

  const endPointOptions = useMemo(() => {
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
    return filteredPoints
  }, [endPoints, endPointError, loadingEndpoints])

  const handleFormSubmission = async (formData: ConnectorConfigDTO) => {
    clear()
    if (props.isEditMode) {
      try {
        const res = await props.handleUpdate(formData)
        props.nextStep?.({ ...(res || {}), ...formData })
      } catch (error) {
        showError(error?.data?.message, 7000)
      }
    } else {
      try {
        const res = await props.handleCreate(formData)
        props.nextStep?.({ ...(res || {}), ...formData })
      } catch (error) {
        showError(error?.data?.message, 7000)
      }
    }
  }

  if (loadingSecrets) {
    return <PageSpinner />
  }

  return (
    <Container className={css.credentials}>
      <Text icon="service-newrelic" iconProps={{ size: 45 }} className={css.newRelicTitle}>
        {getString('cv.connectors.connectorDetailsHeader', NewRelicLabel)}
      </Text>
      <Text className={css.heading}>{getString('cv.connectors.addConnectorDetails', NewRelicLabel)}</Text>
      <Text className={css.subHeading}>{getString('cv.connectors.newRelic.subTitle', NewRelicLabel)}</Text>
      <Formik
        enableReinitialize
        initialValues={{
          ...initialValues,
          ...props.prevStepData
        }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('cv.connectors.newRelic.urlValidation')),
          newRelicAccountId: Yup.string().trim().required(getString('cv.connectors.newRelic.accountIdValidation')),
          apiKeyRef: Yup.string().trim().required(getString('cv.connectors.newRelic.encryptedKeyValidation'))
        })}
        onSubmit={formData => {
          handleFormSubmission(formData)
        }}
      >
        {() => (
          <FormikForm className={css.form}>
            <Layout.Vertical spacing="large" height={400}>
              <FormInput.Select
                key={loadingEndpoints?.toString()}
                items={endPointOptions}
                label={getString('cv.connectors.newRelic.urlFieldLabel')}
                name="url"
              />
              <FormInput.Text
                label={getString('cv.connectors.newRelic.accountIdFieldLabel')}
                name="newRelicAccountId"
              />
              <SecretInput label={getString('cv.connectors.newRelic.encryptedAPIKeyLabel')} name="apiKeyRef" />
            </Layout.Vertical>
            <Layout.Horizontal spacing="large">
              <Button onClick={() => props.previousStep?.({ ...props.prevStepData })} text={getString('back')} />
              <Button type="submit" text={getString('next')} intent="primary" />
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}

export default function CreateNewRelicConnector(props: CreateNewRelicConnectorProps): JSX.Element {
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: props.accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: props.accountId } })
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [successfullyCreated, setSuccessfullyCreated] = useState(false)
  const handleCreate = async (data: ConnectorConfigDTO): Promise<ConnectorInfoDTO | undefined> => {
    const res = await createConnector({
      connector: {
        name: data.name,
        identifier: data.identifier,
        type: 'NewRelic',
        projectIdentifier: props.projectIdentifier,
        orgIdentifier: props.orgIdentifier,
        spec: {
          newRelicAccountId: data.newRelicAccountId,
          apiKeyRef: data.apiKeyRef.referenceString,
          url: data.url
        }
      }
    })
    if (res && res.status === 'SUCCESS') {
      showSuccess(getString('connectors.successfullCreate', { name: data?.name || '' }))
      if (res.data) {
        setSuccessfullyCreated(true)
        props.onSuccess?.(res.data)
      }
    } else {
      throw new Error(getString('cv.connectors.unableToCreateConnector'))
    }
    return res.data?.connector
  }

  const handleUpdate = async (data: ConnectorConfigDTO): Promise<ConnectorInfoDTO | undefined> => {
    const res = await updateConnector({
      connector: {
        name: data.name,
        identifier: data.identifier,
        type: 'NewRelic',
        projectIdentifier: props.projectIdentifier,
        orgIdentifier: props.orgIdentifier,
        spec: {
          newRelicAccountId: data.newRelicAccountId,
          apiKeyRef: data.apiKeyRef.referenceString,
          url: data.url
        }
      }
    })
    if (res && res.status === 'SUCCESS') {
      showSuccess(getString('connectors.successfullUpdate', { name: data?.name || '' }))
      if (res.data) {
        props.onSuccess?.(res.data)
      }
    } else {
      throw new Error(getString('cv.connectors.unableToUpdateConnector'))
    }
    return res.data?.connector
  }

  const isEditMode = props.isEditMode || successfullyCreated

  return (
    <>
      <StepWizard>
        <ConnectorDetailsStep
          type="NewRelic"
          name={getString('connectors.newRelicConnectorDetails')}
          isEditMode={isEditMode}
          connectorInfo={props.connectorInfo}
          mock={props.mockIdentifierValidate}
        />
        <ConnectionConfigStep
          accountId={props.accountId}
          orgIdentifier={props.orgIdentifier}
          projectIdentifier={props.projectIdentifier}
          name={getString('credentials')}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
          isEditMode={isEditMode}
          connectorInfo={props.connectorInfo}
        />
        <VerifyOutOfClusterDelegate
          name={`${getString('verify')} ${getString('connection')}`}
          onClose={props.onClose}
          isStep
          isLastStep
          type="New Relic"
          setIsEditMode={props.setIsEditMode}
        />
      </StepWizard>
    </>
  )
}
