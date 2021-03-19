import React from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  Color,
  FormInput,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  FormikForm as Form
} from '@wings-software/uicore'
import * as Yup from 'yup'
import {
  useCreateConnector,
  useUpdateConnector,
  ConnectorConfigDTO,
  ConnectorRequestBody,
  ConnectorInfoDTO
} from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/exports'
import SecretInput from '@secrets/components/SecretInput/SecretInput'

import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { PageSpinner } from '@common/components/Page/PageSpinner'

import {
  buildJiraPayload,
  SecretReferenceInterface,
  setupJiraFormData
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { StepProps } from '@common/components/WizardWithProgress/WizardWithProgress'

import css from './JiraConnector.module.scss'

interface JiraFormData {
  jiraUrl: string
  username: TextReferenceInterface | void
  password: SecretReferenceInterface | void
}

interface AuthenticationProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface JiraFormProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

const defaultInitialFormData: JiraFormData = {
  jiraUrl: '',
  username: undefined,
  password: undefined
}

const JiraDetailsForm: React.FC<StepProps<JiraFormProps> & AuthenticationProps> = props => {
  const { prevStepData, nextStep, accountId, projectIdentifier, orgIdentifier } = props
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding | undefined>()
  const [initialValues, setInitialValues] = React.useState(defaultInitialFormData)
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })
  const { showSuccess } = useToaster()
  const [loadConnector, setLoadConnector] = React.useState(false)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = React.useState(true && props.isEditMode)

  const { getString } = useStrings()

  const handleCreate = async (data: ConnectorRequestBody, stepData: ConnectorConfigDTO): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      const response = await createConnector(data)
      showSuccess(getString('connectors.successfullCreate', { name: data.connector?.name }))
      setLoadConnector(false)
      nextStep?.({ ...prevStepData, ...stepData } as JiraFormProps)
      props?.onConnectorCreated?.(response.data)
      props.setIsEditMode(true)
    } catch (e) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  const handleUpdate = async (data: ConnectorRequestBody, stepData: ConnectorConfigDTO): Promise<void> => {
    try {
      modalErrorHandler?.hide()
      setLoadConnector(true)
      const response = await updateConnector(data)
      showSuccess(getString('connectors.successfullUpdate', { name: data.connector?.name }))
      setLoadConnector(false)
      nextStep?.({ ...prevStepData, ...stepData } as JiraFormProps)
      props?.onConnectorCreated?.(response.data)
    } catch (error) {
      setLoadConnector(false)
      modalErrorHandler?.showDanger(error.data?.message || error.message)
    }
  }

  React.useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupJiraFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as JiraFormData)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical height={'inherit'} margin="small">
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {getString('details')}
      </Text>
      <Formik
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        validationSchema={Yup.object().shape({
          jiraUrl: Yup.string().trim().required(getString('validation.jiraUrl')),
          username: Yup.string().required(getString('validation.username')),
          passwordRef: Yup.object().required(getString('validation.password'))
        })}
        onSubmit={stepData => {
          const connectorData = {
            ...prevStepData,
            ...stepData,
            projectIdentifier: projectIdentifier,
            orgIdentifier: orgIdentifier
          }
          const data = buildJiraPayload(connectorData)

          if (props.isEditMode) {
            handleUpdate(data, stepData)
          } else {
            handleCreate(data, stepData)
          }
        }}
      >
        {() => (
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />
            <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.secondStep} width={'56%'}>
              <FormInput.MultiTextInput name="jiraUrl" label={getString('UrlLabel')} />

              <TextReference name="username" label={getString('username')} type={ValueType.TEXT} />
              <SecretInput name={'passwordRef'} label={getString('password')} />
            </Layout.Vertical>

            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="jiraBackButton"
              />
              <Button
                type="submit"
                intent="primary"
                text={getString('saveAndContinue')}
                rightIcon="chevron-right"
                disabled={loadConnector}
              />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default JiraDetailsForm
