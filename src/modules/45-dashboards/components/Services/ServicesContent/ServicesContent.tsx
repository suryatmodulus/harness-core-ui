import React from 'react'
import { Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { useServiceStore, Views, MOCK_DATA } from '../common'
import { ServiceInstancesWidget } from '../ServiceInstancesWidget/ServiceInstancesWidget'

export const ServicesContent: React.FC = () => {
  const { view } = useServiceStore()
  return (
    <Page.Body>
      <Layout.Vertical margin={{ left: 'xxxlarge', right: 'xxxlarge', top: 'large', bottom: 'large' }}>
        {view === Views.INSIGHT && (
          <Layout.Horizontal>
            <ServiceInstancesWidget {...MOCK_DATA.ServiceInstancesWidget} />
          </Layout.Horizontal>
        )}
      </Layout.Vertical>
    </Page.Body>
  )
}
