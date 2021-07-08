import { Accordion, Container, Layout, Utils } from '@wings-software/uicore'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGetStackdriverLogSampleData } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetHarnessServices,
  useGetHarnessEnvironments
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import { MapGCPLogsToServiceFieldNames } from '@cv/pages/monitoring-source/google-cloud-operations/MapQueriesToHarnessService/constants'
import { QueryViewer } from '@cv/components/QueryViewer/QueryViewer'
import { MapGCPLogsQueriesToService } from '../../MapGCPLogsQueriesToService'
import type { MapQueriesToHarnessServiceLayoutProps } from './types'
import css from './MapQueriesToHarnessServiceLayout.module.scss'

export default function MapQueriesToHarnessServiceLayout(props: MapQueriesToHarnessServiceLayoutProps): JSX.Element {
  const { formikProps, connectorIdentifier, onChange } = props
  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [isQueryExecuted, setIsQueryExecuted] = useState(false)

  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const { serviceOptions, setServiceOptions } = useGetHarnessServices()
  const { environmentOptions, setEnvironmentOptions } = useGetHarnessEnvironments()
  const values = formikProps?.values

  const query = useMemo(() => (values?.query?.length ? values.query : ''), [values])
  const sampleRecord = useMemo(() => (records?.length ? records[0] : null), [records])
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

  const {
    mutate: queryStackdriver,
    loading,
    error
  } = useGetStackdriverLogSampleData({
    queryParams
  })

  const fetchStackDriverRecords = useCallback(async () => {
    const recordsData = await queryStackdriver(
      { query },
      { queryParams: { ...queryParams, tracingId: Utils.randomId() } }
    )
    setRecords(recordsData?.data as Record<string, any>[])
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
    <Container className={css.main}>
      <Layout.Horizontal className={css.content} spacing="xlarge">
        <Accordion activeId="metricToService" className={css.accordian}>
          <Accordion.Panel
            id="metricToService"
            summary={getString('cv.monitoringSources.mapQueriesToServices')}
            details={
              <MapGCPLogsQueriesToService
                sampleRecord={sampleRecord}
                isQueryExecuted={isQueryExecuted}
                onChange={onChange}
                serviceValue={formikProps.values?.serviceIdentifier}
                environmentValue={formikProps.values?.envIdentifier}
                serviceOptions={serviceOptions}
                setServiceOptions={setServiceOptions}
                environmentOptions={environmentOptions}
                setEnvironmentOptions={setEnvironmentOptions}
                loading={loading}
              />
            }
          />
        </Accordion>
        <QueryViewer
          isQueryExecuted={isQueryExecuted}
          className={css.validationContainer}
          records={records}
          fetchRecords={fetchStackDriverRecords}
          postFetchingRecords={postFetchingRecords}
          loading={loading}
          error={error}
          query={query}
        />
      </Layout.Horizontal>
    </Container>
  )
}
