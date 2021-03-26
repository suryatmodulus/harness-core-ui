import React from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import type { DSConfig } from 'services/cv'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SelectNewRelicConnector } from './SelectNewRelicConnector/SelectNewRelicConnector'
import {
  transformNewRelicDSConfigIntoNewRelicSetupSource,
  NewRelicSetupSource,
  NewRelicDSConfig
} from './NewRelicMonitoringSourceUtils'
import { MapNewRelicAppsToServicesAndEnvs } from './MapNewRelicAppsToServicesAndEnvs/MapNewRelicAppsToServicesAndEnvs'
import { ReviewNewRelicMapping } from './ReviewNewRelicMapping/ReviewNewRelicMapping'

const NewRelicTabIndex = {
  SELECT_CONNECTOR: 0,
  MAP_APPLICATIONS: 1,
  REVIEW_APPLICATIONS: 2
}

function determineMaxTab(data: NewRelicSetupSource): number {
  if (data?.mappedServicesAndEnvs?.size) {
    return NewRelicTabIndex.REVIEW_APPLICATIONS
  }

  if (data?.productName && data?.connectorRef) {
    return NewRelicTabIndex.MAP_APPLICATIONS
  }

  return NewRelicTabIndex.SELECT_CONNECTOR
}

export function NewRelicMonitoringSource({ dsConfig }: { dsConfig?: DSConfig | null }): JSX.Element {
  const { getString } = useStrings()
  const params = useParams<ProjectPathProps>()
  return (
    <SetupSourceTabs<NewRelicSetupSource>
      data={transformNewRelicDSConfigIntoNewRelicSetupSource(params, dsConfig as NewRelicDSConfig)}
      determineMaxTab={determineMaxTab}
      tabTitles={[
        getString('cv.onboarding.monitoringSources.defineMonitoringSource'),
        `${getString('mapApplications')} ${getString('and')} ${getString('environments')}`,
        getString('review')
      ]}
    >
      <SelectNewRelicConnector />
      <MapNewRelicAppsToServicesAndEnvs />
      <ReviewNewRelicMapping />
    </SetupSourceTabs>
  )
}
