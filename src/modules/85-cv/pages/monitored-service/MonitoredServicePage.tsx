import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import { Classes, TabId } from '@blueprintjs/core'
import {
  Container,
  Tab,
  Tabs,
  PageError,
  Views,
  Page,
  Text,
  FontVariation,
  Color,
  Layout,
  FlexExpander
} from '@wings-software/uicore'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetMonitoredService } from 'services/cv'
import { getCVMonitoringServicesSearchParam, getErrorMessage } from '@cv/utils/CommonUtils'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import Configurations from './components/Configurations/Configurations'
import { MonitoredServiceEnum } from './MonitoredServicePage.constants'
import ServiceHealth from './components/ServiceHealth/ServiceHealth'
import HealthScoreCard from './components/ServiceHealth/components/HealthScoreCard/HealthScoreCard'
import type { TitleProps, ToolbarProps } from './MonitoredServicePage.types'
import css from './MonitoredServicePage.module.scss'

const Breadcrumbs = (): JSX.Element => {
  const { getString } = useStrings()
  const { view } = useQueryParams<{ view?: Views.GRID }>()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  return (
    <NGBreadcrumbs
      links={[
        {
          url: `${routes.toCVMonitoringServices({
            orgIdentifier: orgIdentifier,
            projectIdentifier: projectIdentifier,
            accountId: accountId
          })}${getCVMonitoringServicesSearchParam({ view })}`,
          label: getString('cv.monitoredServices.title')
        }
      ]}
    />
  )
}

const Title: React.FC<TitleProps> = ({ loading, monitoredService }) => {
  const { getString } = useStrings()

  return loading ? (
    <Layout.Vertical flex spacing="small" height={45}>
      <Container height={22} width={300} className={Classes.SKELETON} />
      <Container height={15} width={300} className={Classes.SKELETON} />
    </Layout.Vertical>
  ) : (
    <Layout.Horizontal spacing="small" height={45}>
      {/* <Icon margin={{ right: 'xsmall' }} name="infrastructure" size={40}></Icon> */}
      <Container>
        <Layout.Horizontal flex spacing="small">
          <Text color={Color.GREY_800} font={{ variation: FontVariation.H5 }}>
            {monitoredService?.name}
          </Text>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL_SEMI }}>
            {getString('idLabel', { id: monitoredService?.identifier })}
          </Text>
        </Layout.Horizontal>
        <Text color={Color.GREY_700} font={{ variation: FontVariation.BODY }}>
          {monitoredService?.description}
        </Text>
      </Container>
    </Layout.Horizontal>
  )
}

const Toolbar: React.FC<ToolbarProps> = ({ loading, monitoredService, lastModifiedAt }) => {
  const { getString } = useStrings()

  return loading ? (
    <Layout.Vertical spacing="xsmall">
      <Container height={15} width={220} className={Classes.SKELETON} />
      <Container height={15} width={220} className={Classes.SKELETON} />
      <Container height={15} width={220} className={Classes.SKELETON} />
    </Layout.Vertical>
  ) : (
    <Layout.Vertical spacing="xsmall">
      <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }}>
        {`${getString('lastUpdated')}: ${moment(lastModifiedAt).format('lll')}`}
      </Text>
      <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }}>
        {`${getString('environment')}: ${monitoredService?.environmentRef}`}
      </Text>
      <Text color={Color.BLACK} font={{ variation: FontVariation.SMALL_SEMI }}>
        {`${getString('typeLabel')}: ${monitoredService?.type}`}
      </Text>
    </Layout.Vertical>
  )
}

const MonitoredServiceHealthAndConfiguration: React.FC = () => {
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
    pathParams: {
      identifier
    },
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

  const PageBodyWrapper: React.FC = ({ children }) => {
    return (
      <Page.Body
        loading={loading}
        noData={{
          when: () => !monitoredService
        }}
        className={css.pageBody}
      >
        {children}
      </Page.Body>
    )
  }

  return (
    <>
      <Page.Header
        size="large"
        breadcrumbs={<Breadcrumbs />}
        title={<Title loading={loading} monitoredService={monitoredService} />}
        toolbar={<Toolbar loading={loading} monitoredService={monitoredService} lastModifiedAt={lastModifiedAt} />}
        className={css.header}
      />
      <Container className={css.monitoredServiceTabs}>
        <Tabs id="monitoredServiceTabs" selectedTabId={selectedTabId} onChange={tabId => setSelectedTabId(tabId)}>
          <Tab
            id={MonitoredServiceEnum.ServiceHealth}
            title={getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
            panel={
              <PageBodyWrapper>
                <ServiceHealth
                  hasChangeSource={!!monitoredService?.sources?.changeSources?.length}
                  monitoredServiceIdentifier={monitoredService?.identifier}
                  serviceIdentifier={monitoredService?.serviceRef as string}
                  environmentIdentifier={monitoredService?.environmentRef as string}
                />
              </PageBodyWrapper>
            }
          />
          <Tab id={MonitoredServiceEnum.SLOs} title={getString('cv.slos.title')} disabled />
          <Tab
            id={MonitoredServiceEnum.Configurations}
            title={getString('cv.monitoredServices.monitoredServiceTabs.configurations')}
            panel={
              <PageBodyWrapper>
                <Configurations />
              </PageBodyWrapper>
            }
          />
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

const MonitoredServicePage: React.FC = () => {
  const { getString } = useStrings()
  const { identifier } = useParams<{ identifier?: string }>()

  if (!identifier) {
    return (
      <>
        <Page.Header breadcrumbs={<Breadcrumbs />} title={getString('cv.monitoredServices.addNewMonitoredServices')} />
        <Configurations />
      </>
    )
  }

  return <MonitoredServiceHealthAndConfiguration />
}

export default MonitoredServicePage
