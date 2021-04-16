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
  SelectOption,
  Icon,
  Color
} from '@wings-software/uicore'
import { Formik } from 'formik'
import * as Yup from 'yup'
import { PopoverInteractionKind, Tooltip } from '@blueprintjs/core'
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
import { buildNewRelicPayload, setSecretField } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER, CreateConnectorModalProps } from '@connectors/constants'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import css from './CreateNewRelicConnector.module.scss'

const NewRelicLabel = { type: 'New Relic' }

interface CreateNewRelicConnectorProps extends CreateConnectorModalProps {
  mockIdentifierValidate?: ResponseBoolean
}

interface ConnectionConfigProps extends StepProps<ConnectorConfigDTO> {
  accountId: string
  orgIdentifier?: string
  projectIdentifier?: string
  isEditMode: boolean
  connectorInfo?: ConnectorInfoDTO | void
}

function AccountIdTooltip(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Tooltip
      interactionKind={PopoverInteractionKind.HOVER}
      hoverCloseDelay={500}
      content={
        <>
          <Text style={{ display: 'inline-block', marginRight: 'var(--spacing-xsmall)' }} color={Color.GREY_350}>
            {getString('connectors.newRelic.accountIdTooltip')}
          </Text>
          <a
            target="_blank"
            rel="noreferrer"
            href={'https://docs.newrelic.com/docs/accounts/accounts-billing/account-setup/account-id/'}
            style={{ color: 'var(--primary-7)' }}
          >
            {getString('clickHere')}
          </a>
        </>
      }
    >
      <Icon name="info" size={12} />
    </Tooltip>
  )
}

function ConnectionConfigStep(props: ConnectionConfigProps): JSX.Element {
  const { nextStep, prevStepData, connectorInfo, isEditMode, accountId, projectIdentifier, orgIdentifier } = props
  const [loadingSecrets, setLoadingSecrets] = useState(
    Boolean(props.prevStepData?.spec || props.prevStepData?.newRelicAccountId)
  )
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { data: endPoints, error: endPointError, loading: loadingEndpoints } = useGetNewRelicEndPoints({})
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    url: undefined,
    newRelicAccountId: '',
    apiKeyRef: undefined,
    accountId,
    projectIdentifier,
    orgIdentifier
  })
  useEffect(() => {
    if (!props.prevStepData) {
      return
    }

    const { spec, ...prevData } = props.prevStepData
    const updatedInitialValues = {
      ...spec,
      ...prevData
    }

    if (prevData?.url) {
      updatedInitialValues.url = prevData.url
    } else if (spec?.url) {
      updatedInitialValues.url = { label: spec.url, value: spec.url }
    }

    if (prevData.apiKeyRef || spec?.apiKeyRef) {
      setSecretField(prevData.apiKeyRef?.referenceString || spec.apiKeyRef, {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier
      })
        .then(result => {
          updatedInitialValues.apiKeyRef = result
          setLoadingSecrets(false)
          setInitialValues(currInitialVals => ({ ...currInitialVals, ...updatedInitialValues }))
        })
        .catch(() => {
          setLoadingSecrets(false)
        })
    }

    setInitialValues(currInitialVals => ({ ...currInitialVals, ...updatedInitialValues }))
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

    // set default value
    if (!isEditMode && !initialValues.url) {
      setInitialValues({ ...initialValues, url: filteredPoints[0] })
    }
    return filteredPoints
  }, [endPoints, endPointError, loadingEndpoints])

  if (loadingSecrets) {
    return <PageSpinner />
  }

  return (
    <Container className={css.credentials}>
      <Text icon="service-newrelic" iconProps={{ size: 45 }} className={css.newRelicTitle}>
        {getString('connectors.connectorDetailsHeader', NewRelicLabel)}
      </Text>
      <Text className={css.heading}>{getString('connectors.addConnectorDetails', NewRelicLabel)}</Text>
      <Text className={css.subHeading}>{getString('connectors.newRelic.subTitle', NewRelicLabel)}</Text>
      <Formik
        enableReinitialize
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          url: Yup.string().trim().required(getString('connectors.newRelic.urlValidation')),
          newRelicAccountId: Yup.string().trim().required(getString('connectors.newRelic.accountIdValidation')),
          apiKeyRef: Yup.string().trim().required(getString('connectors.newRelic.encryptedKeyValidation'))
        })}
        onSubmit={(formData: ConnectorConfigDTO) => {
          nextStep?.({ ...connectorInfo, ...prevStepData, ...formData })
        }}
      >
        {formikProps => (
          <FormikForm className={css.form}>
            <Layout.Vertical spacing="large" height={400}>
              <FormInput.Select
                placeholder={loadingEndpoints ? getString('loading') : undefined}
                items={endPointOptions}
                value={(formikProps.values as any).url}
                onChange={updatedOption => formikProps.setFieldValue('url', updatedOption)}
                label={getString('connectors.newRelic.urlFieldLabel')}
                name="url"
              />
              <FormInput.Text
                label={
                  <Container className={css.identifierLabel}>
                    <Text inline>{getString('connectors.newRelic.accountIdFieldLabel')}</Text>
                    <AccountIdTooltip />
                  </Container>
                }
                name="newRelicAccountId"
              />
              <SecretInput label={getString('connectors.newRelic.encryptedAPIKeyLabel')} name="apiKeyRef" />
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
  const handleSubmit = async (
    payload: ConnectorConfigDTO,
    prevData: ConnectorConfigDTO,
    stepProps: StepProps<ConnectorConfigDTO>
  ): Promise<ConnectorInfoDTO | undefined> => {
    const { isEditMode } = props
    const res = await (isEditMode ? updateConnector : createConnector)(payload)
    if (res && res.status === 'SUCCESS') {
      showSuccess(
        isEditMode
          ? getString('connectors.successfullUpdate', { name: payload.name || '' })
          : getString('connectors.successfullCreate', { name: payload.name || '' })
      )
      if (res.data) {
        setSuccessfullyCreated(true)
        // props.onConnectorCreated?.(res.data)
        props.onSuccess?.(res.data)
        stepProps?.nextStep?.(prevData)
        props.setIsEditMode?.(true)
      }
    } else {
      throw new Error(
        isEditMode ? getString('connectors.unableToUpdateConnector') : getString('connectors.unableToCreateConnector')
      )
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
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          isEditMode={isEditMode}
          connectorInfo={props.connectorInfo}
        />
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          customHandleCreate={handleSubmit}
          customHandleUpdate={handleSubmit}
          hideModal={props.onClose}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
          isEditMode={props.isEditMode}
          buildPayload={buildNewRelicPayload}
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
