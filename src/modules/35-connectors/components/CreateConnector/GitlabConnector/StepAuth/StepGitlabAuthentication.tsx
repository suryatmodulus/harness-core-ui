/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import {
  Layout,
  Button,
  Formik,
  FormInput,
  Text,
  FormikForm as Form,
  StepProps,
  Container,
  SelectOption,
  FontVariation,
  ButtonVariation,
  PageSpinner
} from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { setupGithubFormData, GitConnectionType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'
import SSHSecretInput from '@secrets/components/SSHSecretInput/SSHSecretInput'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { GitAuthTypes, GitAPIAuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import css from './StepGitlabAuthentication.module.scss'
import commonCss from '../../commonSteps/ConnectorCommonStyles.module.scss'

interface StepGitlabAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface GitlabAuthenticationProps {
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface GitlabFormInterface {
  connectionType: string
  authType: string
  username: TextReferenceInterface | void
  password: SecretReferenceInterface | void
  accessToken: SecretReferenceInterface | void
  installationId: string
  applicationId: string
  privateKey: SecretReferenceInterface | void
  sshKey: SecretReferenceInterface | void
  kerberosKey: SecretReferenceInterface | void
  apiAccessToken: SecretReferenceInterface | void
  enableAPIAccess: boolean
  apiAuthType: string
}

const defaultInitialFormData: GitlabFormInterface = {
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
  kerberosKey: undefined,
  enableAPIAccess: false,
  apiAuthType: GitAPIAuthTypes.TOKEN
}

const RenderGitlabAuthForm: React.FC<FormikProps<GitlabFormInterface>> = props => {
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
    case GitAuthTypes.KERBEROS:
      return (
        <>
          <SSHSecretInput name="kerberosKey" label={getString('kerberos')} />
        </>
      )
    default:
      return null
  }
}

const RenderAPIAccessForm: React.FC<FormikProps<GitlabFormInterface>> = props => {
  const { getString } = useStrings()
  switch (props.values.apiAuthType) {
    case GitAPIAuthTypes.TOKEN:
      return <SecretInput name="apiAccessToken" label={getString('personalAccessToken')} />
    default:
      return null
  }
}

const RenderAPIAccessFormWrapper: React.FC<FormikProps<GitlabFormInterface>> = formikProps => {
  const { getString } = useStrings()

  const apiAuthOptions: Array<SelectOption> = [
    {
      label: getString('personalAccessToken'),
      value: GitAPIAuthTypes.TOKEN
    }
  ]

  return (
    <>
      <Container className={css.authHeaderRow}>
        <Text font={{ variation: FontVariation.H6 }}>{getString('common.git.APIAuthentication')}</Text>
        <FormInput.Select name="apiAuthType" items={apiAuthOptions} className={commonStyles.authTypeSelect} />
      </Container>
      <RenderAPIAccessForm {...formikProps} />
    </>
  )
}

const StepGitlabAuthentication: React.FC<StepProps<StepGitlabAuthenticationProps> & GitlabAuthenticationProps> =
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
      // Disabling temp:
      // {
      //   label: getString('kerberos'),
      //   value: GitAuthTypes.KERBEROS
      // }
    ]

    useEffect(() => {
      if (loadingConnectorSecrets) {
        if (props.isEditMode) {
          if (props.connectorInfo) {
            setupGithubFormData(props.connectorInfo, accountId).then(data => {
              setInitialValues(data as GitlabFormInterface)
              setLoadingConnectorSecrets(false)
            })
          } else {
            setLoadingConnectorSecrets(false)
          }
        }
      }
    }, [loadingConnectorSecrets])

    const handleSubmit = (formData: ConnectorConfigDTO) => {
      nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepGitlabAuthenticationProps)
    }

    return loadingConnectorSecrets ? (
      <PageSpinner />
    ) : (
      <Layout.Vertical width="60%" style={{ minHeight: 460 }} className={cx(css.secondStep, commonCss.stepContainer)}>
        <Text font={{ variation: FontVariation.H3 }}>{getString('credentials')}</Text>

        <Formik
          initialValues={{
            ...initialValues,
            ...prevStepData
          }}
          formName="stepGitlabAuth"
          validationSchema={Yup.object().shape({
            username: Yup.string().when(['connectionType', 'authType'], {
              is: (connectionType, authType) =>
                connectionType === GitConnectionType.HTTP && authType !== GitAuthTypes.KERBEROS,
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
            kerberosKey: Yup.object().when('authType', {
              is: val => val === GitAuthTypes.KERBEROS,
              then: Yup.object().required(getString('validation.kerberosKey')),
              otherwise: Yup.object().nullable()
            }),
            accessToken: Yup.object().when(['connectionType', 'authType'], {
              is: (connectionType, authType) =>
                connectionType === GitConnectionType.HTTP && authType === GitAuthTypes.USER_TOKEN,
              then: Yup.object().required(getString('validation.accessToken')),
              otherwise: Yup.object().nullable()
            }),
            apiAuthType: Yup.string().when('enableAPIAccess', {
              is: val => val,
              then: Yup.string().trim().required(getString('validation.authType'))
            }),
            apiAccessToken: Yup.object().when(['enableAPIAccess', 'apiAuthType'], {
              is: (enableAPIAccess, apiAuthType) => enableAPIAccess && apiAuthType === GitAPIAuthTypes.TOKEN,
              then: Yup.object().required(getString('validation.accessToken')),
              otherwise: Yup.object().nullable()
            })
          })}
          onSubmit={handleSubmit}
        >
          {formikProps => (
            <Form className={cx(commonCss.fullHeight, commonCss.fullHeightDivsWithFlex)}>
              <Container className={cx(css.stepFormWrapper, commonCss.paddingTop8)}>
                {formikProps.values.connectionType === GitConnectionType.SSH ? (
                  <Layout.Horizontal spacing="medium" flex={{ alignItems: 'baseline' }}>
                    <Text font={{ variation: FontVariation.H6 }}>{getString('authentication')}</Text>
                    <SSHSecretInput name="sshKey" label={getString('SSH_KEY')} />
                  </Layout.Horizontal>
                ) : (
                  <Container>
                    <Container className={css.authHeaderRow} flex={{ alignItems: 'baseline' }}>
                      <Text font={{ variation: FontVariation.H6 }}>{getString('authentication')}</Text>
                      <FormInput.Select
                        name="authType"
                        items={authOptions}
                        disabled={false}
                        className={commonStyles.authTypeSelect}
                      />
                    </Container>

                    <RenderGitlabAuthForm {...formikProps} />
                  </Container>
                )}

                <FormInput.CheckBox
                  name="enableAPIAccess"
                  label={getString('common.git.enableAPIAccess')}
                  padding={{ left: 'xxlarge' }}
                />
                <Text font="small" className={commonCss.bottomMargin4}>
                  {getString('common.git.APIAccessDescription')}
                </Text>
                {formikProps.values.enableAPIAccess ? <RenderAPIAccessFormWrapper {...formikProps} /> : null}
              </Container>

              <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => props?.previousStep?.(props?.prevStepData)}
                  data-name="gitlabBackButton"
                  variation={ButtonVariation.SECONDARY}
                />
                <Button
                  type="submit"
                  intent="primary"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  variation={ButtonVariation.PRIMARY}
                />
              </Layout.Horizontal>
            </Form>
          )}
        </Formik>
      </Layout.Vertical>
    )
  }

export default StepGitlabAuthentication
