import React, { useContext } from 'react'

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
  Container,
  Icon
} from '@wings-software/uicore'
import { Popover, Position, PopoverInteractionKind, Classes } from '@blueprintjs/core'
import * as Yup from 'yup'
import cx from 'classnames'
import type { ConnectorInfoDTO, ConnectorConfigDTO } from 'services/cd-ng'
import { DialogExtensionContext } from '../../ModalExtension'
import css from '../../CreateCeAzureConnector.module.scss'

interface BillingForm {
  storageAccountName: string
  subscriptionId: string
  containerName: string
  directoryName: string
  reportName: string
}

export const storageAccountNameTest = (value: string) => {
  const regex = /^[a-z0-9]*$/
  const regexTest = regex.test(value)
  const lengthTest = value && value.length >= 3 && value.length <= 24
  return !!(lengthTest && regexTest)
}

const BillingExport: React.FC<StepProps<ConnectorConfigDTO> & StepProps<ConnectorInfoDTO>> = props => {
  const billingExport = props.prevStepData?.billingExportSpec
  const tenantId = props.prevStepData?.tenantId
  const subscriptionId = props.prevStepData?.subscriptionId

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        Azure Billing Export
      </Heading>
      <Text className={css.subHeader}>
        Billing export is used to get insights into your cloud infrastructure and Azure services such as Storage
        account, Virtual machines, Containers etc.
      </Text>
      {billingExport ? (
        <Show {...(billingExport || {})} tenantId={tenantId} subscriptionId={subscriptionId} {...props} />
      ) : (
        <Create {...props} />
      )}
    </Layout.Vertical>
  )
}

const TextInputWithToolTip = ({ name, label }: { name: string; label: string }) => {
  const { triggerExtension } = useContext(DialogExtensionContext)
  const renderLabel = () => {
    return (
      <Layout.Horizontal spacing={'xsmall'}>
        <Text inline>{label}</Text>
        <Popover
          popoverClassName={Classes.DARK}
          position={Position.RIGHT}
          interactionKind={PopoverInteractionKind.HOVER}
          content={
            <div className={css.popoverContent}>
              <Text color="grey50" font={'xsmall'}>
                Provided in the delivery options when the template is opened in the AWS console
              </Text>
              <div className={css.btnCtn}>
                <Button
                  intent="primary"
                  className={css.instructionBtn}
                  font={'xsmall'}
                  minimal
                  text="Show instructions"
                  onClick={() => triggerExtension('CostUsageEx')}
                />
              </div>
            </div>
          }
        >
          <Icon
            name="info"
            size={12}
            color={'primary5'}
            onClick={async (event: React.MouseEvent<HTMLHeadingElement, globalThis.MouseEvent>) => {
              event.preventDefault()
              event.stopPropagation()
            }}
          />
        </Popover>
      </Layout.Horizontal>
    )
  }

  return <FormInput.Text name={name} label={renderLabel()} />
}

const Create: React.FC<StepProps<ConnectorInfoDTO> & StepProps<ConnectorConfigDTO>> = props => {
  const { prevStepData, previousStep, nextStep } = props
  const billingExport = prevStepData?.billingExportSpec

  const handleSubmit = (formData: BillingForm) => {
    nextStep?.({ ...prevStepData, ...formData })
  }

  return (
    <Container>
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
          validationSchema={Yup.object().shape({
            storageAccountName: Yup.string()
              .required('Storage account name is required')
              .test(
                'storageAccountName',
                'It must be 3 to 24 characters long, and can contain only lowercase letters and numbers.',
                storageAccountNameTest
              ),
            directoryName: Yup.string().required('Directory name is required')
          })}
          initialValues={{
            storageAccountName: billingExport?.storageAccountName || '',
            subscriptionId: billingExport?.subscriptionId || '',
            containerName: billingExport?.containerName || '',
            directoryName: billingExport?.directoryName || '',
            reportName: billingExport?.reportName || ''
          }}
        >
          {() => {
            return (
              <FormikForm style={{ padding: '10px 0 25px' }}>
                <Container style={{ minHeight: 385 }}>
                  <Container className={cx(css.main, css.dataFields)}>
                    <TextInputWithToolTip name="storageAccountName" label={'Storage Account Name'} />
                    <TextInputWithToolTip name="subscriptionId" label={'Storage Account Subscription ID'} />
                    <TextInputWithToolTip name="containerName" label={'Storage Container'} />
                    <TextInputWithToolTip name="directoryName" label={'Storage Directory'} />
                    <TextInputWithToolTip name="reportName" label={'Report Name'} />
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
    </Container>
  )
}

interface BillingInfo {
  [key: string]: string
}
const BILLING_INFO_LABELS: BillingInfo = {
  tenantId: 'Tenant ID',
  containerName: 'Storage Container',
  directoryName: 'Storage Directory',
  storageAccountName: 'Storage Account Name',
  subscriptionId: 'Storage Account Subscription ID',
  reportName: 'Report Name'
}

interface D {
  label: string
  value: string
}

// Fix this: find a better way
type ShowBillingExportProps = StepProps<ConnectorInfoDTO> & StepProps<ConnectorConfigDTO> & ConnectorConfigDTO

const Show: React.FC<ShowBillingExportProps> = props => {
  const { prevStepData, previousStep, nextStep } = props

  const Data: D[] = []
  Object.keys(props).forEach(k => {
    if (k in BILLING_INFO_LABELS) {
      Data.push({ label: BILLING_INFO_LABELS[k] || k, value: props[k] })
    }
  })

  return (
    <Container>
      <Text
        font="small"
        className={css.info}
        color="green700"
        inline
        icon="tick-circle"
        iconProps={{ size: 15, color: 'green700' }}
      >
        A Billing Export exists for this account. You may proceed to the next step.
      </Text>
      <Container className={css.billingExportCtn}>
        {Data.map((data, idx) => {
          return (
            <div key={idx} className={css.billingCredentials}>
              <span>{data.label}</span>
              <span>{data.value}</span>
            </div>
          )
        })}
      </Container>
      <Layout.Horizontal spacing="medium" className={css.continueAndPreviousBtns}>
        <Button
          text="Previous"
          icon="chevron-left"
          onClick={() => previousStep?.({ ...prevStepData, billingExportSpec: null })}
        />
        <Button text="Continue" rightIcon="chevron-right" onClick={() => nextStep?.(prevStepData)} intent="primary" />
      </Layout.Horizontal>
    </Container>
  )
}

export default BillingExport
