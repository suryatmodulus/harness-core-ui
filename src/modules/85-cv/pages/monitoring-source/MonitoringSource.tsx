import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MonitoringSourceSetupRoutePaths } from '@cv/utils/routeUtils'
import { DSConfig, useGetDSConfig } from 'services/cv'
import { Page } from '@common/exports'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import AppDMonitoringSource from './app-dynamics/AppDMonitoringSource'
import { NewRelicMonitoringSource } from './new-relic/NewRelicMonitoringSource'
import { GoogleCloudOperationsMonitoringSource } from './google-cloud-operations/GoogleCloudOperationsMonitoringSource'
import { PrometheusMonitoringSource } from './prometheus/PrometheusMonitoringSource'
import { OnBoardingPageHeader } from '../onboarding/OnBoardingPageHeader/OnBoardingPageHeader'
import css from './MonitoringSource.module.scss'

const getContentByType = (type: string, dsConfig?: DSConfig | null): JSX.Element => {
  switch (type) {
    case MonitoringSourceSetupRoutePaths.APP_DYNAMICS:
      return <AppDMonitoringSource dsConfig={dsConfig} />
    case MonitoringSourceSetupRoutePaths.GOOGLE_CLOUD_OPERATIONS:
      return <GoogleCloudOperationsMonitoringSource dsConfig={dsConfig} />
    case MonitoringSourceSetupRoutePaths.NEW_RELIC:
      return <NewRelicMonitoringSource dsConfig={dsConfig} />
    case MonitoringSourceSetupRoutePaths.PROMETHEUS:
      return <PrometheusMonitoringSource dsConfig={dsConfig} />
    default:
      return <></>
  }
}

const MonitoringSource = (): JSX.Element => {
  const { monitoringSource, projectIdentifier, orgIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { monitoringSource: string; identifier: string }
  >()

  const {
    loading,
    error,
    refetch: fetchDSConfig,
    data: dsConfig
  } = useGetDSConfig({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })
  const { getString } = useStrings()

  useEffect(() => {
    if (identifier) fetchDSConfig()
  }, [identifier, accountId, orgIdentifier, projectIdentifier])

  return (
    <Page.Body
      loading={loading}
      key={loading.toString()}
      error={getErrorMessage(error)}
      retryOnError={() => fetchDSConfig()}
      className={css.pageDimensions}
    >
      <OnBoardingPageHeader
        breadCrumbs={[
          {
            label: getString('cv.navLinks.adminSideNavLinks.monitoringSources'),
            url: routes.toCVAdminSetupMonitoringSource({
              projectIdentifier,
              orgIdentifier,
              monitoringSource,
              accountId
            })
          }
        ]}
      />
      <Container className={css.pageBody}>{getContentByType(monitoringSource, dsConfig?.resource)}</Container>
    </Page.Body>
  )
}

export default MonitoringSource
