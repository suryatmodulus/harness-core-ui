import * as Yup from 'yup'
import type { UseStringsReturn } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { SelectOrCreateConnectorFieldNames } from '@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector'
import { GCOProduct } from '@cv/pages/monitoring-source/google-cloud-operations/GoogleCloudOperationsMonitoringSourceUtils'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import { PrometheusProductNames } from '@cv/pages/health-source/connectors/PrometheusHealthSource/PrometheusHealthSource.constants'
import { NewRelicProductNames } from './DefineHealthSource.constant'

export const validate = (isEdit: boolean, getString: UseStringsReturn['getString']) => {
  return Yup.object().shape({
    sourceType: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.source')),
    healthSourceName: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.name')),
    product: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.product')),
    [SelectOrCreateConnectorFieldNames.CONNECTOR_REF]: isEdit
      ? Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.connectorRef'))
      : Yup.object().required(getString('cv.onboarding.selectProductScreen.validationText.connectorRef'))
  })
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
