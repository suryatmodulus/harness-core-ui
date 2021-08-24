import React, { useCallback, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { omit } from 'lodash-es'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { SplunkQueryBuilder } from './components/MapQueriesToHarnessService/SplunkQueryBuilder'
import { buildSplunkHealthSourceInfo, createSplunkHealthSourcePayload } from './SplunkHealthSource.utils'
import type { SplunkHealthSourceInfo } from './SplunkHealthSource.types'

interface SplunkMonitoringSourceProps {
  data: any
  onSubmit: (formdata: SplunkHealthSourceInfo, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export default function SplunkHealthSource(props: SplunkMonitoringSourceProps): JSX.Element {
  const { data: sourceData, onSubmit } = props
  const allParams = useParams<ProjectPathProps & { identifier: string }>()
  const { onPrevious } = useContext(SetupSourceTabsContext)
  const requiredParams = omit(allParams, 'identifier')

  const handleOnSubmit = useCallback(
    async (splunkFormData: SplunkHealthSourceInfo) => {
      const splunkHealthSourcePayload = createSplunkHealthSourcePayload(splunkFormData)
      await onSubmit(sourceData, splunkHealthSourcePayload)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sourceData]
  )

  return (
    <SplunkQueryBuilder
      data={buildSplunkHealthSourceInfo(requiredParams, sourceData)}
      onSubmit={handleOnSubmit}
      onPrevious={() => onPrevious(sourceData)}
    />
  )
}
