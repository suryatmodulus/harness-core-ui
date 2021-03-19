import React from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectNewRelicConnector } from './SelectNewRelicConnector/SelectNewRelicConnector'
import { buildDefaultNewRelicMonitoringSource } from './NewRelicMonitoringSourceUtils'

export function NewRelicMonitoringSource(): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  return (
    <SetupSourceTabs
      data={buildDefaultNewRelicMonitoringSource({ projectIdentifier, orgIdentifier, accountId })}
      tabTitles={[getString('cv.onboarding.monitoringSources.defineMonitoringSource')]}
      determineMaxTab={() => 1}
    >
      <SelectNewRelicConnector />
    </SetupSourceTabs>
  )
}
