import React, { useContext } from 'react'
import { Formik, FormikForm, Layout } from '@wings-software/uicore'
import * as Yup from 'yup'
import { FooterCTA, SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import {
  DefineYourMonitoringSource,
  DefineYourMonitoringSourceProps
} from '@cv/components/CVSetupSourcesView/DefineYourMonitoringSource/DefineYourMonitoringSource'
import { useStrings, UseStringsReturn } from 'framework/exports'
import { SelectCVConnector } from '@cv/components/CVSetupSourcesView/SelectCVConnector/SelectCVConnector'
import type { StepLabelProps } from '@cv/components/CVSetupSourcesView/StepLabel/StepLabel'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { buildConnectorRef } from '@cv/pages/onboarding/CVOnBoardingUtils'
import { StringUtils } from '@common/exports'
import { SelectMonitoringSourceProduct } from '@cv/components/CVSetupSourcesView/SelectMonitoringSourceProduct/SelectMonitoringSourceProduct'
import { NewRelicProductNames } from '../NewRelicMonitoringSourceUtils'

const DefineYourMonitoringSourceBaseProps: Omit<
  DefineYourMonitoringSourceProps,
  'mainHeading' | 'subHeading' | 'formikProps'
> = {
  stepLabelProps: {
    stepNumber: 1,
    totalSteps: 3
  },
  iconLabel: 'NewRelic',
  sourceIcon: { name: 'service-newrelic' }
}

const SelectCVConnectorStepProps: StepLabelProps = {
  stepNumber: 2,
  totalSteps: 3
}

const SelectMonitoringSourceStepProps: StepLabelProps = {
  stepNumber: 3,
  totalSteps: 3
}

function getValidationSchema(getString: UseStringsReturn['getString']): object {
  return Yup.object({
    monitoringSourceName: Yup.string().required(getString('cv.onboarding.selectProductScreen.validationText.name')),
    identifier: Yup.string().when('name', {
      is: val => val?.length,
      then: Yup.string()
        .trim()
        .required(getString('cv.onboarding.selectProductScreen.validationText.identifier'))
        .matches(
          /^(?![0-9])[0-9a-zA-Z_$]*$/,
          getString('cv.onboarding.selectProductScreen.validationText.validIdRegex')
        )
        .notOneOf(StringUtils.illegalIdentifiers)
    }),
    connectorRef: Yup.object().required(getString('cv.onboarding.selectProductScreen.validationText.connectorRef')),
    product: Yup.string().required(getString('cv.onboarding.selectProductScreen.validationText.product'))
  })
}

export function SelectNewRelicConnector(): JSX.Element {
  const { getString } = useStrings()
  const { onPrevious, onNext, sourceData } = useContext(SetupSourceTabsContext)
  return (
    <SetupSourceLayout
      content={
        <Formik
          onSubmit={values => onNext(values, { tabStatus: 'SUCCESS' })}
          initialValues={sourceData}
          validationSchema={getValidationSchema(getString)}
          render={formikProps => (
            <FormikForm>
              <Layout.Vertical spacing="medium">
                <DefineYourMonitoringSource
                  {...DefineYourMonitoringSourceBaseProps}
                  formikProps={formikProps}
                  mainHeading={getString('cv.onboarding.monitoringSources.defineMonitoringSource')}
                  subHeading={getString('cv.onboarding.monitoringSources.monitoringSourceSubheading')}
                />
                <SelectCVConnector
                  connectorTypeLabel="New Relic"
                  connectorType="NewRelic"
                  stepLabelProps={SelectCVConnectorStepProps}
                  onCreateConnector={val => formikProps.setFieldValue('connectorRef', buildConnectorRef(val))}
                />
                {formikProps.values.connectorRef && (
                  <SelectMonitoringSourceProduct
                    products={[
                      {
                        productName: NewRelicProductNames.APM,
                        productLabel: getString('cv.monitoringSources.newRelic.products.fullStackObservability'),
                        icon: { name: 'service-newrelic', size: 35 }
                      }
                    ]}
                    stepLabelProps={SelectMonitoringSourceStepProps}
                    monitoringSourceName="New Relic"
                    monitoringSourceEntityName={getString('applications').toLocaleLowerCase()}
                  />
                )}
              </Layout.Vertical>
              <FooterCTA onNext={formikProps.submitForm} onPrevious={() => onPrevious(formikProps.values)} />
            </FormikForm>
          )}
        />
      }
    />
  )
}
