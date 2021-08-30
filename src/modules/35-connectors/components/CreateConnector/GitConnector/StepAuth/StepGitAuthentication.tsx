import React, { useState, useEffect } from 'react'
import { Layout, Button, Formik, Text, FormikForm as Form, StepProps, Color, Container } from '@wings-software/uicore'
import * as Yup from 'yup'
import type { FormikProps } from 'formik'
import { setupGitFormData, GitConnectionType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { SecretReferenceInterface } from '@secrets/utils/SecretField'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'

import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import css from './StepGitAuthentication.module.scss'

interface StepGitAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface GitAuthenticationProps {
  onConnectorCreated: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface GitFormInterface {
  connectionType: string
  username: TextReferenceInterface | void
  password: SecretReferenceInterface | void
  sshKey: SecretReferenceInterface | void
}

const defaultInitialFormData: GitFormInterface = {
  connectionType: GitConnectionType.HTTP,
  username: undefined,
  password: undefined,
  sshKey: undefined
}

const RenderGitAuthForm: React.FC<FormikProps<GitFormInterface>> = props => {
  const { getString } = useStrings()
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
}

const StepGitAuthentication: React.FC<StepProps<StepGitAuthenticationProps> & GitAuthenticationProps> = props => {
  const { getString } = useStrings()
  const { prevStepData, nextStep, accountId } = props
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupGitFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as GitFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepGitAuthenticationProps)
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
        formName="stepGitAuthForm"
        validationSchema={Yup.object().shape({
          username: Yup.string().when('connectionType', {
            is: val => val === GitConnectionType.HTTP,
            then: Yup.string().trim().required(getString('validation.username'))
          }),
          sshKey: Yup.object().when('connectionType', {
            is: val => val === GitConnectionType.SSH,
            then: Yup.object().required(getString('validation.sshKey')),
            otherwise: Yup.object().nullable()
          }),
          password: Yup.object().when('connectionType', {
            is: val => val === GitConnectionType.HTTP,
            then: Yup.object().required(getString('validation.password')),
            otherwise: Yup.object().nullable()
          })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <Form>
            <Container className={css.stepFormWrapper} width={'52%'}>
              {formikProps.values.connectionType === GitConnectionType.SSH ? (
                <SecretInput name="sshKey" type="SSHKey" label={getString('SSH_KEY')} />
              ) : (
                <RenderGitAuthForm {...formikProps} />
              )}
            </Container>

            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="gitBackButton"
              />
              <Button type="submit" intent="primary" text={getString('continue')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepGitAuthentication
