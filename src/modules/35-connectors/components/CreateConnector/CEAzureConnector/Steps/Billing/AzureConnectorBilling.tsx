import React, { useContext, useState, useEffect } from 'react'
import {
  Heading,
  Layout,
  Text,
  Formik,
  FormikForm,
  FormInput,
  Icon,
  Button,
  StepProps,
  Container
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { get } from 'lodash-es'
import cx from 'classnames'
import { Popover, Position, PopoverInteractionKind, Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { BillingExportSpec, CEAzureConnector } from 'services/cd-ng'
import ShowExistingBillingExports from './AzureExistingBillingExports'
import { CEAzureDTO, guidRegex } from '../Overview/AzureConnectorOverview'
import { DialogExtensionContext } from '../../ModalExtension'
import css from '../../CreateCeAzureConnector_new.module.scss'

const storageAccountNameTest = (value: string) => {
  const regex = /^[a-z0-9]*$/
  const regexTest = regex.test(value)
  const lengthTest = value && value.length >= 3 && value.length <= 24
  return !!(lengthTest && regexTest)
}

const BillingExport: React.FC<StepProps<CEAzureDTO>> = props => {
  const { getString } = useStrings()
  const { triggerExtension, closeExtension } = useContext(DialogExtensionContext)
  const { prevStepData, previousStep, nextStep } = props
  const billingExportSpec = prevStepData?.spec.billingExportSpec
  const [showBillingExportForm, setShowBillingExportForm] = useState(
    !!prevStepData?.hasBilling || !(prevStepData?.existingBillingExports || []).length
  )

  const handleSubmit = (formData: BillingExportSpec) => {
    const nextStepData: CEAzureDTO = {
      ...((prevStepData || {}) as CEAzureDTO),
      spec: {
        ...((prevStepData?.spec || {}) as CEAzureConnector),
        billingExportSpec: { ...formData }
      }
    }

    if (showBillingExportForm) {
      const features = [...(prevStepData!.spec?.featuresEnabled || [])]
      if (!features.includes('BILLING')) {
        nextStepData.spec.featuresEnabled = features.concat('BILLING')
        nextStepData.hasBilling = true
      }
    }

    closeExtension()
    nextStep?.(nextStepData)
  }

  const renderForm = () => {
    const FORM_INPUTS = [
      {
        name: 'storageAccountName',
        label: getString('connectors.ceAzure.billing.storageAccountName')
      },
      {
        name: 'subscriptionId',
        label: getString('connectors.ceAzure.billing.subscriptionId'),
        placeholder: getString('connectors.ceAzure.guidPlaceholder')
      },
      {
        name: 'containerName',
        label: getString('connectors.ceAzure.billing.containerName')
      },
      {
        name: 'directoryName',
        label: getString('connectors.ceAzure.billing.directoryName')
      },
      {
        name: 'reportName',
        label: getString('connectors.ceAzure.billing.reportName')
      }
    ]

    return (
      <Container style={{ minHeight: 385 }}>
        <Container className={cx(css.main, css.dataFields)}>
          {FORM_INPUTS.map(({ label, ...rest }, idx) => {
            return <FormInput.Text key={idx} {...rest} label={<LabelWithToolTip label={label} />} />
          })}
        </Container>
      </Container>
    )
  }

  useEffect(() => {
    if (showBillingExportForm) triggerExtension('BillingExport')
  }, [showBillingExportForm])

  const renderBillingExports = () => {
    return (
      <Container style={{ minHeight: 430 }}>
        <Layout.Vertical>
          <ShowExistingBillingExports existingBillingExports={prevStepData?.existingBillingExports || []} />
          <Container style={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <Button
              type="submit"
              withoutBoxShadow={true}
              className={css.createNewExportBtn}
              text={getString('connectors.ceAzure.existingExports.createNewExportBtn')}
              onClick={() => setShowBillingExportForm(true)}
            />
          </Container>
        </Layout.Vertical>
      </Container>
    )
  }

  const getSchemaValidations = () => {
    if (!showBillingExportForm) return {}
    return Yup.object().shape({
      storageAccountName: Yup.string()
        .required(getString('connectors.ceAzure.validation.storageAccountName'))
        .test(
          'storageAccountName',
          getString('connectors.ceAzure.billing.storageAccountNameRegexError'),
          storageAccountNameTest
        ),
      directoryName: Yup.string().required(getString('connectors.ceAzure.validation.directoryName')),
      containerName: Yup.string().required(getString('connectors.ceAzure.validation.containerName')),
      reportName: Yup.string().required(getString('connectors.ceAzure.validation.containerName')),
      subscriptionId: Yup.string()
        .required(getString('connectors.ceAzure.validation.subscriptionId'))
        .test('subscriptionId', getString('connectors.ceAzure.guidRegexError'), guidRegex)
    })
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAzure.billing.heading')}
      </Heading>
      <Text className={css.subHeader}>{getString('connectors.ceAzure.billing.subHeading')}</Text>
      <Text
        font="small"
        className={css.info}
        color="primary7"
        inline
        icon="info-sign"
        iconProps={{ size: 15, color: 'primary7', margin: { right: 'xsmall' } }}
      >
        {showBillingExportForm
          ? getString('connectors.ceAzure.billing.instruction')
          : getString('connectors.ceAzure.existingExports.instruction')}
      </Text>
      {showBillingExportForm && (
        <Container className={css.launchTemplateSection}>
          <Layout.Vertical spacing="xsmall">
            <Button
              type="submit"
              withoutBoxShadow={true}
              className={css.launchTemplateBtn}
              text={getString('connectors.ceAzure.billing.launchAzureConsole')}
              onClick={() => {
                window.open('https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/exports')
              }}
            />
            <Text font="small" style={{ textAlign: 'center' }}>
              {getString('connectors.ceAzure.billing.login')}
            </Text>
          </Layout.Vertical>
        </Container>
      )}
      <Container>
        <Formik<BillingExportSpec>
          onSubmit={formData => {
            handleSubmit(formData)
          }}
          formName="billingExportsForm"
          validationSchema={getSchemaValidations()}
          initialValues={{
            storageAccountName: billingExportSpec?.storageAccountName || '',
            subscriptionId: billingExportSpec?.subscriptionId || get(prevStepData, 'spec.subscriptionId') || '',
            containerName: billingExportSpec?.containerName || '',
            directoryName: billingExportSpec?.directoryName || '',
            reportName: billingExportSpec?.reportName || ''
          }}
        >
          {() => {
            return (
              <FormikForm style={{ padding: '10px 0 25px' }}>
                {showBillingExportForm ? renderForm() : renderBillingExports()}
                <Layout.Horizontal spacing="medium">
                  <Button
                    text={getString('previous')}
                    icon="chevron-left"
                    onClick={() => {
                      closeExtension()
                      previousStep?.(prevStepData)
                    }}
                  />
                  <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={false}>
                    {getString('continue')}
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

const LabelWithToolTip = ({ label }: { label: string }) => {
  const { getString } = useStrings()
  const { triggerExtension } = useContext(DialogExtensionContext)
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
              {getString('connectors.ceAzure.billing.tooltipInstruction')}
            </Text>
            <div className={css.btnCtn}>
              <Button
                intent="primary"
                className={css.instructionBtn}
                font={'xsmall'}
                minimal
                text={getString('connectors.ceAzure.billing.tooltipBtn')}
                onClick={() => triggerExtension('BillingExport')}
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

export default BillingExport
