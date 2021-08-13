import type { IOptionProps } from '@blueprintjs/core'
import { isNumber, isEmpty } from 'lodash-es'
import type { StackdriverMetricHealthSourceSpec, RiskProfile, MetricPackDTO, TimeSeriesSampleDTO } from 'services/cv'
import type { StringKeys } from 'framework/strings'
import type { GCOMetricInfo, GCOMetricSetupSource } from './GCOMetricsHealthSource.type'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSourceTypes } from '../../types'
import { chartsConfig } from './GCOWidgetChartConfig'
import { OVERALL } from './GCOMetricsHealthSource.constants'

export const GCOProduct = {
  CLOUD_METRICS: 'Cloud Metrics',
  CLOUD_LOGS: 'Cloud Logs'
}

export const MANUAL_QUERY_DASHBOARD = 'Manual_Query_Dashboard'

export function getManuallyCreatedQueries(selectedMetrics: GCOMetricSetupSource['metricDefinition']): string[] {
  if (!selectedMetrics?.size) return []
  const manualQueries: string[] = []
  for (const entry of selectedMetrics) {
    const [metricName, metricInfo] = entry
    if (metricName && metricInfo?.isManualQuery) {
      manualQueries.push(metricName)
    }
  }
  return manualQueries
}

export function formatJSON(val?: string | Record<string, unknown>): string | undefined {
  try {
    if (!val) return
    const res = typeof val === 'string' ? JSON.parse(val) : val
    return JSON.stringify(res, null, 2)
  } catch (e) {
    return
  }
}

export function transformGCOMetricHealthSourceToGCOMetricSetupSource(sourceData: any): GCOMetricSetupSource {
  const healthSource: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.name === sourceData.healthSourceName
  )

  const setupSource: GCOMetricSetupSource = {
    selectedDashboards: sourceData.selectedDashboards || [],
    metricDefinition: sourceData.metricDefinition || new Map(),
    isEdit: sourceData.isEdit,
    healthSourceName: sourceData.healthSourceName,
    healthSourceIdentifier: sourceData.healthSourceIdentifier,
    connectorRef: sourceData.connectorRef,
    product: sourceData.product
  }

  if (!healthSource) {
    return setupSource
  }

  const gcoMetricSpec: StackdriverMetricHealthSourceSpec = healthSource.spec || {}

  for (const metricDefinition of gcoMetricSpec.metricDefinitions || []) {
    const manualQuery = metricDefinition?.isManualQuery
    if (
      !metricDefinition?.metricName ||
      ((!metricDefinition.dashboardName || !metricDefinition.dashboardPath) && !manualQuery)
    )
      continue

    const metricTags: any = {}
    for (const tag of metricDefinition.metricTags || []) {
      metricTags[tag] = ''
    }

    if (!sourceData.selectedDashboards?.length) {
      setupSource.selectedDashboards.push({
        name: metricDefinition.dashboardName,
        path: metricDefinition.dashboardPath
      })
    }
    setupSource.metricDefinition.set(metricDefinition.metricName, {
      metricName: metricDefinition.metricName,
      metricTags,
      dashboardName: metricDefinition.dashboardName,
      dashboardPath: metricDefinition.dashboardPath,
      isManualQuery: manualQuery,
      riskCategory: `${metricDefinition.riskProfile?.category}/${metricDefinition.riskProfile?.metricType}`,
      higherBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER'),
      lowerBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER'),
      query: JSON.stringify(metricDefinition.jsonMetricDefinition, null, 2)
    })
  }

  return setupSource
}

export function transformGCOMetricSetupSourceToGCOHealthSource(setupSource: GCOMetricSetupSource): UpdatedHealthSource {
  const healthSource: UpdatedHealthSource = {
    type: HealthSourceTypes.StackdriverMetrics as UpdatedHealthSource['type'],
    identifier: setupSource.healthSourceIdentifier,
    name: setupSource.healthSourceName,
    spec: {
      connectorRef: setupSource.connectorRef,
      feature: GCOProduct.CLOUD_METRICS,
      metricDefinitions: []
    }
  }
  for (const selectedMetricInfo of setupSource.metricDefinition) {
    const [selectedMetric, metricInfo] = selectedMetricInfo
    if (!selectedMetric || !metricInfo) continue
    const [category, metricType] = metricInfo.riskCategory?.split('/') || []

    const thresholdTypes: RiskProfile['thresholdTypes'] = []
    if (metricInfo.lowerBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_LOWER')
    }
    if (metricInfo.higherBaselineDeviation) {
      thresholdTypes.push('ACT_WHEN_HIGHER')
    }

    const spec: StackdriverMetricHealthSourceSpec = healthSource.spec || []
    spec.metricDefinitions?.push({
      dashboardName: metricInfo.dashboardName as string,
      dashboardPath: metricInfo.dashboardPath as string,
      metricName: metricInfo.metricName as string,
      metricTags: Object.keys(metricInfo.metricTags || {}),
      isManualQuery: metricInfo.isManualQuery,
      jsonMetricDefinition: JSON.parse(metricInfo.query || ''),
      riskProfile: {
        metricType: metricType as RiskProfile['metricType'],
        category: category as RiskProfile['category'],
        thresholdTypes
      }
    })
  }

  return healthSource
}

