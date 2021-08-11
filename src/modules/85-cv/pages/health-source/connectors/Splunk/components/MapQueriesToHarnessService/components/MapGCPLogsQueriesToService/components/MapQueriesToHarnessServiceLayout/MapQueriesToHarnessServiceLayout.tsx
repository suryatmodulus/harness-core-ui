import { Accordion, FormInput, Layout, Utils } from '@wings-software/uicore'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapGCPLogsToServiceFieldNames } from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/constants'
import { useGetSplunkSampleData, useGetSplunkSavedSearches } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { QueryViewer } from '@cv/components/QueryViewer/QueryViewer'
import Card from '@cv/components/Card/Card'
import { MapGCPLogsQueriesToService } from '../../MapGCPLogsQueriesToService'
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

  const { data: savedQuery } = useGetSplunkSavedSearches({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      connectorIdentifier,
      requestGuid: queryParams?.tracingId
    }
  })
  const { data: splunkData, loading, refetch, error } = useGetSplunkSampleData({ lazy: true })

  const fetchStackDriverRecords = useCallback(async () => {
    // const recordsData = await queryStackdriver({ query }, { queryParams: { ...queryParams } })
    refetch({
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
    onChange(MapGCPLogsToServiceFieldNames.MESSAGE_IDENTIFIER, '')
    onChange(MapGCPLogsToServiceFieldNames.SERVICE_INSTANCE, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card>
      <>
        <FormInput.Select
          name={'savedSearchQuery'}
          style={{ width: '507px', marginLeft: '47%' }}
          items={
            savedQuery?.resource?.map(item => ({
              label: item.title as string,
              value: item.searchQuery as string
            })) || []
          }
          onChange={item => {
            onChange(MapGCPLogsToServiceFieldNames.QUERY, item.value as string)
          }}
        />
        <Layout.Horizontal>
          <Accordion activeId="metricToService" className={css.accordian}>
            <Accordion.Panel
              id="metricToService"
              summary={getString('cv.monitoringSources.mapQueriesToServices')}
              details={
                <MapGCPLogsQueriesToService
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
            fetchRecords={fetchStackDriverRecords}
            postFetchingRecords={postFetchingRecords}
            loading={loading}
            error={error}
            query={query}
          />
        </Layout.Horizontal>
      </>
    </Card>
  )
}
