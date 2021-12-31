import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Card, Container, Layout, Tab, Tabs } from '@wings-software/uicore'
import { Page } from '@common/exports'
import { ActiveServiceInstances } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstances'
import {
  startOfDay,
  TimeRangeSelector,
  TimeRangeSelectorProps
} from '@common/components/TimeRangeSelector/TimeRangeSelector'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
import { useStrings } from 'framework/strings'
import { DeploymentsTimeRangeContext } from '@cd/components/Services/common'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import type { ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { InstanceCountHistory } from '@cd/components/ServiceDetails/InstanceCountHistory/InstanceCountHistory'
import { PipelineExecutions } from '@cd/components/ServiceDetails/PipelineExecutions/PipelineExecutions'
import css from '@cd/components/ServiceDetails/ServiceDetailsContent/ServicesDetailsContent.module.scss'

const selectedTab = 'ServiceDetailsSummaryTab'
const refrencedByTab = 'ServiceRefrencedByTab'

const ServiceDetailsSummary: React.FC = () => {
  const { serviceId } = useParams<ServicePathProps>()
  const { getString } = useStrings()

  const [timeRange, setTimeRange] = useState<TimeRangeSelectorProps>({
    range: [startOfDay(moment().subtract(1, 'month').add(1, 'day')), startOfDay(moment())],
    label: getString('common.duration.month')
  })
  return (
    <Page.Body>
      <Container flex className={css.timeRangeContainer}>
        <TimeRangeSelector timeRange={timeRange?.range} setTimeRange={setTimeRange} />
      </Container>
      <Layout.Horizontal margin={{ top: 'large', bottom: 'large' }}>
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
            <PipelineExecutions />
          </Layout.Vertical>
        </DeploymentsTimeRangeContext.Provider>
      </Layout.Horizontal>
    </Page.Body>
  )
}

export const ServiceDetailsContent: React.FC = () => {
  const { serviceId } = useParams<ServicePathProps>()
  const { getString } = useStrings()

  return (
    <Container padding={{ left: 'xlarge', right: 'xlarge' }} className={css.tabsContainer}>
      <Tabs id="serviceDetailsTab" defaultSelectedTabId={selectedTab}>
        <Tab id={selectedTab} title={getString('summary')} panel={<ServiceDetailsSummary />} />
        <Tab
          id={refrencedByTab}
          title={getString('refrencedBy')}
          panel={<EntitySetupUsage entityType={'Service'} entityIdentifier={serviceId} />}
        />
      </Tabs>
    </Container>
  )
}
