import * as Yup from 'yup'
import type { DefineYourMonitoringSourceProps } from '@cv/components/CVSetupSourcesView/DefineYourMonitoringSource/DefineYourMonitoringSource'
import type { UseStringsReturn } from 'framework/strings'
import { StringUtils } from '@common/exports'

export function getDefineMonitoringSourceBaseProps(
  getString: UseStringsReturn['getString']
): Omit<DefineYourMonitoringSourceProps, 'mainHeading' | 'subHeading' | 'formikProps'> {
  return {
    stepLabelProps: {
      stepNumber: 1,
      totalSteps: 3
    },
    iconLabel: getString('cv.monitoringSources.prometheusName'),
    sourceIcon: { name: 'service-prometheus' }
  }
}

export function getValidationSchema(getString: UseStringsReturn['getString']): Record<string, any> {
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
