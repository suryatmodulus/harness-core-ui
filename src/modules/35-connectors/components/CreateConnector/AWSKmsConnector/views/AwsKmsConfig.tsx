import React, { useState } from 'react'
import {
  StepProps,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Container,
  Text,
  SelectOption,
  FormInput
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'

import { useToaster } from '@common/exports'
import { ConnectorInfoDTO, ConnectorRequestBody, useCreateConnector, useUpdateConnector } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import AwsKmsAccessKeyForm, { AwsKmsAccessKeyFormData } from './AwsKmsAccessKeyForm'
import AwsKmsDelegateSelection from './AwsKmsDelegateSelection'
import type { CreateAwsKmsConnectorProps, StepSecretManagerProps } from '../CreateAwsKmsConnector'

export interface AwsKmsConfigDataProps {
  onSubmit: (data: AwsKmsAccessKeyFormData) => void
  connectorInfo?: ConnectorInfoDTO
  isEditMode?: boolean
  isLoading?: boolean
  previousStep?: (prevStepData?: StepSecretManagerProps | undefined) => void
  prevStepData?: StepSecretManagerProps
}

const credTypeOptions: SelectOption[] = [
  {
    label: 'AWS Access Key',
    value: 'awsAccessKey'
  },
  {
    label: 'Assume IAM role on delegate',
    value: 'assumeIamRole'
  }
]

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
  const [credType, setCredType] = useState(credTypeOptions[0])

  const { mutate: CreateAwsKMSConnector, loading: createLoading } = useCreateConnector({
    queryParams: { accountIdentifier }
  })
  const { mutate: updateSecretManager, loading: updateLoading } = useUpdateConnector({
    queryParams: { accountIdentifier }
  })

  const handleSubmit = async (data: AwsKmsAccessKeyFormData | undefined): Promise<void> => {
    if (prevStepData) {
      let dataToSubmit: ConnectorRequestBody
      if (credType === credTypeOptions[0]) {
        dataToSubmit = {
          connector: {
            orgIdentifier,
            projectIdentifier,
            ...pick(prevStepData, ['name', 'identifier', 'description', 'tags']),
            type: 'Vault',
            // TODO: uncomment
            // type: 'AwsKms',
            spec: {
              accessKey: data?.accessKey,
              secretKey: data?.secretKey?.identifier,
              awsArn: data?.awsArn?.identifier,
              region: data?.region
            }
          }
        }
      } else {
        // TODO: add dataToSubmit for second step
        dataToSubmit = {}
      }

      try {
        if (!isEditMode && prevStepData.isEdit != true) {
          const response = await CreateAwsKMSConnector(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...data }, isEdit: true })
          onSuccess(response.data)
          showSuccess(getString('secretManager.createmessageSuccess'))
        } else {
          const response = await updateSecretManager(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...data }, isEdit: true })
          onSuccess(response.data)
          showSuccess(getString('secretManager.editmessageSuccess'))
        }
      } catch (err) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(err?.data?.message)
      }
    }
  }

  const commonStepProps: AwsKmsConfigDataProps = {
    connectorInfo: connectorInfo as ConnectorInfoDTO | undefined,
    onSubmit: handleSubmit,
    isEditMode,
    isLoading: updateLoading || createLoading,
    previousStep,
    prevStepData
  }

  return (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ size: 'medium' }} padding={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <FormInput.Select
        name="credType"
        label={getString('credType')}
        items={credTypeOptions}
        value={credType}
        onChange={setCredType}
      />
      {credType === credTypeOptions[0] ? (
        <AwsKmsAccessKeyForm {...commonStepProps} />
      ) : (
        <AwsKmsDelegateSelection {...commonStepProps} />
      )}
    </Container>
  )
}

export default AwsKmsConfig
