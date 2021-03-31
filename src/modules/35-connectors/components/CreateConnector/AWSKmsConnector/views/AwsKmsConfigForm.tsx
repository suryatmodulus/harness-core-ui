import React, { useState } from 'react'
// import * as Yup from 'yup'
import {
  Button,
  Formik,
  FormikForm,
  Layout,
  StepProps,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Container,
  Text,
  SelectOption
} from '@wings-software/uicore'
// import { useParams } from 'react-router-dom'
// import { pick } from 'lodash-es'

import { useToaster } from '@common/exports'
// import { ConnectorRequestBody, useCreateConnector, useUpdateConnector } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import AwsKmsConnectorFormFields from './AwsKmsConnectorFormFields'
import type { CreateAwsKmsConnectorProps, StepSecretManagerProps } from '../CreateAwsKmsConnector'

export interface AwsKmsConfigFormData {
  accessKey: string
  secretAccessKey: any
  аrnKey: any
  region: SelectOption
}

const AwsKmsConfigForm: React.FC<StepProps<StepSecretManagerProps> & CreateAwsKmsConnectorProps> = ({
  prevStepData,
  previousStep,
  nextStep,
  isEditMode
  // onSuccess
}) => {
  // const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  // const { mutate: CreateHashiCorpVault, loading: createLoading } = useCreateConnector({
  //   queryParams: { accountIdentifier: accountId }
  // })
  // const { mutate: updateSecretManager, loading: updateLoading } = useUpdateConnector({
  //   queryParams: { accountIdentifier: accountId }
  // })

  const handleSubmit = async (formData: AwsKmsConfigFormData): Promise<void> => {
    if (prevStepData) {
      // TODO: check this
      // const dataToSubmit: ConnectorRequestBody = {
      //   connector: {
      //     orgIdentifier,
      //     projectIdentifier,
      //     ...pick(prevStepData, ['name', 'identifier', 'description', 'tags']),
      //     type: 'AwsKms',
      //     spec: {
      //       ...pick(formData, ['accessKey', 'secretAccessKey', 'аrnKey', 'region'])
      //     }
      //   }
      // }

      try {
        // TODO: add api calls
        if (!isEditMode && prevStepData.isEdit != true) {
          //   const response = await CreateHashiCorpVault(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: true })
          //   onSuccess(response.data)
          showSuccess(getString('secretManager.createmessageSuccess'))
        } else {
          //   const response = await updateSecretManager(dataToSubmit)
          nextStep?.({ ...prevStepData, spec: { ...formData }, isEdit: true })
          //   onSuccess(response.data)
          showSuccess(getString('secretManager.editmessageSuccess'))
        }
      } catch (err) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(err?.data?.message)
      }
    }
  }

  return (
    <Container padding={{ top: 'medium' }} width="64%">
      <Text font={{ size: 'medium' }} padding={{ bottom: 'xlarge' }}>
        {getString('details')}
      </Text>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<AwsKmsConfigFormData>
        initialValues={{
          accessKey: '',
          secretAccessKey: '',
          аrnKey: '',
          region: { label: '', value: '' }
        }}
        // validationSchema={Yup.object().shape({
        //   accessKey: Yup.string().trim().required(i18n.validationVaultUrl),
        //   secretEngineName: Yup.string().when('engineType', {
        //     is: 'manual',
        //     then: Yup.string().trim().required(i18n.validationEngine)
        //   }),
        //   secretEngineVersion: Yup.number().when('engineType', {
        //     is: 'manual',
        //     then: Yup.number().positive(i18n.validationVersionNumber).required(i18n.validationVersion)
        //   }),
        //   secretEngine: Yup.string().when('engineType', {
        //     is: 'fetch',
        //     then: Yup.string().trim().required(i18n.validationSecretEngine)
        //   }),
        //   renewalIntervalMinutes: Yup.number().positive(i18n.validationRenewalNumber).required(i18n.validationRenewal),
        //   appRoleId: Yup.string().when('accessType', {
        //     is: 'APP_ROLE',
        //     then: Yup.string().trim().required(i18n.validationAppRole)
        //   }),
        //   secretId: Yup.string().when('accessType', {
        //     is: 'APP_ROLE',
        //     then: Yup.string()
        //       .trim()
        //       .test('secretId', i18n.validationSecretId, function (value) {
        //         if ((prevStepData?.spec as VaultConnectorDTO)?.accessType === 'APP_ROLE') return true
        //         else if (value?.length > 0) return true
        //         return false
        //       })
        //   })
        // })}
        onSubmit={formData => {
          handleSubmit(formData)
        }}
      >
        {formik => {
          return (
            <FormikForm>
              <AwsKmsConnectorFormFields formik={formik} isEditing={isEditMode} />
              <Layout.Horizontal spacing="medium">
                <Button text={getString('back')} onClick={() => previousStep?.(prevStepData)} />
                <Button
                  type="submit"
                  intent="primary"
                  rightIcon="chevron-right"
                  text={getString('saveAndContinue')}
                  // disabled={updateLoading || createLoading}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default AwsKmsConfigForm
