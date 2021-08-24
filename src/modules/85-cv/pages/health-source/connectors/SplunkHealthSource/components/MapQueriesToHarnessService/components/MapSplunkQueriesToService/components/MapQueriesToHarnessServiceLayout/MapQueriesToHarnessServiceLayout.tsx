import { Accordion, FormInput, Layout, Utils } from '@wings-software/uicore'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapSplunkToServiceFieldNames } from '@cv/pages/health-source/connectors/SplunkHealthSource/components/MapQueriesToHarnessService/constants'
import { useGetSplunkSampleData, useGetSplunkSavedSearches } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { QueryViewer } from '@cv/components/QueryViewer/QueryViewer'
import Card from '@cv/components/Card/Card'
import { SplunkMetricNameAndHostIdentifier } from '../../SplunkMetricNameAndHostIdentifier'
import type { MapQueriesToHarnessServiceLayoutProps } from './types'
import css from './MapQueriesToHarnessServiceLayout.module.scss'

export default function MapQueriesToHarnessServiceLayout(props: MapQueriesToHarnessServiceLayoutProps): JSX.Element {
  const { formikProps, connectorIdentifier, onChange } = props
  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const values = formikProps?.values

  const query = useMemo(() => (values?.query?.length ? values.query : ''), [values])
  const queryParams = useMemo(
    () => ({
      accountId,
      projectIdentifier,
      orgIdentifier,
      tracingId: Utils.randomId(),
      connectorIdentifier: connectorIdentifier as string
    }),
    [accountId, projectIdentifier, orgIdentifier, connectorIdentifier]
  )

  const { data: savedQuery, loading: loadingSavedQuery } = useGetSplunkSavedSearches({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      connectorIdentifier,
      requestGuid: queryParams?.tracingId
    }
  })
  const { data: splunkData, loading, refetch, error } = useGetSplunkSampleData({ lazy: true })

  const fetchSplunkRecords = useCallback(async () => {
    await refetch({
      queryParams: {
        accountId,
        orgIdentifier,
        projectIdentifier,
        connectorIdentifier,
        requestGuid: queryParams?.tracingId,
        query
      }
    })
    setIsQueryExecuted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const postFetchingRecords = useCallback(() => {
    // resetting values of service and message indentifier once fetch records button is clicked.
    onChange(MapSplunkToServiceFieldNames.SERVICE_INSTANCE, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const savedSearchQueryOption = useMemo(
    () =>
      loadingSavedQuery
        ? [{ label: getString('loading'), value: getString('loading') }]
        : savedQuery?.resource?.map(item => ({
            label: item.title as string,
            value: item.searchQuery as string
          })) || [],
    [loadingSavedQuery]
  )

  return (
    <Card>
      <>
        <FormInput.Select
          name={'savedSearchQuery'}
          placeholder={
            loadingSavedQuery ? getString('loading') : getString('cv.monitoringSources.splunk.savedSearchQuery')
          }
          value={savedSearchQueryOption?.find(item => item.value === query)}
          className={css.savedSearchQuery}
          items={savedSearchQueryOption}
          onChange={item => {
            onChange(MapSplunkToServiceFieldNames.QUERY, item.value as string)
            onChange(MapSplunkToServiceFieldNames.SERVICE_INSTANCE, '')
            onChange(MapSplunkToServiceFieldNames.RECORD_COUNT, '0')
            setIsQueryExecuted(false)
          }}
        />
        <Layout.Horizontal>
          <Accordion activeId="metricToService" className={css.accordian}>
            <Accordion.Panel
              id="metricToService"
              summary={getString('cv.monitoringSources.mapQueriesToServices')}
              details={
                <SplunkMetricNameAndHostIdentifier
                  sampleRecord={splunkData?.resource?.[0] || null}
                  isQueryExecuted={isQueryExecuted}
                  onChange={onChange}
                  loading={loading}
                />
              }
            />
          </Accordion>
          <QueryViewer
            isQueryExecuted={isQueryExecuted}
            className={css.validationContainer}
            records={splunkData?.resource}
            fetchRecords={fetchSplunkRecords}
            postFetchingRecords={postFetchingRecords}
            loading={loading}
            error={error}
            query={query}
            queryNotExecutedMessage={getString('cv.monitoringSources.splunk.submitQueryToSeeRecords')}
          />
        </Layout.Horizontal>
      </>
    </Card>
  )
}
