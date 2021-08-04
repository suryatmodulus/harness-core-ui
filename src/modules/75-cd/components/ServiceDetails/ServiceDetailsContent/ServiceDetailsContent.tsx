import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Card, Layout } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { ActiveServiceInstances } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances'
import { startOfDay, TimeRangeSelectorProps } from '@cd/components/TimeRangeSelector/TimeRangeSelector'
import { useStrings } from 'framework/strings'
import { DeploymentsTimeRangeContext } from '@cd/components/Services/common'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import type { ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { InstanceCountHistory } from '@cd/components/ServiceDetails/InstanceCountHistory/InstanceCountHistory'
import css from '@cd/components/ServiceDetails/ServiceDetailsContent/ServicesDetailsContent.module.scss'

export const ServiceDetailsContent: React.FC = () => {
  const { getString } = useStrings()
  const { serviceId } = useParams<ServicePathProps>()
  const [timeRange, setTimeRange] = useState<TimeRangeSelectorProps>({
    range: [startOfDay(moment().subtract(6, 'month')), startOfDay(moment())],
    label: getString('cd.serviceDashboard.6months')
  })
  return (
    <Page.Body>
      <Layout.Horizontal margin={{ left: 'xlarge', right: 'xlarge', top: 'large', bottom: 'large' }}>
        <DeploymentsTimeRangeContext.Provider value={{ timeRange, setTimeRange }}>
          <Layout.Vertical margin={{ right: 'xlarge' }}>
            <Layout.Horizontal margin={{ bottom: 'medium' }}>
              <ActiveServiceInstances />
            </Layout.Horizontal>
            <InstanceCountHistory />
          </Layout.Vertical>
          <Layout.Vertical className={css.fullWidth}>
            <Card className={css.card}>
              <DeploymentsWidget serviceIdentifier={serviceId} />
            </Card>
          </Layout.Vertical>
        </DeploymentsTimeRangeContext.Provider>
      </Layout.Horizontal>
    </Page.Body>
  )
}

export default ServiceDetailsContent
