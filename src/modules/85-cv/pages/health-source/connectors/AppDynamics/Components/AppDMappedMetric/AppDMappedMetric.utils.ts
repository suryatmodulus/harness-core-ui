import { omit } from 'lodash-es'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { BasePathData } from '../BasePath/BasePath.types'
import type { MetricPathData } from '../MetricPath/MetricPath.types'
import { BasePathInitValue } from '../BasePath/BasePath.constants'
import { MetricPathInitValue } from '../MetricPath/MetricPath.constants'

export function updateSelectedMetricsMap({ updatedMetric, oldMetric, mappedMetrics, formikValues }: any): any {
  const updatedMap = new Map(mappedMetrics)

  // in the case where user updates metric name, update the key for current value
  if (oldMetric !== formikValues?.metricName) {
    updatedMap.delete(oldMetric)
  }

  // if newly created metric create form object
  if (!updatedMap.has(updatedMetric)) {
    updatedMap.set(updatedMetric, {
      ...{
        sli: false,
        healthScore: false,
        continuousVerification: false,
        serviceInstanceMetricPath: '',
        basePath: BasePathInitValue,
        metricPath: MetricPathInitValue,
        metricIdentifier: updatedMetric.split(' ').join('_')
      }
    })
  }

  // update map with current form data
  if (formikValues?.metricName) {
    // Removing Service and Environment keys
    const filteredFormik = omit(formikValues, ['appdApplication', 'appDTier', 'metricData'])
    updatedMap.set(formikValues.metricName, {
      ...filteredFormik
    })
  }
  return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
}

export function initializeGroupNames(
  mappedMetrics: Map<string, any>,
  getString: UseStringsReturn['getString']
): SelectOption[] {
  const groupNames = Array.from(mappedMetrics?.entries())
    .map(metric => {
      const { groupName } = metric?.[1] || {}
      return groupName || null
    })
    .filter(groupItem => groupItem !== null) as SelectOption[]
  return [{ label: getString('cv.addNew'), value: '' }, ...groupNames]
}

export const getBasePathValue = (basePath: BasePathData): string => {
  return basePath ? Object.values(basePath)[Object.values(basePath).length - 1]?.path : ''
}

export const getMetricPathValue = (basePath: MetricPathData): string => {
  return basePath ? Object.values(basePath)[Object.values(basePath).length - 1]?.path : ''
}
