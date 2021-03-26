import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { MonitoringSourceSetupRoutePaths } from '@cv/utils/routeUtils'
import { DSConfig, useGetDSConfig } from 'services/cv'
import { Page } from '@common/exports'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import AppDMonitoringSource from './app-dynamics/AppDMonitoringSource'
import { NewRelicMonitoringSource } from './new-relic/NewRelicMonitoringSource'
import { GoogleCloudOperationsMonitoringSource } from './google-cloud-operations/GoogleCloudOperationsMonitoringSource'
import { OnBoardingPageHeader } from '../onboarding/OnBoardingPageHeader/OnBoardingPageHeader'
import i18n from './MonitoringSource.i18n'
import css from './MonitoringSource.module.scss'

const getContentByType = (type: string, dsConfig?: DSConfig | null): JSX.Element => {
  switch (type) {
    case MonitoringSourceSetupRoutePaths.APP_DYNAMICS:
      return <AppDMonitoringSource dsConfig={dsConfig} />
    case MonitoringSourceSetupRoutePaths.GOOGLE_CLOUD_OPERATIONS:
      return <GoogleCloudOperationsMonitoringSource dsConfig={dsConfig} />
    case MonitoringSourceSetupRoutePaths.NEW_RELIC:
      return <NewRelicMonitoringSource dsConfig={dsConfig} />
    default:
      return <></>
  }
}

const MonitoringSource = (): JSX.Element => {
  const { monitoringSource, projectIdentifier, orgIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { monitoringSource: string; identifier: string }
  >()

  const { loading, error, refetch: fetchDSConfig, data: dsConfig } = useGetDSConfig({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

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
            label: i18n.breadCrumb,
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
