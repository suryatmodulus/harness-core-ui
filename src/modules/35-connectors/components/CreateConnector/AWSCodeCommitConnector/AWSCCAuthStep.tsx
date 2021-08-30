import React, { useState, useEffect } from 'react'
import {
  StepProps,
  Formik,
  FormikForm,
  Layout,
  Text,
  Color,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  Button
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import {
  useCreateConnector,
  useUpdateConnector,
  ConnectorConfigDTO,
  ConnectorRequestBody,
  ConnectorInfoDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import SecretInput from '@secrets/components/SecretInput/SecretInput'
import TextReference, { ValueType } from '@secrets/components/TextReference/TextReference'
import { buildAWSCodeCommitPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import { setSecretField } from '@secrets/utils/SecretField'

interface AWSCCAuthStepProps extends StepProps<ConnectorConfigDTO> {
  isEditMode: boolean
  connectorInfo?: ConnectorInfoDTO
  onSuccess?: (data?: ConnectorRequestBody) => void | Promise<void>
  setIsEditMode: (val: boolean) => void
}

export default function AWSCCAuthStep(props: AWSCCAuthStepProps) {
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const [loadingSecrets, setLoadingSecrets] = useState(props.isEditMode)
  const [isSaving, setIsSaving] = useState(false)
  const [initialValues, setInitialValues] = useState<ConnectorConfigDTO>({
    accessKey: undefined,
    secretKey: undefined
  })
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })

  useEffect(() => {
    ;(async () => {
      if (props.isEditMode) {
        const { accessKey, accessKeyRef, secretKeyRef } = props.connectorInfo?.spec?.authentication?.spec?.spec ?? {}
        setInitialValues({
          accessKey:
            accessKey || accessKeyRef
              ? {
                  value: accessKeyRef || accessKey,
                  type: accessKeyRef ? ValueType.ENCRYPTED : ValueType.TEXT
                }
              : undefined,
          secretKey: await setSecretField(secretKeyRef, {
            accountIdentifier: accountId,
            projectIdentifier,
            orgIdentifier
          })
        })
        setLoadingSecrets(false)
      }
    })()
  }, [])

  const handleSubmit = async (formData: ConnectorConfigDTO) => {
    try {
      modalErrorHandler?.hide()
      setIsSaving(true)
      let response
      if (props.isEditMode) {
        response = await updateConnector(buildAWSCodeCommitPayload(formData))
        showSuccess(getString('connectors.successfullUpdate', { name: formData.name }))
      } else {
        response = await createConnector(buildAWSCodeCommitPayload(formData))
        props.setIsEditMode(true)
        showSuccess(getString('connectors.successfullCreate', { name: formData.name }))
      }
      props.onSuccess?.(response.data)
      props.nextStep?.({ ...props.prevStepData, ...formData })
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (loadingSecrets) {
    return <PageSpinner />
  }

  return (
    <Formik
      initialValues={{ ...initialValues, ...props.prevStepData }}
      validationSchema={Yup.object().shape({
        accessKey: Yup.object().required(),
        secretKey: Yup.mixed().required()
      })}
      formName="awsCcAuthForm"
      onSubmit={formData => {
        handleSubmit({
          ...formData,
          projectIdentifier,
          orgIdentifier
        })
      }}
    >
      {formikPros => (
        <FormikForm>
          <ModalErrorHandler bind={setModalErrorHandler} />
          <Layout.Vertical spacing="large" padding="small" width="60%" style={{ minHeight: 440 }}>
            <Text font="medium" margin={{ top: 'small' }} color={Color.BLACK}>
              {getString('credentials')}
            </Text>
            <Text margin={{ top: 'medium', bottom: 'medium' }}>{getString('authentication')}</Text>
            <TextReference
              name="accessKey"
              stringId="connectors.aws.accessKey"
              type={(formikPros.values as any)?.accessKey?.type}
            />
            <SecretInput name="secretKey" label={getString('connectors.aws.secretKey')} />
          </Layout.Vertical>
          <Layout.Horizontal padding={{ top: 'small' }} spacing="medium">
            <Button onClick={() => props.previousStep?.({ ...props.prevStepData })} text={getString('back')} />
            <Button
              type="submit"
              intent="primary"
              rightIcon="chevron-right"
              text={getString('saveAndContinue')}
              disabled={isSaving}
            />
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}
