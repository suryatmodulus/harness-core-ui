import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useCVTabsHook from '@cv/hooks/CVTabsHook/useCVTabsHook'
import { useStrings } from 'framework/exports'
import CVOnboardingTabs from '@cv/components/CVOnboardingTabs/CVOnboardingTabs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { DSConfig } from 'services/cv'
import { SelectProduct } from '../SelectProduct/SelectProduct'
import { SelectGCODashboards } from './SelectGCODashboards/SelectGCODashboards'
import { MapGCOMetricsToServices } from './MapGCOMetricsToServices/MapGCOMetricsToServices'
import {
  buildGCOMonitoringSourceInfo,
  GCODSConfig,
  GCOMonitoringSourceInfo,
  GCOProduct
} from './GoogleCloudOperationsMonitoringSourceUtils'
import { ReviewGCOMonitoringSource } from './ReviewGCOMonitoringSource/ReviewGCOMonitoringSource'

const DefaultValue = {
  name: `MyGoogleCloudOperationsSource`
}

export function transformGetResponse(
  gcoConfig: GCODSConfig,
  params: ProjectPathProps & { identifier: string }
): GCOMonitoringSourceInfo {
  const gcoInfo: GCOMonitoringSourceInfo = buildGCOMonitoringSourceInfo(params)
  if (!gcoConfig) {
    return gcoConfig
  }

  gcoInfo.accountId = gcoConfig.accountId
  gcoInfo.identifier = gcoConfig.identifier
  gcoInfo.name = gcoConfig.monitoringSourceName
  gcoInfo.type = 'STACKDRIVER'
  gcoInfo.orgIdentifier = gcoConfig.orgIdentifier
  gcoInfo.projectIdentifier = gcoConfig.projectIdentifier
  gcoInfo.connectorRef = {
    label: gcoConfig.connectorIdentifier as string,
    value: gcoConfig.connectorIdentifier as string
  }
  gcoInfo.product = GCOProduct.CLOUD_METRICS
  gcoInfo.selectedDashboards = []
  gcoInfo.selectedMetrics = new Map()

  for (const config of gcoConfig.metricConfigurations) {
    const { envIdentifier, serviceIdentifier, metricDefinition } = config
    if (
      !envIdentifier ||
      !serviceIdentifier ||
      !metricDefinition ||
      !metricDefinition.dashboardName ||
      !metricDefinition.dashboardPath ||
      !metricDefinition.metricName
    )
      continue

    const metricTags: any = {}
    for (const tag of metricDefinition.metricTags || []) {
      metricTags[tag] = ''
    }

    gcoInfo.selectedDashboards.push({ name: metricDefinition.dashboardName, path: metricDefinition.dashboardPath })
    gcoInfo.selectedMetrics.set(metricDefinition.metricName, {
      metricName: metricDefinition.metricName,
      metricTags,
      dashboardName: metricDefinition.dashboardName,
      dashboardPath: metricDefinition.dashboardPath,
      service: { label: serviceIdentifier, value: serviceIdentifier },
      environment: { label: envIdentifier, value: envIdentifier },
      isManualQuery: metricDefinition.isManualQuery,
      riskCategory: `${metricDefinition.riskProfile?.category}/${metricDefinition.riskProfile?.metricType}`,
      higherBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER'),
      lowerBaselineDeviation: metricDefinition.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER'),
      query: JSON.stringify(metricDefinition.jsonMetricDefinition, null, 2)
    })
  }

  return gcoInfo
}

export function GoogleCloudOperationsMonitoringSource({ dsConfig }: { dsConfig?: DSConfig | null }): JSX.Element {
  const { getString } = useStrings()
  const { onNext, currentData, setCurrentData, ...tabInfo } = useCVTabsHook<GCOMonitoringSourceInfo>({ totalTabs: 4 })
  const params = useParams<ProjectPathProps & { identifier: string }>()

  useEffect(() => {
    if (dsConfig) {
      setCurrentData(transformGetResponse(dsConfig as GCODSConfig, params))
    }
  }, [dsConfig])

  return (
    <CVOnboardingTabs
      iconName="service-stackdriver"
      defaultEntityName={currentData?.name || DefaultValue.name}
      setName={val => setCurrentData({ ...currentData, name: val } as GCOMonitoringSourceInfo)}
      onNext={onNext}
      {...tabInfo}
      tabProps={[
        {
          id: 1,
          title: getString('selectProduct'),
          component: (
            <SelectProduct<GCOMonitoringSourceInfo>
              stepData={currentData || buildGCOMonitoringSourceInfo(params)}
              type="GoogleCloudOperations"
              onCompleteStep={data => {
                if (currentData?.connectorRef?.value && data.connectorRef?.value !== currentData.connectorRef.value) {
                  data.selectedDashboards = []
                  data.selectedMetrics = new Map()
                }
                setCurrentData(data)
                onNext({ data })
              }}
              productSelectValidationText={getString('cv.monitoringSources.gco.productValidationText')}
            />
          )
        },
        {
          id: 2,
          title: getString('cv.monitoringSources.gco.tabName.selectDashboards'),
          component: (
            <SelectGCODashboards
              data={currentData || buildGCOMonitoringSourceInfo(params)}
              onPrevious={tabInfo.onPrevious}
              onNext={data => {
                setCurrentData(data)
                onNext({ data })
              }}
            />
          )
        },
        {
          id: 3,
          title: getString('cv.monitoringSources.mapMetricsToServices'),
          component: (
            <MapGCOMetricsToServices
              data={currentData || buildGCOMonitoringSourceInfo(params)}
              onPrevious={tabInfo.onPrevious}
              onNext={data => {
                setCurrentData(data)
                onNext({ data })
              }}
            />
          )
        },
        {
          id: 4,
          title: getString('review'),
          component: (
            <ReviewGCOMonitoringSource
              data={currentData || buildGCOMonitoringSourceInfo(params)}
              onPrevious={tabInfo.onPrevious}
              onSubmit={data => {
                setCurrentData(data)
                onNext({ data })
              }}
            />
          )
        }
      ]}
    />
  )
}
