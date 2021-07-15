import React from 'react'
import { isEmpty } from 'lodash-es'
import { GCOProduct } from '@cv/pages/monitoring-source/google-cloud-operations/GoogleCloudOperationsMonitoringSourceUtils'
import GCOLogsMonitoringSource from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/GCOLogsMonitoringSource'
import AppDMonitoredSource from '@cv/pages/health-source/connectors/AppDynamics/AppDMonitoredSource'
import { Connectors } from '@connectors/constants'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { updatedHealthSource } from '../../HealthSourceDrawerContent'

export const LoadSourceByType = ({
  type,
  data,
  onSubmit
}: {
  type: string
  data: any
  onSubmit: (formdata: any, healthSourceList: updatedHealthSource) => Promise<void>
}): JSX.Element => {
  switch (type) {
    case 'AppDynamics':
      return <AppDMonitoredSource data={data} onSubmit={onSubmit} />
    case Connectors.GCP:
      if (data?.product?.value === GCOProduct.CLOUD_LOGS) {
        return <GCOLogsMonitoringSource data={data} onSubmit={onSubmit} />
      } else {
        return <></>
      }
    case HealthSourceTypes.StackdriverLog:
      return <GCOLogsMonitoringSource data={data} onSubmit={onSubmit} />
    default:
      return <></>
  }
}

export const createHealthsourceList = (formData: any, healthSourcesPayload: updatedHealthSource): any => {
  const healthSources = formData?.healthSourceList
  let updatedHealthSources = []
  if (
    healthSources &&
    !isEmpty(healthSources) &&
    healthSources.some((el: any) => el?.identifier === healthSourcesPayload?.identifier)
  ) {
    updatedHealthSources = healthSources?.map((el: any) =>
      el?.identifier === healthSourcesPayload?.identifier ? healthSourcesPayload : el
    )
  } else {
    updatedHealthSources = [...healthSources, healthSourcesPayload]
  }
  return updatedHealthSources
}
