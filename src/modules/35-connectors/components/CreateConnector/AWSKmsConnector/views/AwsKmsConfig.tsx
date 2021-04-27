import React, { useEffect, useState } from 'react'
import * as Yup from 'yup'
import {
  StepProps,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Container,
  Text,
  SelectOption,
  FormInput,
  Formik,
  FormikForm,
  Layout,
  Button
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'

import { useToaster } from '@common/exports'
import { ConnectorRequestBody, useCreateConnector, useUpdateConnector } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { setupAwsKmsFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { AwsKmsConfigFormData, CredTypeValues } from '@connectors/interfaces/ConnectorInterface'
import { DelegateSelectors } from '@common/components'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

import AwsKmsAccessKeyForm from './AwsKmsAccessKeyForm'
import type { CreateAwsKmsConnectorProps, StepSecretManagerProps } from '../CreateAwsKmsConnector'

const AwsKmsConfig: React.FC<StepProps<StepSecretManagerProps> & CreateAwsKmsConnectorProps> = ({
  prevStepData,
  previousStep,
  nextStep,
  isEditMode,
  onSuccess,
  connectorInfo
}) => {
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const credTypeOptions: SelectOption[] = [
    {
      label: getString('connectors.aws.awsAccessKey'),
      value: CredTypeValues.ManualConfig
    },
    {
      label: getString('connectors.aws.assumeIAMRole'),
      value: CredTypeValues.AssumeIAMRole
    },
    {
      label: getString('connectors.awsKms.awsSTS'),
      value: CredTypeValues.AssuemRoleSTS
    }
  ]
  const defaultInitialFormData: AwsKmsConfigFormData = {
    accessKey: undefined,
    secretKey: undefined,
    awsArn: undefined,
    region: undefined,
    credType: credTypeOptions[0].value as string,
    delegate: undefined,
    roleArn: undefined,
    externalName: undefined,
    assumeStsRoleDuration: undefined
  }
  const [initialValues, setInitialValues] = useState(defaultInitialFormData)
  const [loadingConnectorSecrets, setLoadingConnectorSecrets] = useState(true && isEditMode)

  const { mutate: CreateAwsKMSConnector, loading: createLoading } = useCreateConnector({
    queryParams: { accountIdentifier }
  })
  const { mutate: updateSecretManager, loading: updateLoading } = useUpdateConnector({
    queryParams: { accountIdentifier }
  })

  const handleSubmit = async (formData: AwsKmsConfigFormData): Promise<void> => {
    if (prevStepData) {
      const credTypeValue = formData?.credType as string
      let cred = {}
      if (credTypeValue === CredTypeValues.ManualConfig) {
        cred = {
          type: credTypeValue,
          spec: {
            accessKey: formData?.accessKey,
            secretKey: formData?.secretKey
          }
        }
      } else if (credTypeValue === CredTypeValues.AssumeIAMRole) {
        cred = {
          type: credTypeValue,
          spec: {
            delegateSelectors: formData.delegate
          }
        }
      } else if (credTypeValue === CredTypeValues.AssuemRoleSTS) {
        cred = {
          type: credTypeValue,
          spec: {
            delegateSelectors: formData.delegate,
            roleArn: formData.roleArn,
            externalName: formData.externalName || undefined,
            assumeStsRoleDuration: formData.assumeStsRoleDuration || undefined
          }
        }
      }

      const dataToSubmit: ConnectorRequestBody = {
        connector: {
          orgIdentifier,
          projectIdentifier,
          ...pick(prevStepData, ['name', 'identifier', 'description', 'tags']),
          type: 'AwsKms',
          spec: {
            credential: cred,
            kmsArn: formData?.awsArn,
            region: formData?.region as SelectOption,
            default: false
          }
        }
      }

      try {
        if (!isEditMode && prevStepData.isEdit != true) {
          const response = await CreateAwsKMSConnector(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: true })
          onSuccess(response.data)
          showSuccess(getString('secretManager.createmessageSuccess'))
        } else {
          const response = await updateSecretManager(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: true })
          onSuccess(response.data)
          showSuccess(getString('secretManager.editmessageSuccess'))
        }
      } catch (err) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(err?.data?.message)
      }
    }
  }

  useEffect(() => {
    if (loadingConnectorSecrets) {
      if (isEditMode) {
        if (connectorInfo) {
          setupAwsKmsFormData(connectorInfo).then(data => {
            setInitialValues(data as AwsKmsConfigFormData)
            setLoadingConnectorSecrets(false)
          })
        } else {
          setLoadingConnectorSecrets(false)
        }
      }
    }
  }, [loadingConnectorSecrets])

  return (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ size: 'medium' }} padding={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>
      <ModalErrorHandler bind={setModalErrorHandler} />

      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          accessKey: Yup.string().when(['credType'], {
            is: credentials => credentials === credTypeOptions[0].value,
            then: Yup.string().trim().required(getString('connectors.aws.validation.accessKey'))
          }),
          secretKey: Yup.string().when(['credType'], {
            is: credentials => credentials === credTypeOptions[0].value,
            then: Yup.string().trim().required(getString('connectors.aws.validation.secretKeyRef'))
          }),
          awsArn: Yup.string().trim().required(getString('connectors.awsKms.validation.selectAWSArn')),
          region: Yup.string().trim().required(getString('connectors.awsKms.validation.selectRegion')),
          delegate: Yup.string().when(['credType'], {
            is: credentials => credentials === credTypeOptions[1].value || credentials === credTypeOptions[2].value,
            then: Yup.string().trim().required(getString('connectors.awsKms.validation.selectDelegate'))
          }),
          roleArn: Yup.string().when(['credType'], {
            is: credentials => credentials === credTypeOptions[2].value,
            then: Yup.string().trim().required(getString('connectors.aws.validation.crossAccountRoleArn'))
          }),
          assumeStsRoleDuration: Yup.number().when(['credType'], {
            is: credentials => credentials === credTypeOptions[2].value,
            then: Yup.number()
              .min(0, getString('connectors.awsKms.validation.durationNumber'))
              .typeError(getString('connectors.awsKms.validation.durationError'))
          })
        })}
        onSubmit={formData => {
          handleSubmit(formData)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Container style={{ minHeight: 420 }} margin={{ top: 'medium', bottom: 'xxlarge' }}>
                <FormInput.Select name="credType" label={getString('credType')} items={credTypeOptions} />
                <AwsKmsAccessKeyForm formik={formik} accountId={accountIdentifier} />
                {formik.values?.credType === credTypeOptions[2].value && (
                  <>
                    <FormInput.Text name="roleArn" label={getString('connectors.awsKms.roleArnLabel')} />
                    <FormInput.Text name="externalName" label={getString('connectors.awsKms.externalId')} />
                    <FormInput.Text
                      name="assumeStsRoleDuration"
                      label={getString('connectors.awsKms.assumedRoleDuration')}
                    />
                  </>
                )}

                {(formik.values?.credType === credTypeOptions[1].value ||
                  formik.values?.credType === credTypeOptions[2].value) && (
                  <Layout.Vertical spacing="xsmall">
                    <Text lineClamp={1}>{getString('delegate.DelegateSelector')}</Text>
                    <DelegateSelectors
                      fill
                      allowNewTag={false}
                      placeholder={getString('delegate.DelegateselectionPlaceholder')}
                      selectedItems={formik.values.delegate}
                      onChange={tags => {
                        formik.setFieldValue('delegate', tags)
                      }}
                    ></DelegateSelectors>
                    <Text intent="danger">{formik.errors.delegate}</Text>
                  </Layout.Vertical>
                )}
              </Container>
              <Layout.Horizontal spacing="medium">
                <Button text={getString('back')} onClick={() => previousStep?.(prevStepData)} />
                <Button
                  type="submit"
                  intent="primary"
                  rightIcon="chevron-right"
                  text={getString('saveAndContinue')}
                  disabled={updateLoading || createLoading}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default AwsKmsConfig
