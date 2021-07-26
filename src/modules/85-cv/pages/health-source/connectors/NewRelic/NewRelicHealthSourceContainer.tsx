import React, { useContext, useCallback } from 'react'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { HealthSoureSupportedConnectorTypes } from '../MonitoredServiceConnector.constants'
import { createPayloadByConnectorType } from '../MonitoredServiceConnector.utils'
import { createNewRelicData } from './NewRelicHealthSourceContainer.util'
import NewRelicHealthSource from './NewRelicHealthSource'

interface NewRelicHealthSource {
  data: any
  onSubmit: (formdata: any, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export default function NewrelicMonitoredSourceContainer(props: NewRelicHealthSource): JSX.Element {
  const { data: sourceData, onSubmit } = props
  const { onPrevious } = useContext(SetupSourceTabsContext)

  const handleSubmit = useCallback(
    (value: UpdatedHealthSource) => {
      const newRelicPayload = createPayloadByConnectorType(value, HealthSoureSupportedConnectorTypes.NEW_RELIC)
      newRelicPayload && onSubmit(sourceData, newRelicPayload)
    },
    [sourceData]
  )

  return (
    <>
      <NewRelicHealthSource
        data={createNewRelicData(sourceData)}
        onSubmit={handleSubmit}
        onPrevious={() => onPrevious(sourceData)}
      />
    </>
  )
}
