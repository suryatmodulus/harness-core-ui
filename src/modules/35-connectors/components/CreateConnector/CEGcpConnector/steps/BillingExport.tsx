import React, { useContext, useEffect } from 'react'
import {
  Button,
  Container,
  Formik,
  FormikForm,
  Heading,
  Layout,
  StepProps,
  FormInput,
  Text
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import LabelWithTooltip from '@connectors/common/LabelWithTooltip/LabelWithTooltip'
import type { GcpBillingExportSpec, GcpCloudCostConnector } from 'services/cd-ng'
import type { CEGcpConnectorDTO } from './OverviewStep'
import BillingExportExtention from './BillingExportExtention'
import css from '../CreateCeGcpConnector.module.scss'

const BillingExport: React.FC<StepProps<CEGcpConnectorDTO>> = props => {
  const { getString } = useStrings()

  const { prevStepData, nextStep, previousStep } = props

  const { triggerExtension, closeExtension } = useContext(DialogExtensionContext)

  const handleSubmit = (formData: GcpBillingExportSpec) => {
    const newSpec: GcpCloudCostConnector = {
      projectId: '',
      featuresEnabled: ['BILLING'],
      ...prevStepData?.spec,
      billingExportSpec: {
        datasetId: formData.datasetId
      },
      serviceAccountEmail: ''
    }
    const payload = prevStepData
    if (payload) {
      payload.spec = newSpec
    }

    closeExtension()
    if (nextStep) nextStep(payload)
  }

  useEffect(() => {
    triggerExtension(BillingExportExtention)
  }, [])

  const handlePrev = () => {
    closeExtension()
    previousStep?.({ ...(prevStepData as CEGcpConnectorDTO) })
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceGcp.billingExport.heading')}
      </Heading>
      <div className={css.subHeader} style={{ paddingRight: 40 }}>
        {getString('connectors.ceGcp.billingExport.description')}
      </div>
      <Text
        font="small"
        className={css.info}
        color="primary7"
        inline
        icon="info-sign"
        iconProps={{ size: 15, color: 'primary7', margin: { right: 'xsmall' } }}
      >
        {getString('connectors.ceGcp.billingExport.followInstruction')}
      </Text>
      <Container>
        <Button
          className={css.launchTemplateBut}
          text={getString('connectors.ceGcp.billingExport.launchTemplate')}
          rightIcon="chevron-right"
          onClick={() => {
            window.open('https://cloud.google.com/bigquery/')
          }}
        />
      </Container>
      <div style={{ flex: 1 }}>
        <Formik<GcpBillingExportSpec>
          initialValues={{
            datasetId: prevStepData?.spec.billingExportSpec?.datasetId || ''
          }}
          onSubmit={formData => handleSubmit(formData)}
          formName="ceGcpBillingExport"
        >
          {() => (
            <FormikForm>
              <div>
                <FormInput.Text
                  name={'datasetId'}
                  label={
                    <LabelWithTooltip
                      label={getString('connectors.ceGcp.billingExport.datasetIdLabel')}
                      extentionComponent={BillingExportExtention}
                    />
                  }
                  className={css.dataFields}
                />
              </div>

              <Layout.Horizontal className={css.buttonPanel} spacing="small">
                <Button text={getString('previous')} icon="chevron-left" onClick={handlePrev}></Button>
                <Button type="submit" intent="primary" text={getString('continue')} rightIcon="chevron-right" />
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </div>
    </Layout.Vertical>
  )
}

export default BillingExport
