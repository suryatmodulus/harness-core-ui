import React, { useState, useEffect } from 'react'
import {
  Layout,
  Button,
  Formik,
  FormInput,
  Text,
  FormikForm as Form,
  StepProps,
  Color,
  Container,
  SelectOption
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  SecretReferenceInterface,
  setupBitbucketFormData,
  GitConnectionType
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'

import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { GitAuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import css from './StepBitbucketAuthentication.module.scss'

interface StepBitbucketAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface BitbucketAuthenticationProps {
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface BitbucketFormInterface {
  connectionType: string
  authType: string
  username: TextReferenceInterface | void
  password: SecretReferenceInterface | void
  sshKey: SecretReferenceInterface | void
  enableAPIAccess: boolean
  apiAuthType: string
  apiAccessUsername: TextReferenceInterface | void
  accessToken: SecretReferenceInterface | void
}

const defaultInitialFormData: BitbucketFormInterface = {
  connectionType: GitConnectionType.HTTP,
  authType: GitAuthTypes.USER_PASSWORD,
  username: undefined,
  password: undefined,
  sshKey: undefined,
  enableAPIAccess: false,
  apiAuthType: GitAuthTypes.USER_TOKEN,
  apiAccessUsername: undefined,
  accessToken: undefined
}

const RenderBitbucketAuthForm: React.FC<FormikProps<BitbucketFormInterface>> = props => {
  const { getString } = useStrings()
  return (
    <>
      <TextReference
        name="username"
        label={getString('username')}
        type={props.values.username ? props.values.username?.type : ValueType.TEXT}
      />
      <SecretInput name="password" label={getString('password')} />
    </>
  )
}

const RenderAPIAccessFormWrapper: React.FC<FormikProps<BitbucketFormInterface>> = props => {
  const { getString } = useStrings()

  const apiAuthOptions: Array<SelectOption> = [
    {
      label: getString('usernameToken'),
      value: GitAuthTypes.USER_TOKEN
    }
  ]

  return (
    <>
      <Text font="small" margin={{ bottom: 'small' }}>
        {getString('common.git.APIAccessDescriptipn')}
      </Text>
      <Container width={'52%'}>
        <Container className={css.authHeaderRow}>
          <Text className={css.authTitle} inline>
            {getString('common.git.APIAuthentication')}
          </Text>
          <FormInput.Select name="apiAuthType" items={apiAuthOptions} className={commonStyles.authTypeSelect} />
        </Container>
        <TextReference
          name="apiAccessUsername"
          label={getString('username')}
          type={props.values.apiAccessUsername ? props.values.apiAccessUsername?.type : ValueType.TEXT}
        />
        <SecretInput name="accessToken" label={getString('personalAccessToken')} />
      </Container>
    </>
  )
}

const StepBitbucketAuthentication: React.FC<
  StepProps<StepBitbucketAuthenticationProps> & BitbucketAuthenticationProps
> = props => {
  const { getString } = useStrings()
  const { prevStepData, nextStep, accountId } = props
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

  const authOptions: Array<SelectOption> = [
    {
      label: getString('usernamePassword'),
      value: GitAuthTypes.USER_PASSWORD
    }
  ]

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupBitbucketFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as BitbucketFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepBitbucketAuthenticationProps)
  }

  return loadingConnectorSecrets ? (
    <PageSpinner />
  ) : (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.secondStep}>
      <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
        {getString('credentials')}
      </Text>

      <Formik
        initialValues={{
          ...initialValues,
          ...prevStepData
        }}
        formName="bitbAuthForm"
        validationSchema={Yup.object().shape({
          username: Yup.string().when(['connectionType'], {
            is: connectionType => connectionType === GitConnectionType.HTTP,
            then: Yup.string().trim().required(getString('validation.username')),
            otherwise: Yup.string().nullable()
          }),
          authType: Yup.string().when('connectionType', {
            is: val => val === GitConnectionType.HTTP,
            then: Yup.string().trim().required(getString('validation.authType'))
          }),
          sshKey: Yup.object().when('connectionType', {
            is: val => val === GitConnectionType.SSH,
            then: Yup.object().required(getString('validation.sshKey')),
            otherwise: Yup.object().nullable()
          }),
          password: Yup.object().when(['connectionType', 'authType'], {
            is: (connectionType, authType) =>
              connectionType === GitConnectionType.HTTP && authType === GitAuthTypes.USER_PASSWORD,
            then: Yup.object().required(getString('validation.password')),
            otherwise: Yup.object().nullable()
          }),
          apiAuthType: Yup.string().when('enableAPIAccess', {
            is: val => val,
            then: Yup.string().trim().required(getString('validation.authType')),
            otherwise: Yup.string().nullable()
          }),
          apiAccessUsername: Yup.string().when(['enableAPIAccess', 'apiAuthType'], {
            is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAuthTypes.USER_TOKEN,
            then: Yup.string().trim().required(getString('validation.username')),
            otherwise: Yup.string().nullable()
          }),
          accessToken: Yup.object().when(['enableAPIAccess', 'apiAuthType'], {
            is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAuthTypes.USER_TOKEN,
            then: Yup.object().required(getString('validation.accessToken')),
            otherwise: Yup.object().nullable()
          })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <Form>
            <Container className={css.stepFormWrapper}>
              {formikProps.values.connectionType === GitConnectionType.SSH ? (
                <Container width={'52%'}>
                  <Text font={{ weight: 'bold' }} className={css.authTitle}>
                    {getString('authentication')}
                  </Text>
                  <SecretInput name="sshKey" type="SSHKey" label={getString('SSH_KEY')} />
                </Container>
              ) : (
                <Container width={'52%'}>
                  <Container className={css.authHeaderRow}>
                    <Text className={css.authTitle} inline>
                      {getString('authentication')}
                    </Text>
                    <FormInput.Select
                      name="authType"
                      items={authOptions}
                      disabled={false}
                      className={commonStyles.authTypeSelect}
                    />
                  </Container>

                  <RenderBitbucketAuthForm {...formikProps} />
                </Container>
              )}

              <FormInput.CheckBox
                name="enableAPIAccess"
                label={getString('common.git.enableAPIAccess')}
                padding={{ left: 'xxlarge' }}
              />
              {formikProps.values.enableAPIAccess ? <RenderAPIAccessFormWrapper {...formikProps} /> : null}
            </Container>

            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="bitbucketBackButton"
              />
              <Button type="submit" intent="primary" text={getString('continue')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepBitbucketAuthentication
