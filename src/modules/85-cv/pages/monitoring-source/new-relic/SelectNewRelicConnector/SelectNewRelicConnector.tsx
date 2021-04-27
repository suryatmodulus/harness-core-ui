import React, { useContext } from 'react'
import { Formik, FormikForm, Layout } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router'
import { FooterCTA, SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import {
  DefineYourMonitoringSource,
  DefineYourMonitoringSourceProps
} from '@cv/components/CVSetupSourcesView/DefineYourMonitoringSource/DefineYourMonitoringSource'
import { useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { SelectCVConnector } from '@cv/components/CVSetupSourcesView/SelectCVConnector/SelectCVConnector'
import type { StepLabelProps } from '@cv/components/CVSetupSourcesView/StepLabel/StepLabel'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { buildConnectorRef } from '@cv/pages/onboarding/CVOnBoardingUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
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

function getValidationSchema(getString: UseStringsReturn['getString']): Record<string, any> {
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
    productName: Yup.string().required(getString('cv.onboarding.selectProductScreen.validationText.product'))
  })
}

export function SelectNewRelicConnector(): JSX.Element {
  const { getString } = useStrings()
  const { identifier } = useParams<ProjectPathProps & { identifier: string }>()
  const { onPrevious, onNext, sourceData } = useContext(SetupSourceTabsContext)
  return (
    <SetupSourceLayout
      content={
        <Formik
          onSubmit={values => {
            onNext(values, { tabStatus: 'SUCCESS' })
          }}
          initialValues={sourceData}
          validationSchema={getValidationSchema(getString)}
          render={formikProps => (
            <FormikForm>
              <Layout.Vertical spacing="medium">
                <DefineYourMonitoringSource
                  {...DefineYourMonitoringSourceBaseProps}
                  formikProps={formikProps}
                  isEdit={Boolean(identifier)}
                  mainHeading={getString('cv.onboarding.monitoringSources.defineMonitoringSource')}
                  subHeading={getString('cv.onboarding.monitoringSources.monitoringSourceSubheading')}
                />
                <SelectCVConnector
                  connectorTypeLabel={getString('cv.monitoringSources.newRelicName')}
                  connectorType="NewRelic"
                  isEdit={Boolean(identifier)}
                  stepLabelProps={SelectCVConnectorStepProps}
                  onCreateConnector={val => formikProps.setFieldValue('connectorRef', buildConnectorRef(val))}
                />
                {formikProps.values.connectorRef && (
                  <SelectMonitoringSourceProduct
                    products={[
                      {
                        productName: NewRelicProductNames.APM,
                        productLabel: getString('connectors.newRelic.products.fullStackObservability'),
                        icon: { name: 'service-newrelic', size: 35 }
                      }
                    ]}
                    stepLabelProps={SelectMonitoringSourceStepProps}
                    monitoringSourceName={getString('cv.monitoringSources.newRelicName')}
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
