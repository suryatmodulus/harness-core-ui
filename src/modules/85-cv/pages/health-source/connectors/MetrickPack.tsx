import React, { useEffect } from 'react'
import type { FormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { Container, FormInput, Icon } from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useGetMetricPacks, GetMetricPacksQueryParams, MetricPackDTO } from 'services/cv'
import css from './MonitoredServiceConnector.module.scss'

export default function MetricPack({
  formik,
  connector,
  value,
  onChange,
  setSelectedMetricPacks
}: {
  formik: FormikContext<any>
  connector: GetMetricPacksQueryParams['dataSourceType']
  value: any[]
  onChange: (data: { [key: string]: boolean }) => void
  setSelectedMetricPacks: React.Dispatch<React.SetStateAction<MetricPackDTO[]>>
}): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const {
    data: metricPacks,
    refetch: refetchMetricPacks,
    error: metricPackError,
    loading
  } = useGetMetricPacks({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      dataSourceType: connector
    }
  })

  useEffect(() => {
    if (metricPacks) {
      const metricData: { [key: string]: boolean } = {}
      const metricList: MetricPackDTO[] = value || metricPacks?.resource || []
      metricList.forEach((i: MetricPackDTO) => (metricData[i.identifier as string] = true))
      if (!isEmpty(metricData)) formik.setFieldValue('metricData', metricData)
      if (metricPacks?.resource) setSelectedMetricPacks(metricPacks?.resource)
    }
  }, [metricPacks])

  return (
    <FormInput.CustomRender
      name={'metricData'}
      render={() => {
        return loading ? (
          <Icon name="steps-spinner" />
        ) : (
          <>
            <Container className={css.metricPack}>
              {metricPacks?.resource?.map((metricPack: MetricPackDTO) => {
                return (
                  <FormInput.CheckBox
                    name={`metricData.${metricPack.identifier}`}
                    key={metricPack.identifier}
                    label={metricPack.identifier || ''}
                    onChange={async val => {
                      const metricValue: { [key: string]: boolean } = {
                        ...formik.values.metricData,
                        [metricPack.identifier as string]: val.currentTarget.checked
                      }
                      onChange(metricValue)
                    }}
                  />
                )
              })}
            </Container>
            {metricPackError && (
              <PageError message={getErrorMessage(metricPackError)} onClick={() => refetchMetricPacks()} />
            )}
          </>
        )
      }}
    />
  )
}