export function ensureFieldsAreFilled(
  values: GCOMetricInfo,
  getString: (key: StringKeys) => string
): Record<string, any> {
  const ret: any = {}
  if (!values?.query?.length) {
    ret.query = getString('cv.monitoringSources.gco.manualInputQueryModal.validation.query')
  }
  if (!values.riskCategory) {
    ret.riskCategory = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory')
  }
  if (!(values.higherBaselineDeviation || values.lowerBaselineDeviation)) {
    ret.higherBaselineDeviation = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
  }
  if (!values.metricName?.length) {
    ret.metricName = getString('cv.monitoringSources.metricNameValidation')
  }
  if (isEmpty(values.metricTags)) {
    ret.metricTags = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.tags')
  }
  return ret
}

export function validate(
  values: GCOMetricInfo,
  selectedMetrics: Map<string, GCOMetricInfo>,
  getString: (key: StringKeys) => string
): { [key: string]: string } | undefined {
  const errors = ensureFieldsAreFilled(values, getString)

  if (selectedMetrics.size === 1) {
    return errors
  }

  for (const entry of selectedMetrics) {
    const [, metricInfo] = entry
    if (metricInfo.metricName === values.metricName) continue
    if (isEmpty(ensureFieldsAreFilled(metricInfo, getString))) {
      return errors
    }
  }

  if (!isEmpty(errors)) {
    errors[OVERALL] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.mainSetupValidation')
  }

  return errors
}

export function initializeSelectedMetrics(
  selectedDashboards: GCOMetricSetupSource['selectedDashboards'],
  selectedMetrics?: GCOMetricSetupSource['metricDefinition']
): GCOMetricSetupSource['metricDefinition'] {
  if (!selectedMetrics?.size) {
    return new Map()
  }

  const updatedMap = new Map(selectedMetrics)
  for (const entry of updatedMap) {
    const [metricName, metricInfo] = entry
    if (
      !selectedDashboards.find(dashboard => dashboard?.name === metricInfo?.dashboardName) &&
      !metricInfo.isManualQuery
    ) {
      updatedMap.delete(metricName)
    }
  }

  return updatedMap
}

export function getRiskCategoryOptions(metricPacks?: MetricPackDTO[]): IOptionProps[] {
  if (!metricPacks?.length) {
    return []
  }

  const riskCategoryOptions: IOptionProps[] = []
  for (const metricPack of metricPacks) {
    if (metricPack?.identifier && metricPack.metrics?.length) {
      for (const metric of metricPack.metrics) {
        if (!metric?.name) {
          continue
        }

        riskCategoryOptions.push({
          label: metricPack.category !== metric.name ? `${metricPack.category}/${metric.name}` : metricPack.category,
          value: `${metricPack.category}/${metric.type}`
        })
      }
    }
  }

  return riskCategoryOptions
}

export function transformSampleDataIntoHighchartOptions(sampleData?: TimeSeriesSampleDTO[]): Highcharts.Options {
  if (!sampleData?.length) {
    return {}
  }

  const seriesData = new Map<string, Highcharts.SeriesLineOptions>()
  for (const data of sampleData) {
    if (!data || !data.timestamp || !data.txnName || !isNumber(data.metricValue)) continue
    let highchartsOptions = seriesData.get(data.txnName)
    if (!highchartsOptions) {
      highchartsOptions = { name: data.txnName, data: [], type: 'line' }
      seriesData.set(data.txnName, highchartsOptions)
    }

    highchartsOptions.data?.push([data.timestamp, data.metricValue])
  }

  return chartsConfig(Array.from(seriesData.values()).slice(0, 5))
}
