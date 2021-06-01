import React from 'react'
import {
  Button,
  Formik,
  FormikForm,
  FormInput,
  Heading,
  Layout,
  Text,
  // ModalErrorHandler,
  StepProps,
  Container
  // Icon
} from '@wings-software/uicore'

// import * as Yup from 'yup'
import cx from 'classnames'

import type { ConnectorInfoDTO } from 'services/cd-ng' //ConnectorConfigDTO
import css from '../../CreateCeAzureConnector.module.scss'

interface BillingForm {
  storageAccount: string
  subscriptionId: string
  storageContainer: string
  storageDir: string
}

const BillingExport: React.FC<StepProps<ConnectorInfoDTO>> = props => {
  const { prevStepData, previousStep } = props

  const handleSubmit = (formData: BillingForm) => {
    // FIX this!
    return { ...formData }
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        Azure Billing Export
      </Heading>
      <Text className={css.subHeader}>
        Billing export is used to get insights into your cloud infrastructure and Azure services such as Storage
        account, Virtual machines, Containers etc.
      </Text>
      <Text
        font="small"
        className={css.info}
        color="primary7"
        inline
        icon="info-sign"
        iconProps={{ size: 15, color: 'primary7' }}
      >
        Please follow the instructions to provide access to the Billing export for the specified tenant ID
      </Text>
      <Container className={css.launchTemplateSection}>
        <Layout.Vertical spacing="xsmall">
          <Button
            type="submit"
            withoutBoxShadow={true}
            className={css.launchTemplateBtn}
            text={'Launch Azure Billing Exports'}
            onClick={() => {
              previousStep?.(prevStepData)
            }}
          />
          <Text font="small" style={{ textAlign: 'center' }}>
            and login to your master account
          </Text>
        </Layout.Vertical>
      </Container>
      <Container>
        <Formik<BillingForm>
          onSubmit={formData => {
            handleSubmit(formData)
          }}
          formName="connectorOverviewForm"
          // validationSchema={Yup.object().shape({
          //   name: NameSchema(),
          //   identifier: IdentifierSchema()
          // })}
          initialValues={{
            storageAccount: props.prevStepData?.spec?.storageAccount || '',
            subscriptionId: props.prevStepData?.spec?.subscriptionId || '',
            storageContainer: props.prevStepData?.spec?.storageContainer || '',
            storageDir: props.prevStepData?.spec?.storageDir || ''
          }}
        >
          {() => {
            return (
              <FormikForm>
                <Container style={{ minHeight: 300 }}>
                  <Container className={cx(css.main, css.dataFields)}>
                    <FormInput.Text name={'storageAccount'} label={'Storage Account Name'} />
                    <FormInput.Text name={'subscriptionId'} label={'Storage Account Subscription ID'} />
                    <FormInput.Text name={'storageContainer'} label={'Storage Container'} />
                    <FormInput.Text name={'storageDir'} label={'Storage Directory'} />
                  </Container>
                </Container>
                <Layout.Horizontal spacing="medium">
                  <Button text="Previous" icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
                  <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={false}>
                    Continue
                  </Button>
                </Layout.Horizontal>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

export default BillingExport
