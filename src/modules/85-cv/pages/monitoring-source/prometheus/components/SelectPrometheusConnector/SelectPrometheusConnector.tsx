import React, { useContext } from 'react'
import { Formik, FormikForm, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router'
import { FooterCTA, SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { DefineYourMonitoringSource } from '@cv/components/CVSetupSourcesView/DefineYourMonitoringSource/DefineYourMonitoringSource'
import { useStrings } from 'framework/strings'
import { SelectCVConnector } from '@cv/components/CVSetupSourcesView/SelectCVConnector/SelectCVConnector'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { buildConnectorRef } from '@cv/pages/onboarding/CVOnBoardingUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectMonitoringSourceProduct } from '@cv/components/CVSetupSourcesView/SelectMonitoringSourceProduct/SelectMonitoringSourceProduct'
import { PrometheusProductNames } from '../../constants'
import { getDefineMonitoringSourceBaseProps, getValidationSchema } from './utils'
import { SelectCVConnectorStepProps, SelectMonitoringSourceStepProps } from './constants'

export function SelectPrometheusConnector(): JSX.Element {
  const { getString } = useStrings()
  const { identifier } = useParams<ProjectPathProps & { identifier: string }>()
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
                  {...getDefineMonitoringSourceBaseProps(getString)}
                  formikProps={formikProps}
                  isEdit={Boolean(identifier)}
                  mainHeading={getString('cv.onboarding.monitoringSources.defineMonitoringSource')}
                  subHeading={getString('cv.onboarding.monitoringSources.monitoringSourceSubheading')}
                />
                <SelectCVConnector
                  connectorTypeLabel={getString('cv.monitoringSources.prometheusName')}
                  connectorType="Prometheus"
                  isEdit={Boolean(identifier)}
                  stepLabelProps={SelectCVConnectorStepProps}
                  onCreateConnector={val => formikProps.setFieldValue('connectorRef', buildConnectorRef(val))}
                />
                {formikProps.values.connectorRef && (
                  <SelectMonitoringSourceProduct
                    products={[
                      {
                        productName: PrometheusProductNames.APM,
                        productLabel: getString('cv.monitoringSources.prometheusName'),
                        icon: { name: 'service-prometheus', size: 35 }
                      }
                    ]}
                    stepLabelProps={SelectMonitoringSourceStepProps}
                    monitoringSourceName={getString('cv.monitoringSources.prometheusName')}
                    monitoringSourceEntityName={getString('dashboardLabel').toLocaleLowerCase()}
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
