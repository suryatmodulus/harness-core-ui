import React, { useState } from 'react'
import { useParams } from 'react-router'
import {
  Button,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  StepProps
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import {
  ConnectorInfoDTO,
  ConnectorConfigDTO,
  ConnectorRequestBody,
  useCreateConnector,
  useUpdateConnector
} from 'services/cd-ng'
import css from './CreateCeAzureConnector.module.scss'

interface OverviewDetails {
  subscriptionId: string
  tenantId: string
  featuresEnabled: Array<'OPTIMIZATION' | 'BILLING'>
}

interface AzureBillingInfoProps {
  name?: string
  onSuccess?: (connector: ConnectorRequestBody) => void
  isEditMode: boolean
}

interface StepSecretManagerProps extends ConnectorInfoDTO {
  spec: any
}

const AzureBillingInfo: React.FC<StepProps<StepSecretManagerProps> & AzureBillingInfoProps> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<{
    accountId: string
    projectIdentifier: string
    orgIdentifier: string
  }>()
  const [isSaving, setIsSaving] = useState(false)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const { mutate: createConnector } = useCreateConnector({ queryParams: { accountIdentifier: accountId } })
  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: { accountIdentifier: accountId }
  })

  const handleSubmit = async (values: OverviewDetails): Promise<void> => {
    setIsSaving(true)
    try {
      modalErrorHandler?.hide()
      const spec: ConnectorConfigDTO = {
        subscriptionId: values.subscriptionId,
        tenantId: values.tenantId,
        featuresEnabled: ['OPTIMIZATION']
      }
      const connectorDetails: ConnectorInfoDTO = {
        ...(props.prevStepData as ConnectorInfoDTO),
        type: 'CEAzure',
        spec: spec
      }
      const connector = { connector: connectorDetails }
      if (!props.isEditMode) {
        const response = await createConnector(connector as ConnectorRequestBody)
        props.onSuccess?.(response.data as ConnectorRequestBody)
        props.nextStep?.({ ...connectorDetails })
      } else if (props.isEditMode === true) {
        const response = await updateConnector(connector)
        props.onSuccess?.(response.data as ConnectorRequestBody)
        props.nextStep?.({ ...connectorDetails })
      }
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    } finally {
      setIsSaving(false)
    }
  }
  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        Azure Connection Details
      </Heading>
      <div style={{ flex: 1 }}>
        <Formik<OverviewDetails>
          initialValues={{
            tenantId: props.prevStepData?.spec?.tenantId || '',
            subscriptionId: props.prevStepData?.spec?.subscriptionId || '',
            featuresEnabled: ['OPTIMIZATION']
          }}
          onSubmit={values => {
            handleSubmit(values)
          }}
        >
          {() => (
            <FormikForm>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <FormInput.Text
                name={'tenantId'}
                label={'Specify Tenant ID of the Azure account'}
                className={css.dataFields}
              />
              <FormInput.Text name={'subscriptionId'} label={'Subscription ID'} className={css.dataFields} />
              <Button
                type="submit"
                intent="primary"
                text={getString('continue')}
                rightIcon="chevron-right"
                loading={isSaving}
                disabled={isSaving}
                className={css.submitBtn}
              />
            </FormikForm>
          )}
        </Formik>
      </div>
    </Layout.Vertical>
  )
}

export default AzureBillingInfo
