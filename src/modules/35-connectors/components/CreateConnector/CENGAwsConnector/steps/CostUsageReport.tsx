import React, { useContext, useEffect, useState } from 'react'
import * as Yup from 'yup'
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
import type { AwsCurAttributes, CEAwsConnector } from 'services/cd-ng'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import LabelWithTooltip from '@connectors/common/LabelWithTooltip/LabelWithTooltip'
import CostUsageReportExtention from './CostUsageReportExtenstion'
import CostUsageReportExisting from './CostUsageReportExisting'
import type { CEAwsConnectorDTO } from './OverviewStep'
import css from '../CreateCeAwsConnector.module.scss'

const CostUsageStep: React.FC<StepProps<CEAwsConnectorDTO>> = props => {
  const { getString } = useStrings()

  const { prevStepData, nextStep, previousStep } = props
  const { triggerExtension, closeExtension } = useContext(DialogExtensionContext)
  const existingCurReports = prevStepData?.existingCurReports || []
  const [isExistingCostUsageReport, setIsExistingCostUsageReport] = useState<boolean>(
    (!prevStepData?.includeBilling || false) && (existingCurReports.length > 0 || false)
  )

  const handleSubmit = (formData: AwsCurAttributes) => {
    const newspec: CEAwsConnector = {
      crossAccountAccess: { crossAccountRoleArn: '' },
      ...prevStepData?.spec,
      curAttributes: formData
    }
    const payload = prevStepData
    if (payload) {
      payload.spec = newspec
      payload.includeBilling = !isExistingCostUsageReport
    }
    closeExtension()
    nextStep?.(payload)
  }

  const handlePrev = () => {
    closeExtension()
    previousStep?.({ ...(prevStepData as CEAwsConnectorDTO) })
  }

  const getValidationScheme = () => {
    if (isExistingCostUsageReport) return {}
    else
      return Yup.object().shape({
        reportName: Yup.string().required(getString('connectors.ceAws.cur.validation.reportRequired')),
        s3BucketName: Yup.string().required(getString('connectors.ceAws.cur.validation.bucketRequired'))
      })
  }

  useEffect(() => {
    if (!isExistingCostUsageReport) triggerExtension(<CostUsageReportExtention />)
  }, [isExistingCostUsageReport])

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAws.cur.heading')}
      </Heading>
      <Text className={css.subHeader}>{getString('connectors.ceAws.cur.subheading')}</Text>

      {!isExistingCostUsageReport && (
        <div>
          <Text
            font="small"
            className={css.info}
            color="primary7"
            inline
            icon="info-sign"
            iconProps={{ size: 15, color: 'primary7', margin: { right: 'xsmall' } }}
          >
            {getString('connectors.ceAws.cur.followInstruction')}
          </Text>
          <Container padding={{ bottom: 35 }}>
            <Layout.Vertical style={{ width: '65%' }}>
              <Button
                className={css.launchTemplateBut}
                text={getString('connectors.ceAws.cur.launchTemplate')}
                icon="main-share"
                iconProps={{ size: 12, margin: { right: 'xsmall' } }}
                onClick={() => {
                  window.open('https://console.aws.amazon.com/billing/home?#/reports')
                }}
              />
              <Text font="small" style={{ textAlign: 'center' }}>
                {getString('connectors.ceAws.cur.login')}
              </Text>
            </Layout.Vertical>
          </Container>
        </div>
      )}

      <div style={{ flex: 1 }}>
        <Formik<AwsCurAttributes>
          formName="costUsageReportForm"
          initialValues={{
            reportName: prevStepData?.spec?.curAttributes?.reportName || '',
            s3BucketName: prevStepData?.spec?.curAttributes?.s3BucketName || ''
          }}
          validationSchema={getValidationScheme()}
          onSubmit={formData => handleSubmit(formData)}
        >
          {() => (
            <FormikForm>
              {isExistingCostUsageReport && (
                <Layout.Vertical spacing="xlarge">
                  <CostUsageReportExisting existingCurReports={prevStepData?.existingCurReports || []} />
                  <div>
                    <Button
                      className={css.newCurReport}
                      text={getString('connectors.ceAws.cur.createNew')}
                      onClick={() => {
                        setIsExistingCostUsageReport(false)
                      }}
                    />
                  </div>
                </Layout.Vertical>
              )}

              {!isExistingCostUsageReport && (
                <div>
                  <FormInput.Text
                    name={'reportName'}
                    label={
                      <LabelWithTooltip
                        label={getString('connectors.ceAws.cur.reportName')}
                        extentionComponent={CostUsageReportExtention}
                      />
                    }
                    className={css.dataFields}
                  />
                  <FormInput.Text
                    name={'s3BucketName'}
                    label={
                      <LabelWithTooltip
                        label={getString('connectors.ceAws.cur.bucketName')}
                        extentionComponent={CostUsageReportExtention}
                      />
                    }
                    className={css.dataFields}
                  />
                </div>
              )}

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

export default CostUsageStep
