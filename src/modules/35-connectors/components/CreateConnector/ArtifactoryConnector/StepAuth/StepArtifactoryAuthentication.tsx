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
import { SecretReferenceInterface, setupArtifactoryFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorConfigDTO, ConnectorRequestBody, ConnectorInfoDTO } from 'services/cd-ng'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { ValueType, TextReferenceInterface } from '@secrets/components/TextReference/TextReference'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import commonStyles from '@connectors/components/CreateConnector/commonSteps/ConnectorCommonStyles.module.scss'
import css from '../../NexusConnector/StepAuth/StepNexusConnector.module.scss'

interface StepArtifactoryAuthenticationProps extends ConnectorInfoDTO {
  name: string
  isEditMode?: boolean
}

interface ArtifactoryAuthenticationProps {
  onConnectorCreated?: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  setFormData?: (formData: ConnectorConfigDTO) => void
  connectorInfo: ConnectorInfoDTO | void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

interface ArtifactoryFormInterface {
  artifactoryServerUrl: string
  authType: string
  username: TextReferenceInterface | void
  password: SecretReferenceInterface | void
}

const defaultInitialFormData: ArtifactoryFormInterface = {
  artifactoryServerUrl: '',
  authType: AuthTypes.USER_PASSWORD,
  username: undefined,
  password: undefined
}

const StepArtifactoryAuthentication: React.FC<
  StepProps<StepArtifactoryAuthenticationProps> & ArtifactoryAuthenticationProps
> = props => {
  const { prevStepData, nextStep, accountId } = props
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && props.isEditMode)
  const { getString } = useStrings()

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

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (props.isEditMode) {
        if (props.connectorInfo) {
          setupArtifactoryFormData(props.connectorInfo, accountId).then(data => {
            setInitialValues(data as ArtifactoryFormInterface)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  const handleSubmit = (formData: ConnectorConfigDTO) => {
    nextStep?.({ ...props.connectorInfo, ...prevStepData, ...formData } as StepArtifactoryAuthenticationProps)
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
        formName="stepArtifactoryAuthForm"
        validationSchema={Yup.object().shape({
          artifactoryServerUrl: Yup.string().trim().required(getString('validation.artifactoryServerURL')),
          username: Yup.string()
            .nullable()
            .when('authType', {
              is: authType => authType === AuthTypes.USER_PASSWORD,
              then: Yup.string().required(getString('validation.username'))
            }),
          password: Yup.object().when('authType', {
            is: authType => authType === AuthTypes.USER_PASSWORD,
            then: Yup.object().required(getString('validation.password')),
            otherwise: Yup.object().nullable()
          })
        })}
        onSubmit={handleSubmit}
      >
        {formikProps => (
          <Form>
            <Layout.Vertical padding={{ top: 'large', bottom: 'large' }} className={css.secondStep}>
              <Container className={css.formRow}>
                <FormInput.Text
                  className={css.urlInput}
                  name="artifactoryServerUrl"
                  placeholder={getString('UrlLabel')}
                  label={getString('connectors.artifactory.artifactoryServerUrl')}
                />
              </Container>

              <Container className={css.authHeaderRow}>
                <Text className={css.authTitle} inline>
                  {getString('authentication')}
                </Text>
                <FormInput.Select
                  name="authType"
                  items={authOptions}
                  disabled={false}
                  className={commonStyles.authTypeSelectLarge}
                />
              </Container>
              {formikProps.values.authType === AuthTypes.USER_PASSWORD ? (
                <Container className={css.formWrapper}>
                  <TextReference
                    name="username"
                    label={getString('username')}
                    type={formikProps.values.username ? formikProps.values.username?.type : ValueType.TEXT}
                  />
                  <SecretInput name={'password'} label={getString('password')} />
                </Container>
              ) : null}
            </Layout.Vertical>
            <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
              <Button
                text={getString('back')}
                icon="chevron-left"
                onClick={() => props?.previousStep?.(props?.prevStepData)}
                data-name="artifactoryBackButton"
              />
              <Button type="submit" intent="primary" text={getString('continue')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepArtifactoryAuthentication
