import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useCVTabsHook from '@cv/hooks/CVTabsHook/useCVTabsHook'
import { useStrings } from 'framework/strings'
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
import { MapQueriesToHarnessService } from './MapQueriesToHarnessService/MapQueriesToHarnessService'
import { ReviewGCOQueryLogs } from './ReviewGCOQueryLogs/ReviewGCOQueryLogs'
import { transformGetResponseForStackDriver, transformGetResponseForStackDriverLogs } from './utils'
import { DefaultValue } from './constants'
import type { GCOLogsDSConfig } from './MapQueriesToHarnessService/types'

export function GoogleCloudOperationsMonitoringSource({ dsConfig }: { dsConfig?: DSConfig | null }): JSX.Element {
  const { getString } = useStrings()
  const params = useParams<ProjectPathProps & { identifier: string }>()
  const [currentProduct, setCurrentProduct] = useState(GCOProduct.CLOUD_METRICS)
  const { onNext, currentData, setCurrentData, ...tabInfo } = useCVTabsHook<GCOMonitoringSourceInfo>({
    totalTabs: currentProduct === GCOProduct.CLOUD_LOGS ? 3 : 4
  })

  const selectProductComponent = {
    id: 1,
    title: getString('selectProduct'),
    component: (
      <SelectProduct<GCOMonitoringSourceInfo>
        stepData={currentData || buildGCOMonitoringSourceInfo(params, currentProduct)}
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
        updateSelectedProduct={product => setCurrentProduct(product)}
      />
    )
  }

  const selectGCODashboardsComponent = {
    id: 2,
    title: getString('cv.monitoringSources.gco.tabName.selectDashboards'),
    component: (
      <SelectGCODashboards
        data={currentData || buildGCOMonitoringSourceInfo(params, currentProduct)}
        onPrevious={tabInfo.onPrevious}
        onNext={data => {
          setCurrentData(data)
          onNext({ data })
        }}
      />
    )
  }

  const mapGCOMetricsToServicesComponent = {
    id: 3,
    title: getString('cv.monitoringSources.mapMetricsToServices'),
    component: (
      <MapGCOMetricsToServices
        data={currentData || buildGCOMonitoringSourceInfo(params, currentProduct)}
        onPrevious={tabInfo.onPrevious}
        onNext={data => {
          setCurrentData(data)
          onNext({ data })
        }}
      />
    )
  }

  const reviewComponent = {
    id: 4,
    title: getString('review'),
    component: (
      <ReviewGCOMonitoringSource
        data={currentData || buildGCOMonitoringSourceInfo(params, currentProduct)}
        onPrevious={tabInfo.onPrevious}
        onSubmit={data => {
          setCurrentData(data)
          onNext({ data })
        }}
      />
    )
  }

  const mapGCOQueriesToServicesComponent = {
    id: 2,
    title: getString('cv.monitoringSources.mapQueriesToServices'),
    component: (
      <MapQueriesToHarnessService
        data={currentData || buildGCOMonitoringSourceInfo(params, currentProduct)}
        onPrevious={tabInfo.onPrevious}
        onNext={data => {
          setCurrentData(data)
          onNext({ data })
        }}
      />
    )
  }

  const gcoQueryLogsReviewComponent = {
    id: 3,
    title: getString('review'),
    component: (
      <ReviewGCOQueryLogs
        data={currentData || buildGCOMonitoringSourceInfo(params, currentProduct)}
        onPrevious={tabInfo.onPrevious}
        onSubmit={data => {
          setCurrentData(data as any)
          onNext({ data } as any)
        }}
      />
    )
  }

  useEffect(() => {
    if (dsConfig) {
      switch (dsConfig.type) {
        case 'STACKDRIVER':
          setCurrentData(transformGetResponseForStackDriver(dsConfig as GCODSConfig, params))
          setCurrentProduct(GCOProduct.CLOUD_METRICS)
          break
        case 'STACKDRIVER_LOG':
          setCurrentData(transformGetResponseForStackDriverLogs(dsConfig as GCOLogsDSConfig, params))
          setCurrentProduct(GCOProduct.CLOUD_LOGS)
          break
        default:
          break
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dsConfig])

  return (
    <CVOnboardingTabs
      iconName="service-stackdriver"
      defaultEntityName={currentData?.name || DefaultValue.name}
      setName={val => setCurrentData({ ...currentData, name: val } as GCOMonitoringSourceInfo)}
      onNext={onNext}
      {...tabInfo}
      tabProps={
        currentProduct === GCOProduct.CLOUD_LOGS
          ? [selectProductComponent, mapGCOQueriesToServicesComponent, gcoQueryLogsReviewComponent]
          : [selectProductComponent, selectGCODashboardsComponent, mapGCOMetricsToServicesComponent, reviewComponent]
      }
    />
  )
}
