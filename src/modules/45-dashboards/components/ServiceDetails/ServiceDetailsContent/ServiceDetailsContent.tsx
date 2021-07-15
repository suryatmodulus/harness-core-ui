import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Card, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { ActiveServiceInstances } from '@dashboards/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances'
import { startOfDay, TimeRangeSelectorProps } from '@dashboards/components/TimeRangeSelector/TimeRangeSelector'
import { useStrings } from 'framework/strings'
import { DeploymentsTimeRangeContext } from '@dashboards/components/Services/common'
import { DeploymentsWidget } from '@dashboards/components/Services/DeploymentsWidget/DeploymentsWidget'
import type { ServicePathProps } from '@common/interfaces/RouteInterfaces'
import css from '@dashboards/components/ServiceDetails/ServiceDetailsContent/ServicesDetailsContent.module.scss'

export const ServiceDetailsContent: React.FC = () => {
  const { getString } = useStrings()
  const { serviceId } = useParams<ServicePathProps>()
  const [timeRange, setTimeRange] = useState<TimeRangeSelectorProps>({
    range: [startOfDay(moment().subtract(6, 'month')), startOfDay(moment())],
    label: getString('dashboards.serviceDashboard.6months')
  })
  return (
    <Page.Body>
      <Layout.Horizontal margin={{ left: 'xlarge', right: 'xlarge', top: 'large', bottom: 'large' }}>
        <Layout.Vertical margin={{ right: 'xlarge' }}>
          <ActiveServiceInstances />
        </Layout.Vertical>
        <Layout.Vertical className={css.fullWidth}>
          <DeploymentsTimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
            <Card className={css.card}>
              <DeploymentsWidget serviceIdentifier={serviceId} />
            </Card>
          </DeploymentsTimeRangeContext.Provider>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Page.Body>
  )
}

export default ServiceDetailsContent
