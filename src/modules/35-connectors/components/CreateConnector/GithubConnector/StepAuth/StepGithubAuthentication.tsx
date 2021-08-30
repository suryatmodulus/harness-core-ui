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
  SelectOption,
  HarnessDocTooltip
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import {
  setupGithubFormData,
  GitConnectionType,
  saveCurrentStepData
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'
import MultiTypeSecretInput from '@secrets/components/MutiTypeSecretInput/MultiTypeSecretInput'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { GitAuthTypes, GitAPIAuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import css from './StepGithubAuthentication.module.scss'

interface StepGithubAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface GithubAuthenticationProps {
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface GithubFormInterface {
  connectionType: string
  authType: string
  username: TextReferenceInterface | void
  password: SecretReferenceInterface | void
  accessToken: SecretReferenceInterface | void
  installationId: string
  applicationId: string
  privateKey: SecretReferenceInterface | void
  sshKey: SecretReferenceInterface | void
  apiAccessToken: SecretReferenceInterface | void
  enableAPIAccess: boolean
  apiAuthType: string
}

const defaultInitialFormData: GithubFormInterface = {
  connectionType: GitConnectionType.HTTP,
  authType: GitAuthTypes.USER_PASSWORD,
  username: undefined,
  password: undefined,
  accessToken: undefined,
  installationId: '',
  applicationId: '',
  privateKey: undefined,
  sshKey: undefined,
  apiAccessToken: undefined,
  enableAPIAccess: false,
  apiAuthType: GitAPIAuthTypes.TOKEN
}

const RenderGithubAuthForm: React.FC<FormikProps<GithubFormInterface>> = props => {
  const { getString } = useStrings()
  switch (props.values.authType) {
    case GitAuthTypes.USER_PASSWORD:
      return (
        <>
          <TextReference
            name="username"
            stringId="username"
            type={props.values.username ? props.values.username?.type : ValueType.TEXT}
          />
          <SecretInput name="password" label={getString('password')} />
        </>
      )
    case GitAuthTypes.USER_TOKEN:
      return (
        <>
          <TextReference
            name="username"
            stringId="username"
            type={props.values.username ? props.values.username?.type : ValueType.TEXT}
          />
          <SecretInput name="accessToken" label={getString('personalAccessToken')} />
        </>
      )
    default:
      return null
  }
}

const RenderAPIAccessForm: React.FC<FormikProps<GithubFormInterface>> = props => {
  const { getString } = useStrings()
  switch (props.values.apiAuthType) {
    case GitAPIAuthTypes.GITHUB_APP:
      return (
        <Container>
          <Container className={css.formRow}>
            <FormInput.Text name="installationId" label={getString('common.git.installationId')} />
            <FormInput.Text name="applicationId" label={getString('common.git.applicationId')} />
          </Container>
          <Container width={'42.5%'}>
            <MultiTypeSecretInput name="privateKey" label={getString('common.git.privateKey')} />
          </Container>
        </Container>
      )
    case GitAPIAuthTypes.TOKEN:
      return (
        <Container width={'52%'} data-tooltip-id="gitHubPersonalAccessTooltip">
          <HarnessDocTooltip tooltipId="gitHubPersonalAccessTooltip" useStandAlone={true} />
          <SecretInput name="apiAccessToken" label={getString('personalAccessToken')} />
        </Container>
      )
    default:
      return null
  }
}

const RenderAPIAccessFormWrapper: React.FC<FormikProps<GithubFormInterface>> = formikProps => {
  const { getString } = useStrings()

  const apiAuthOptions: Array<SelectOption> = [
    {
      label: getString('personalAccessToken'),
      value: GitAPIAuthTypes.TOKEN
    },
    {
      label: getString('common.git.gitHubApp'),
      value: GitAPIAuthTypes.GITHUB_APP
    }
  ]

  return (
    <>
      <Container className={css.authHeaderRow} width={'52%'}>
        <Text className={css.authTitle} inline tooltipProps={{ dataTooltipId: 'githubApiAuthentication' }}>
          {getString('common.git.APIAuthentication')}
        </Text>
        <FormInput.Select name="apiAuthType" items={apiAuthOptions} className={commonStyles.authTypeSelect} />
      </Container>
      <RenderAPIAccessForm {...formikProps} />{' '}
    </>
  )
}

const StepGithubAuthentication: React.FC<StepProps<StepGithubAuthenticationProps> & GithubAuthenticationProps> =
  props => {
    const { getString } = useStrings()
    const { prevStepData, nextStep, accountId } = props
    const [initialValues, setInitialValues] = useState(defaultInitialFormData)
    const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

    const authOptions: Array<SelectOption> = [
      {
        label: getString('usernamePassword'),
        value: GitAuthTypes.USER_PASSWORD
      },
      {
        label: getString('usernameToken'),
        value: GitAuthTypes.USER_TOKEN
      }
    ]

    useEffect(() => {
      if (loadingConnectorSecrets) {
        if (props.isEditMode) {
          if (props.connectorInfo) {
            setupGithubFormData(props.connectorInfo, accountId).then(data => {
              setInitialValues(data as GithubFormInterface)
              setLoadingConnectorSecrets(false)
            })
          } else {
            setLoadingConnectorSecrets(false)
          }
        }
      }
    }, [loadingConnectorSecrets])

    const handleSubmit = (formData: ConnectorConfigDTO) => {
      nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepGithubAuthenticationProps)
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
          formName="stepGithubAuthForm"
          validationSchema={Yup.object().shape({
            username: Yup.string()
              .nullable()
              .when('connectionType', {
                is: val => val === GitConnectionType.HTTP,
                then: Yup.string().trim().required(getString('validation.username'))
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
            accessToken: Yup.object().when(['connectionType', 'authType'], {
              is: (connectionType, authType) =>
                connectionType === GitConnectionType.HTTP && authType === GitAuthTypes.USER_TOKEN,

              then: Yup.object().required(getString('validation.accessToken')),
              otherwise: Yup.object().nullable()
            }),
            apiAccessToken: Yup.object().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.TOKEN,
              then: Yup.object().required(getString('validation.accessToken')),
              otherwise: Yup.object().nullable()
            }),
            privateKey: Yup.string().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.GITHUB_APP,
              then: Yup.string().required(getString('validation.privateKey')),
              otherwise: Yup.string().nullable()
            }),
            apiAuthType: Yup.string().when('enableAPIAccess', {
              is: val => val,
              then: Yup.string().trim().required(getString('validation.authType'))
            }),
            installationId: Yup.string().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.GITHUB_APP,
              then: Yup.string().trim().required(getString('validation.installationId'))
            }),
            applicationId: Yup.string().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.GITHUB_APP,
              then: Yup.string().trim().required(getString('validation.applicationId'))
            })
          })}
          onSubmit={handleSubmit}
        >
          {formikProps => {
            saveCurrentStepData<ConnectorInfoDTO>(
              props.getCurrentStepData,
              formikProps.values as unknown as ConnectorInfoDTO
            )
            return (
              <Form>
                <Container className={css.stepFormWrapper}>
                  {formikProps.values.connectionType === GitConnectionType.SSH ? (
                    <Container width={'52%'}>
                      <Text
                        tooltipProps={{ dataTooltipId: 'githubAuthentication' }}
                        font={{ weight: 'bold' }}
                        className={css.authTitle}
                      >
                        {getString('authentication')}
                      </Text>
                      <SecretInput name="sshKey" type="SSHKey" label={getString('SSH_KEY')} />
                    </Container>
                  ) : (
                    <Container width={'52%'}>
                      <Container className={css.authHeaderRow}>
                        <Text className={css.authTitle} inline tooltipProps={{ dataTooltipId: 'githubAuthentication' }}>
                          {getString('authentication')}
                        </Text>
                        <FormInput.Select
                          name="authType"
                          items={authOptions}
                          disabled={false}
                          className={commonStyles.authTypeSelect}
                        />
                      </Container>

                      <RenderGithubAuthForm {...formikProps} />
                    </Container>
                  )}

                  <FormInput.CheckBox
                    name="enableAPIAccess"
                    label={getString('common.git.enableAPIAccess')}
                    padding={{ left: 'xxlarge' }}
                  />
                  <Text font="small" margin={{ bottom: 'small' }}>
                    {getString('common.git.APIAccessDescription')}
                  </Text>
                  {formikProps.values.enableAPIAccess ? <RenderAPIAccessFormWrapper {...formikProps} /> : null}
                </Container>

                <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                  <Button
                    text={getString('back')}
                    icon="chevron-left"
                    onClick={() => props?.previousStep?.(props?.prevStepData)}
                    data-name="githubBackButton"
                  />
                  <Button type="submit" intent="primary" text={getString('continue')} rightIcon="chevron-right" />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    )
  }

export default StepGithubAuthentication
