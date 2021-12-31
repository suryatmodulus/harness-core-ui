import React, { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, FormInput, Layout, Text, FontVariation, Utils, Icon } from '@wings-software/uicore'
import { QueryViewer } from '@cv/components/QueryViewer/QueryViewer'
import { Records } from '@cv/components/Records/Records'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { HealthSourceQueryType } from '@cv/pages/health-source/common/HealthSourceQueryType/HealthSourceQueryType'
import Button from '@rbac/components/Button/Button'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { HTTPRequestMethodOption } from '@connectors/components/CreateConnector/CustomHealthConnector/components/CustomHealthValidationPath/components/HTTPRequestMethod/HTTPRequestMethod'
import { useFetchSampleData } from 'services/cv'
import { useGetConnector } from 'services/cd-ng'
import type { QueryMappingInterface } from './QueryMapping.types'
import { CustomHealthSourceFieldNames } from '../../CustomHealthSource.constants'
import { timeFormatOptions } from './QueryMapping.constants'
import { onFetchRecords } from './QueryMapping.utils'
import css from './QueryMapping.module.scss'

export default function QueryMapping({
  formikValues,
  formikSetFieldValue,
  connectorIdentifier,
  onFetchRecordsSuccess,
  isQueryExecuted,
  recordsData,
  setLoading
}: QueryMappingInterface): JSX.Element {
  const { getString } = useStrings()
  const sampleDataTracingId = useMemo(() => Utils.randomId(), [])

  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const {
    data: connectorData,
    loading: connectorLoading,
    error: connectorError
  } = useGetConnector({
    identifier: connectorIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const {
    mutate: getSampleData,
    error: sampleDataError,
    loading: sampleDataLoading
  } = useFetchSampleData({
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      tracingId: sampleDataTracingId
    }
  })

  useEffect(() => {
    setLoading(sampleDataLoading)
  }, [sampleDataLoading])

  useEffect(() => {
    formikSetFieldValue(CustomHealthSourceFieldNames.BASE_URL, connectorData?.data?.connector?.spec?.baseURL)
  }, [connectorData])

  const fetchRecords = () =>
    onFetchRecords(
      formikValues?.pathURL,
      formikValues?.endTime,
      formikValues?.startTime,
      formikValues?.requestMethod,
      formikValues?.query,
      getSampleData,
      onFetchRecordsSuccess
    )

  return (
    <Container>
      <Text margin={{ bottom: 'medium' }}>{getString('cv.customHealthSource.Querymapping.label')}</Text>
      <Container margin={{ top: 'medium', bottom: 'medium' }} border={{ bottom: true }}>
        <HealthSourceQueryType />
      </Container>

      <Container padding={{ top: 'medium', bottom: 'medium' }}>
        {connectorError ? (
          <Text padding={{ bottom: 'medium' }} font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}>
            {getErrorMessage(connectorError)}
          </Text>
        ) : connectorLoading ? (
          <Icon name="spinner" margin={{ bottom: 'medium' }} size={24} />
        ) : (
          <FormInput.Text
            label={getString('connectors.customHealth.baseURL')}
            name={CustomHealthSourceFieldNames.BASE_URL}
            disabled
          />
        )}
      </Container>

      <HTTPRequestMethodOption />

      <FormInput.Text
        className={css.baseUrl}
        label={getString('common.path')}
        name={CustomHealthSourceFieldNames.PATH}
      />

      <Text color={'black'} font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'medium', top: 'medium' }}>
        {getString('cv.customHealthSource.Querymapping.fields.parameter.title')}
      </Text>
      <Layout.Horizontal
        margin={{ bottom: 'medium' }}
        padding={{ bottom: 'small' }}
        border={{ bottom: true }}
        spacing={'large'}
        className={css.parameterLayout}
      >
        <Text width={'50%'} font={{ variation: FontVariation.FORM_LABEL }}>
          {getString('keyLabel')}
        </Text>
        <Text width={'50%'} font={{ variation: FontVariation.FORM_LABEL }}>
          {getString('valueLabel')}
        </Text>
      </Layout.Horizontal>
      <Layout.Vertical>
        <Layout.Horizontal spacing={'large'} className={css.parameterLayout}>
          <FormInput.Text className={css.widthHalf} name={'startTime.placeholder'} />
          <FormInput.Select className={css.widthHalf} items={timeFormatOptions} name={'startTime.timestampFormat'} />
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'large'} className={css.parameterLayout}>
          <FormInput.Text className={css.widthHalf} name={'endTime.placeholder'} />
          <FormInput.Select className={css.widthHalf} items={timeFormatOptions} name={'endTime.timestampFormat'} />
        </Layout.Horizontal>
      </Layout.Vertical>
      <Container className={css.widthHalf} margin={{ top: 'medium', bottom: 'medium' }}>
        {formikValues?.requestMethod === 'POST' ? (
          <QueryViewer
            queryLabel={'Body'}
            isQueryExecuted={isQueryExecuted}
            queryNotExecutedMessage={getString('cv.healthSource.connectors.NewRelic.submitQueryNoRecords')}
            records={recordsData ? [recordsData] : []}
            fetchRecords={fetchRecords}
            loading={sampleDataLoading}
            error={sampleDataError}
            query={formikValues.query}
            fetchEntityName={getString('cv.response')}
          />
        ) : (
          <>
            <Button
              intent="primary"
              text={getString('cv.monitoringSources.gcoLogs.fetchRecords')}
              onClick={fetchRecords}
              disabled={sampleDataLoading}
            />
            <Records
              fetchRecords={fetchRecords}
              loading={sampleDataLoading}
              data={[recordsData]}
              error={sampleDataError}
              query={'*'}
              isQueryExecuted={isQueryExecuted}
              queryNotExecutedMessage={getString('cv.monitoringSources.prometheus.submitQueryToSeeRecords')}
            />
          </>
        )}
      </Container>
    </Container>
  )
}
