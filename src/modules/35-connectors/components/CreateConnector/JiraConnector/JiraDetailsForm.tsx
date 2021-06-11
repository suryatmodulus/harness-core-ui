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
  FormikForm as Form,
  StepProps
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import SecretInput from '@secrets/components/SecretInput/SecretInput'

import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { PageSpinner } from '@common/components/Page/PageSpinner'

import { SecretReferenceInterface, setupJiraFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'

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
  const { prevStepData, nextStep, accountId } = props
  const [, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding | undefined>()
  const [initialValues, setInitialValues] = React.useState(defaultInitialFormData)
  const [loadConnector] = React.useState(false)

  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = React.useState(true && props.isEditMode)

  const { getString } = useStrings()

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
        formName="jiraDetailsForm"
        validationSchema={Yup.object().shape({
          jiraUrl: Yup.string().trim().required(getString('validation.jiraUrl')),
          username: Yup.string().required(getString('validation.username')),
          passwordRef: Yup.object().required(getString('validation.password'))
        })}
        onSubmit={stepData => {
          nextStep?.({ ...props.connectorInfo, ...prevStepData, ...stepData } as JiraFormProps)
        }}
      >
        {() => (
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />
            <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.secondStep} width={'56%'}>
              <FormInput.Text name="jiraUrl" placeholder={getString('UrlLabel')} label={getString('UrlLabel')} />

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
                text={getString('continue')}
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
