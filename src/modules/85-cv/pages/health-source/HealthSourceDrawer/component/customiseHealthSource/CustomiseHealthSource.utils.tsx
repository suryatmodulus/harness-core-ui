import React from 'react'
import { isEmpty } from 'lodash-es'
import { GCOProduct } from '@cv/pages/monitoring-source/google-cloud-operations/GoogleCloudOperationsMonitoringSourceUtils'
import GCOLogsMonitoringSource from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/GCOLogsMonitoringSource'
import AppDMonitoredSource from '@cv/pages/health-source/connectors/AppDynamics/AppDMonitoredSource'
import { PrometheusHealthSource } from '@cv/pages/health-source/connectors/PrometheusHealthSource/PrometheusHealthSource'
import NewrelicMonitoredSourceContainer from '@cv/pages/health-source/connectors/NewRelic/NewRelicHealthSourceContainer'
import { Connectors } from '@connectors/constants'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { UpdatedHealthSource } from '../../HealthSourceDrawerContent.types'

export const LoadSourceByType = ({
  type,
  data,
  onSubmit
}: {
  type: string
  data: any
  onSubmit: (formdata: any, healthSourceList: UpdatedHealthSource) => Promise<void>
}): JSX.Element => {
  switch (type) {
    case HealthSourceTypes.AppDynamics:
      return <AppDMonitoredSource data={data} onSubmit={onSubmit} />
    case Connectors.GCP:
      if (data?.product?.value === GCOProduct.CLOUD_LOGS) {
        return <GCOLogsMonitoringSource data={data} onSubmit={onSubmit} />
      } else {
        return <></>
      }
    case HealthSourceTypes.StackdriverLog:
      return <GCOLogsMonitoringSource data={data} onSubmit={onSubmit} />
    case HealthSourceTypes.Prometheus:
      return <PrometheusHealthSource data={data} onSubmit={onSubmit} />
    case Connectors.NEW_RELIC:
      return <NewrelicMonitoredSourceContainer data={data} onSubmit={onSubmit} />
    default:
      return <></>
  }
}

export const createHealthsourceList = (formData: any, healthSourcesPayload: UpdatedHealthSource): any => {
  const healthSources = formData?.healthSourceList
  let updatedHealthSources = []
  if (
    healthSources &&
    !isEmpty(healthSources) &&
    healthSources.some(
      (el: any) => el?.identifier === healthSourcesPayload?.identifier && el?.type === healthSourcesPayload?.type
    )
  ) {
    updatedHealthSources = healthSources?.map((el: any) =>
      el?.identifier === healthSourcesPayload?.identifier ? healthSourcesPayload : el
    )
  } else if (healthSources && !isEmpty(healthSources)) {
    updatedHealthSources = [...healthSources, healthSourcesPayload]
  } else {
    updatedHealthSources = [healthSourcesPayload]
  }
  return updatedHealthSources
}
