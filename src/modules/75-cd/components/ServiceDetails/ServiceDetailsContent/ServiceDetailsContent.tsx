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
} from '@cd/components/TimeRangeSelector/TimeRangeSelector'
import { useStrings } from 'framework/strings'
import { DeploymentsTimeRangeContext } from '@cd/components/Services/common'
import { DeploymentsWidget } from '@cd/components/Services/DeploymentsWidget/DeploymentsWidget'
import type { ServicePathProps } from '@common/interfaces/RouteInterfaces'
import { InstanceCountHistory } from '@cd/components/ServiceDetails/InstanceCountHistory/InstanceCountHistory'
import { PipelineExecutions } from '@cd/components/ServiceDetails/PipelineExecutions/PipelineExecutions'
import css from '@cd/components/ServiceDetails/ServiceDetailsContent/ServicesDetailsContent.module.scss'

const selectedTab = 'ServiceDetailsSummaryTab'

interface ServiceDetailsSummaryProps {
  timeRange: TimeRangeSelectorProps
  setTimeRange: (timeRange: TimeRangeSelectorProps) => void
}

const ServiceDetailsSummary: React.FC<ServiceDetailsSummaryProps> = props => {
  const { serviceId } = useParams<ServicePathProps>()
  const { timeRange, setTimeRange } = props
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
            <PipelineExecutions />
          </Layout.Vertical>
        </DeploymentsTimeRangeContext.Provider>
      </Layout.Horizontal>
    </Page.Body>
  )
}

export const ServiceDetailsContent: React.FC = () => {
  const { getString } = useStrings()
  const [timeRange, setTimeRange] = useState<TimeRangeSelectorProps>({
    range: [startOfDay(moment().subtract(30, 'days')), startOfDay(moment())],
    label: getString('cd.serviceDashboard.month')
  })

  return (
    <Container padding={{ left: 'medium', right: 'medium' }} className={css.tabsContainer}>
      <Tabs id="serviceDetailsTab" defaultSelectedTabId={selectedTab}>
        <Tab
          id={selectedTab}
          title={getString('summary')}
          panel={<ServiceDetailsSummary timeRange={timeRange} setTimeRange={setTimeRange} />}
        />
        <Container flex className={css.timeRangeContainer} margin={{ right: 'medium' }}>
          <TimeRangeSelector timeRange={timeRange?.range} setTimeRange={setTimeRange} />
        </Container>
      </Tabs>
    </Container>
  )
}
