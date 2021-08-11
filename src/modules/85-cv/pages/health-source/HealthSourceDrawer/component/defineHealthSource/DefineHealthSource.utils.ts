import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { GCOProduct } from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/GoogleCloudOperationsMonitoringSourceUtils'
import { PrometheusProductNames } from '@cv/pages/health-source/connectors/PrometheusHealthSource/PrometheusHealthSource.constants'
import { NewRelicProductNames, ConnectorRefFieldName } from './DefineHealthSource.constant'
import type { DefineHealthSourceFormInterface } from './DefineHealthSource.types'

export const validate = (getString: UseStringsReturn['getString']) => {
  return Yup.object().shape({
    sourceType: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.source')),
    healthSourceName: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.name')),
    product: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.product')),
    [ConnectorRefFieldName]: Yup.string()
      .nullable()
      .required(getString('cv.onboarding.selectProductScreen.validationText.connectorRef'))
  })
}

export const validateDuplicateIdentifier = (values: DefineHealthSourceFormInterface): any => {
  const { healthSourceIdentifier, healthSourceList } = values
  if (healthSourceList?.some(item => item.identifier === healthSourceIdentifier)) {
    return { healthSourceName: 'identifier already exist' }
  }
}

export const getFeatureOption = (type: string, getString: UseStringsReturn['getString']): SelectOption[] => {
  switch (type) {
    case Connectors.APP_DYNAMICS:
      return [
        {
          value: 'Application Monitoring',
          label: getString('cv.monitoringSources.appD.product.applicationMonitoring')
        }
      ]
    case Connectors.GCP:
      return [
        {
          value: GCOProduct.CLOUD_METRICS,
          label: getString('cv.monitoringSources.gco.product.metrics')
        },
        {
          value: GCOProduct.CLOUD_LOGS,
          label: getString('cv.monitoringSources.gco.product.logs')
        }
      ]
    case HealthSourceTypes.StackdriverLog:
      return [
        {
          value: GCOProduct.CLOUD_LOGS,
          label: getString('cv.monitoringSources.gco.product.logs')
        }
      ]
    case Connectors.PROMETHEUS:
      return [
        {
          label: PrometheusProductNames.APM,
          value: getString('connectors.prometheusLabel')
        }
      ]
    case Connectors.NEW_RELIC:
      return [
        {
          value: NewRelicProductNames.APM,
          label: getString('connectors.newRelic.products.fullStackObservability')
        }
      ]
    default:
      return []
  }
}

export const getInitialValues = (sourceData: any): any => {
  const currentHealthSource = sourceData?.healthSourceList?.find(
    (el: any) => el?.identifier === sourceData?.healthSourceIdentifier
  )
  const selectedFeature = currentHealthSource?.spec?.feature
  const initialValues = {
    ...sourceData,
    product: selectedFeature ? { label: selectedFeature, value: selectedFeature } : { ...sourceData?.product }
  }
  return initialValues
}
