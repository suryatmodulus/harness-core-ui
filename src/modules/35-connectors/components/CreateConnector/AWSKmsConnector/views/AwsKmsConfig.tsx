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
import { useStrings } from 'framework/exports'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import { setupAwsKmsFormData } from '@connectors/pages/connectors/utils/ConnectorUtils'
import AwsKmsAccessKeyForm from './AwsKmsAccessKeyForm'
import AwsKmsDelegateSelection from './AwsKmsDelegateSelection'
import type { CreateAwsKmsConnectorProps, StepSecretManagerProps } from '../CreateAwsKmsConnector'

export interface AwsKmsConfigFormData {
  accessKey?: string
  secretKey?: SecretReference
  awsArn?: SecretReference
  region?: SelectOption
  credType?: string | SelectOption
  delegate?: string[]
}
export enum CredTypeValues {
  ManualConfig = 'ManualConfig',
  AssumeIAMRole = 'AssumeIAMRole'
}
const credTypeOptions: SelectOption[] = [
  {
    label: 'AWS Access Key',
    value: CredTypeValues.ManualConfig
  },
  {
    label: 'Assume IAM role on delegate',
    value: CredTypeValues.AssumeIAMRole
  }
]

const defaultInitialFormData: AwsKmsConfigFormData = {
  accessKey: undefined,
  secretKey: undefined,
  awsArn: undefined,
  region: undefined,
  credType: credTypeOptions[0].value as string,
  delegate: undefined
}

const AwsKmsConfig: React.FC<StepProps<StepSecretManagerProps> & CreateAwsKmsConnectorProps> = ({
  prevStepData,
  previousStep,
  nextStep,
  isEditMode,
  onSuccess,
  connectorInfo
}) => {
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  //const [credType, setCredType] = useState(credTypeOptions[0])
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
            region: formData?.region?.value,
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
          setupAwsKmsFormData(connectorInfo, accountIdentifier).then(data => {
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
        initialValues={{ ...initialValues }}
        validationSchema={Yup.object().shape({
          accessKey: Yup.string().when(['credType'], {
            is: credentials => credentials === credTypeOptions[0].value,
            then: Yup.string().trim().required(getString('connectors.aws.validation.accessKey'))
          }),
          secretKey: Yup.string().when(['credType'], {
            is: credentials => credentials === credTypeOptions[0].value,
            then: Yup.string().trim().required(getString('connectors.aws.validation.secretKeyRef'))
          }),
          awsArn: Yup.string().trim().required(getString('connectors.aws.validation.crossAccountRoleArn')),
          region: Yup.string().trim().required(getString('connectors.awsKms.validation.selectRegion')),
          delegate: Yup.string().when(['credType'], {
            is: credentials => credentials === credTypeOptions[1].value,
            then: Yup.string().trim().required(getString('connectors.awsKms.validation.selectDelegate'))
          })
        })}
        onSubmit={formData => {
          handleSubmit(formData)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <Container style={{ minHeight: 460 }}>
                <FormInput.Select name="credType" label={getString('credType')} items={credTypeOptions} />

                <AwsKmsAccessKeyForm formik={formik} accountId={accountIdentifier} />
                {formik.values?.credType === credTypeOptions[1].value && (
                  <AwsKmsDelegateSelection formik={formik} connectorInfo={connectorInfo} isEditMode={isEditMode} />
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
