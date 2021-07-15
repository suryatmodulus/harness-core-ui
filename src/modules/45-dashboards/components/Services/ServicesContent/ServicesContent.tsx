import React, { useState } from 'react'
import moment from 'moment'

import { Card, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { DeploymentsTimeRangeContext, useServiceStore, Views } from '@dashboards/components/Services/common'
import { ServiceInstancesWidget } from '@dashboards/components/Services/ServiceInstancesWidget/ServiceInstancesWidget'
import { MostActiveServicesWidget } from '@dashboards/components/Services/MostActiveServicesWidget/MostActiveServicesWidget'
import { startOfDay, TimeRangeSelectorProps } from '@dashboards/components/TimeRangeSelector/TimeRangeSelector'
import { ServiceInstancesWidgetMock, ServiceListMock } from '@dashboards/mock'
import { DeploymentsWidget } from '@dashboards/components/Services/DeploymentsWidget/DeploymentsWidget'
import { ServicesList } from '@dashboards/components/Services/ServicesList/ServicesList'
import { useStrings } from 'framework/strings'
import css from '@dashboards/components/Services/ServicesContent/ServicesContent.module.scss'

export const ServicesContent: React.FC = () => {
  const { view } = useServiceStore()
  const { getString } = useStrings()
  const [timeRange, setTimeRange] = useState<TimeRangeSelectorProps>({
    range: [startOfDay(moment().subtract(6, 'month')), startOfDay(moment())],
    label: getString('dashboards.serviceDashboard.6months')
  })
  return (
    <Page.Body>
      <Layout.Vertical
        margin={{ left: 'xlarge', right: 'xlarge', top: view === Views.INSIGHT ? 'large' : 0, bottom: 'large' }}
      >
        {view === Views.INSIGHT && (
          <Layout.Horizontal margin={{ bottom: 'large' }}>
            <ServiceInstancesWidget {...ServiceInstancesWidgetMock} />
            <DeploymentsTimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
              <Card className={css.card}>
                <MostActiveServicesWidget title={getString('dashboards.serviceDashboard.mostActiveServices')} />
                <div className={css.separator} />
                <DeploymentsWidget />
              </Card>
            </DeploymentsTimeRangeContext.Provider>
          </Layout.Horizontal>
        )}
        <ServicesList {...ServiceListMock} />
      </Layout.Vertical>
    </Page.Body>
  )
}
