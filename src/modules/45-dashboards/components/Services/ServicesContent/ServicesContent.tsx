import React, { useState } from 'react'

import { Card, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { DeploymentsTimeRangeContext, useServiceStore, Views } from '@dashboards/components/Services/common'
import { ServiceInstancesWidget } from '@dashboards/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import { MostActiveServicesWidget } from '@dashboards/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
import {
  ServiceInstancesWidgetMock,
  MostActiveServicesWidgetMock,
  DeploymentsWidgetMock,
  ServiceListMock
} from '@dashboards/mock'
import { DeploymentsWidget } from '@dashboards/components/Services/DeploymentsWidget/DeploymentsWidget'
import { ServicesList } from '@dashboards/components/Services/ServicesList/ServicesList'
import { TIME_RANGE_ENUMS } from '@dashboards/components/TimeRangeSelector/TimeRangeSelector'
import css from '@dashboards/components/Services/ServicesContent/ServicesContent.module.scss'

export const ServicesContent: React.FC = () => {
  const { view } = useServiceStore()
  const [timeRange, setTimeRange] = useState<TIME_RANGE_ENUMS>(TIME_RANGE_ENUMS.SIX_MONTHS)
  return (
    <Page.Body>
      <Layout.Vertical
        margin={{ left: 'xxxlarge', right: 'xxxlarge', top: view === Views.INSIGHT ? 'large' : 0, bottom: 'large' }}
      >
        {view === Views.INSIGHT && (
          <Layout.Horizontal margin={{ bottom: 'large' }}>
            <ServiceInstancesWidget {...ServiceInstancesWidgetMock} />
            <DeploymentsTimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
              <Card className={css.card}>
                <MostActiveServicesWidget {...MostActiveServicesWidgetMock} />
                <div className={css.separator} />
                <DeploymentsWidget {...DeploymentsWidgetMock} />
              </Card>
            </DeploymentsTimeRangeContext.Provider>
          </Layout.Horizontal>
        )}
        <ServicesList {...ServiceListMock} />
      </Layout.Vertical>
    </Page.Body>
  )
}
