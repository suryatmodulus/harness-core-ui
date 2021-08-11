import React, { useCallback, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { omit } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { MapQueriesToHarnessService } from './components/MapQueriesToHarnessService/MapQueriesToHarnessService'
import { buildGCOMonitoringSourceInfo, GCOMonitoringSourceInfo } from './GoogleCloudOperationsMonitoringSourceUtils'
import { createGCOLogsHealthSourcePayload } from './GCOLogsMonitoringSource.utils'

interface GCOLogsMonitoringSourceProps {
  data: any
  onSubmit: (formdata: GCOMonitoringSourceInfo, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export default function GCOLogsMonitoringSource(props: GCOLogsMonitoringSourceProps): JSX.Element {
  const { data: sourceData, onSubmit } = props
  const allParams = useParams<ProjectPathProps & { identifier: string }>()
  const { onPrevious } = useContext(SetupSourceTabsContext)
  const requiredParams = omit(allParams, 'identifier')

  const handleOnSubmit = useCallback(
    async (gcoLogsFormData: GCOMonitoringSourceInfo) => {
      const gcoLogsHealthSourcePayload = createGCOLogsHealthSourcePayload(gcoLogsFormData)
      await onSubmit(sourceData, gcoLogsHealthSourcePayload)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceData]
  )

  return (
    <MapQueriesToHarnessService
      data={buildGCOMonitoringSourceInfo(requiredParams, sourceData)}
      onSubmit={handleOnSubmit}
      onPrevious={() => onPrevious(sourceData)}
    />
  )
}
