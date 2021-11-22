import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { TabId } from '@blueprintjs/core'
import { Container, Tabs, PageError, Page, FlexExpander } from '@wings-software/uicore'
import { useQueryParams } from '@common/hooks'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetMonitoredService } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import DetailsBreadcrumb from '@cv/pages/monitored-service/views/DetailsBreadcrumb'
import DetailsHeaderTitle from '@cv/pages/monitored-service/views/DetailsHeaderTitle'
import DetailsToolbar from '@cv/pages/monitored-service/views/DetailsToolbar'
import Configurations from './components/Configurations/Configurations'
import { MonitoredServiceEnum } from './MonitoredServicePage.constants'
import ServiceHealth from './components/ServiceHealth/ServiceHealth'
import HealthScoreCard from './components/ServiceHealth/components/HealthScoreCard/HealthScoreCard'
import CVSLOsListingPage from '../slos/CVSLOsListingPage'
import css from './MonitoredServicePage.module.scss'

const ServiceHealthAndConfiguration: React.FC = () => {
  const { getString } = useStrings()
  const { tab } = useQueryParams<{ tab?: MonitoredServiceEnum.Configurations }>()
  const { orgIdentifier, projectIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const [selectedTabId, setSelectedTabId] = useState<TabId>(
    tab === MonitoredServiceEnum.Configurations
      ? MonitoredServiceEnum.Configurations
      : MonitoredServiceEnum.ServiceHealth
  )

  const {
    data: monitoredServiceData,
    refetch,
    loading,
    error
  } = useGetMonitoredService({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { monitoredService, lastModifiedAt } = monitoredServiceData?.data ?? {}

  if (error) {
    return <PageError message={getErrorMessage(error)} onClick={() => refetch()} />
  }

  if (!loading && !monitoredService) {
    return <Page.NoDataCard message={getString('noData')} />
  }

  const panelServiceHealth = (
    <Page.Body
      loading={loading}
      noData={{
        when: () => !monitoredService
      }}
      className={css.pageBody}
    >
      <ServiceHealth
        hasChangeSource={!!monitoredService?.sources?.changeSources?.length}
        monitoredServiceIdentifier={monitoredService?.identifier}
        serviceIdentifier={monitoredService?.serviceRef as string}
        environmentIdentifier={monitoredService?.environmentRef as string}
      />
    </Page.Body>
  )

  const panelSLO = (
    <Page.Body
      loading={loading}
      noData={{
        when: () => !monitoredService
      }}
      className={css.pageBody}
    >
      <CVSLOsListingPage monitoredServiceIdentifier={identifier} />
    </Page.Body>
  )

  const panelConfigurations = (
    <Page.Body
      loading={loading}
      noData={{
        when: () => !monitoredService
      }}
      className={css.pageBody}
    >
      <Configurations />
    </Page.Body>
  )

  return (
    <>
      <Page.Header
        size="large"
        breadcrumbs={<DetailsBreadcrumb />}
        title={<DetailsHeaderTitle loading={loading} monitoredService={monitoredService} />}
        toolbar={
          <DetailsToolbar loading={loading} monitoredService={monitoredService} lastModifiedAt={lastModifiedAt} />
        }
        className={css.header}
      />
      <Container className={css.monitoredServiceTabs}>
        <Tabs
          id="monitoredServiceTabs"
          selectedTabId={selectedTabId}
          onChange={tabId => setSelectedTabId(tabId)}
          tabList={[
            {
              id: MonitoredServiceEnum.ServiceHealth,
              title: getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth'),
              panel: panelServiceHealth
            },
            {
              id: MonitoredServiceEnum.SLOs,
              title: getString('cv.slos.title'),
              panel: panelSLO
            },
            {
              id: MonitoredServiceEnum.Configurations,
              title: getString('cv.monitoredServices.monitoredServiceTabs.configurations'),
              panel: panelConfigurations
            }
          ]}
        >
          <FlexExpander />
          {selectedTabId === MonitoredServiceEnum.ServiceHealth && (
            <HealthScoreCard
              serviceIdentifier={monitoredService?.serviceRef}
              environmentIdentifier={monitoredService?.environmentRef}
              monitoredServiceLoading={loading}
            />
          )}
        </Tabs>
      </Container>
    </>
  )
}

const CVMonitoredServiceDetails: React.FC = () => {
  const { getString } = useStrings()
  const { identifier } = useParams<{ identifier?: string }>()

  if (identifier) {
    return <ServiceHealthAndConfiguration />
  }

  return (
    <>
      <Page.Header
        breadcrumbs={<DetailsBreadcrumb />}
        title={getString('cv.monitoredServices.addNewMonitoredServices')}
      />
      <Configurations />
    </>
  )
}

export default CVMonitoredServiceDetails
