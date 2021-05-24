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
import type { IOptionProps } from '@blueprintjs/core'
import {
  SecretReferenceInterface,
  setupDockerFormData,
  DockerProviderType
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'

import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { TextReferenceInterface, ValueType } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import css from '../CreateDockerConnector.module.scss'

interface StepDockerAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface DockerAuthenticationProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo?: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface DockerFormInterface {
  dockerRegistryUrl: string
  authType: string
  dockerProviderType: string
  username: TextReferenceInterface | void
  password: SecretReferenceInterface | void
}

const defaultInitialFormData: DockerFormInterface = {
  dockerRegistryUrl: '',
  authType: AuthTypes.USER_PASSWORD,
  dockerProviderType: DockerProviderType.DOCKERHUB,
  username: undefined,
  password: undefined
}

const StepDockerAuthentication: React.FC<
  StepProps<StepDockerAuthenticationProps> & DockerAuthenticationProps
> = props => {
  const { getString } = useStrings()
  const { prevStepData, nextStep, accountId } = props
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)

  const authOptions: SelectOption[] = [
    {
      label: getString('usernamePassword'),
      value: AuthTypes.USER_PASSWORD
    },
    {
      label: getString('anonymous'),
      value: AuthTypes.ANNONYMOUS
    }
  ]

  const dockerProviderTypeOptions: IOptionProps[] = [
    {
      label: getString('connectors.docker.dockerHub'),
      value: DockerProviderType.DOCKERHUB
    },
    {
      label: getString('connectors.docker.harbour'),
      value: DockerProviderType.HARBOUR
    },
    {
      label: getString('connectors.docker.quay'),
      value: DockerProviderType.QUAY
    },
    {
      label: getString('connectors.docker.other'),
      value: DockerProviderType.OTHER
    }
  ]

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupDockerFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as DockerFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepDockerAuthenticationProps)
  }

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
          dockerRegistryUrl: Yup.string().trim().required(getString('validation.dockerRegistryUrl')),
          authType: Yup.string().trim().required(getString('validation.authType')),
          username: Yup.string().when('authType', {
            is: val => val === AuthTypes.USER_PASSWORD,
            then: Yup.string().trim().required(getString('validation.username')),
            otherwise: Yup.string().nullable()
          }),
          password: Yup.object().when('authType', {
            is: val => val === AuthTypes.USER_PASSWORD,
            then: Yup.object().required(getString('validation.password')),
            otherwise: Yup.object().nullable()
          })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <Form>
            <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.secondStep} width={'59%'}>
              <FormInput.Text
                name="dockerRegistryUrl"
                placeholder={getString('UrlLabel')}
                label={getString('connectors.docker.dockerRegistryURL')}
              />
              <Text>{getString('connectors.docker.dockerProvideType')}</Text>
              <FormInput.RadioGroup
                className={css.dockerProviderType}
                inline
                name="dockerProviderType"
                radioGroup={{ inline: true }}
                items={dockerProviderTypeOptions}
                disabled={false}
              ></FormInput.RadioGroup>
              <Container className={css.authHeaderRow}>
                <Text className={css.authTitle} inline>
                  {getString('authentication')}
                </Text>
                <FormInput.Select name="authType" items={authOptions} disabled={false} className={css.authTypeSelect} />
              </Container>
              {formikProps.values.authType === AuthTypes.USER_PASSWORD ? (
                <>
                  <TextReference
                    name="username"
                    label={getString('username')}
                    type={formikProps.values.username ? formikProps.values.username?.type : ValueType.TEXT}
                  />
                  <SecretInput name={'password'} label={getString('password')} />
                </>
              ) : null}
            </Layout.Vertical>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="dockerBackButton"
              />
              <Button type="submit" intent="primary" text={getString('saveAndContinue')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepDockerAuthentication
