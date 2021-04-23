import React from 'react'
import { Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { useServiceStore, Views } from '@dashboards/components/Services/common'
import { ServiceInstancesWidget } from '@dashboards/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import { MostActiveServicesWidget } from '@dashboards/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
import {
  ServiceInstancesWidgetMock,
  MostActiveServicesWidgetMock,
  DeploymentsWidgetMock,
  ServiceListMock
} from '@dashboards/mock'
import { DeploymentsWidget } from '../DeploymentsWidget/DeploymentsWidget'
import { ServicesList } from '../ServicesList/ServicesList'

export const ServicesContent: React.FC = () => {
  const { view } = useServiceStore()
  return (
    <Page.Body>
      <Layout.Vertical
        margin={{ left: 'xxxlarge', right: 'xxxlarge', top: view === Views.INSIGHT ? 'large' : 0, bottom: 'large' }}
      >
        {view === Views.INSIGHT && (
          <Layout.Horizontal margin={{ bottom: 'large' }}>
            <ServiceInstancesWidget {...ServiceInstancesWidgetMock} />
            <MostActiveServicesWidget {...MostActiveServicesWidgetMock} />
            <DeploymentsWidget {...DeploymentsWidgetMock} />
          </Layout.Horizontal>
        )}
        <ServicesList {...ServiceListMock} />
      </Layout.Vertical>
    </Page.Body>
  )
}
