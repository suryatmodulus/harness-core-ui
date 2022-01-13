import React, { useState, useContext, useMemo, useCallback } from 'react'
import { Container, Formik, FormikForm, Layout, Utils, Accordion } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { useGetLabelNames } from 'services/cv'
import { useStrings } from 'framework/strings'
import {
  initializeCreatedMetrics,
  initializeSelectedMetricsMap,
  updateSelectedMetricsMap,
  transformCustomHealthSourceToSetupSource,
  validateMappings,
  onSubmitCustomHealthSource,
  generateCustomMetricPack
} from './CustomHealthSource.utils'
import type {
  CreatedMetricsWithSelectedIndex,
  CustomHealthSourceSetupSource,
  MapCustomHealthToService,
  SelectedAndMappedMetrics
} from './CustomHealthSource.types'

import { defaultMetricName, QueryType } from './CustomHealthSource.constants'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import SelectHealthSourceServices from '../../common/SelectHealthSourceServices/SelectHealthSourceServices'
import MapMetricsToServices from './components/MapMetricsToServices/MapMetricsToServices'
import QueryMapping from './components/QueryMapping/QueryMapping'
import MetricChartsValue from './components/MetricChartsValue/MetricChartsValue'
import css from './CustomHealthSource.module.scss'

export interface CustomHealthSourceProps {
  data: any
  onSubmit: (formdata: CustomHealthSourceSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export function CustomHealthSource(props: CustomHealthSourceProps): JSX.Element {
  const { getString } = useStrings()
  const { onPrevious } = useContext(SetupSourceTabsContext)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()
  const [labelNameTracingId] = useMemo(() => [Utils.randomId()], [])

  const { data: sourceData, onSubmit } = props
  const connectorIdentifier = sourceData?.connectorRef || ''
  const labelNamesResponse = useGetLabelNames({
    queryParams: { projectIdentifier, orgIdentifier, accountId, connectorIdentifier, tracingId: labelNameTracingId }
  })

  const transformedSourceData = useMemo(() => transformCustomHealthSourceToSetupSource(sourceData), [sourceData])

  const [rerenderKey, setRerenderKey] = useState('')
  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<SelectedAndMappedMetrics>(
    initializeSelectedMetricsMap(defaultMetricName, transformedSourceData.mappedServicesAndEnvs)
  )

  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState<CreatedMetricsWithSelectedIndex>(
    initializeCreatedMetrics(defaultMetricName, selectedMetric, mappedMetrics)
  )

  const metricPacks = useMemo(() => generateCustomMetricPack(), [])

  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const [sampleDataLoading, setSampleDataLoading] = useState(false)
  const [recordsData, setrecordsData] = useState<Record<string, unknown> | undefined>()

  const onFetchRecordsSuccess = useCallback((data: Record<string, unknown> | undefined): void => {
    setrecordsData(data)
    setIsQueryExecuted(true)
  }, [])

  const isSelectingJsonPathDisabled = !isQueryExecuted || sampleDataLoading || !recordsData

  return (
    <Formik<MapCustomHealthToService | undefined>
      formName="mapPrometheus"
      initialValues={mappedMetrics.get(selectedMetric || '')}
      key={rerenderKey}
      isInitialValid={(args: any) =>
        Object.keys(validateMappings(getString, createdMetrics, selectedMetricIndex, args.initialValues)).length === 0
      }
      onSubmit={noop}
      enableReinitialize={true}
      validate={values => {
        return validateMappings(getString, createdMetrics, selectedMetricIndex, values)
      }}
    >
      {formikProps => (
        <FormikForm className={css.formFullheight}>
          <SetupSourceLayout
            leftPanelContent={
              <MultiItemsSideNav
                defaultMetricName={defaultMetricName}
                tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
                addFieldLabel={getString('cv.monitoringSources.addMetric')}
                createdMetrics={createdMetrics}
                defaultSelectedMetric={selectedMetric}
                renamedMetric={formikProps.values?.metricName}
                isValidInput={formikProps.isValid}
                onRemoveMetric={(removedMetric, updatedMetric, updatedList, smIndex) => {
                  setMappedMetrics(oldState => {
                    const { selectedMetric: oldMetric, mappedMetrics: oldMappedMetric } = oldState
                    const updatedMap = new Map(oldMappedMetric)

                    if (updatedMap.has(removedMetric)) {
                      updatedMap.delete(removedMetric)
                    } else {
                      // handle case where user updates the metric name for current selected metric
                      updatedMap.delete(oldMetric)
                    }

                    // update map with current values
                    if (formikProps.values?.metricName !== removedMetric) {
                      updatedMap.set(
                        updatedMetric,
                        { ...(formikProps.values as MapCustomHealthToService) } || { metricName: updatedMetric }
                      )
                    } else {
                      setRerenderKey(Utils.randomId())
                    }

                    setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
                    return { selectedMetric: updatedMetric, mappedMetrics: updatedMap }
                  })
                }}
                onSelectMetric={(newMetric, updatedList, smIndex) => {
                  setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
                  setMappedMetrics(oldState => {
                    return updateSelectedMetricsMap({
                      updatedMetric: newMetric,
                      oldMetric: oldState.selectedMetric,
                      mappedMetrics: oldState.mappedMetrics,
                      formikProps
                    })
                  })
                  setRerenderKey(Utils.randomId())
                }}
              />
            }
            content={
              <Container className={css.main}>
                <SetupSourceCardHeader
                  mainHeading={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
                  subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
                />
                <Layout.Horizontal className={css.content} spacing="xlarge">
                  <Accordion activeId="metricToService" className={css.accordian}>
                    <Accordion.Panel
                      id="metricToService"
                      summary={getString('cv.monitoringSources.mapMetricsToServices')}
                      details={
                        <MapMetricsToServices
                          formikProps={formikProps}
                          mappedMetrics={mappedMetrics}
                          selectedMetric={selectedMetric}
                        />
                      }
                    />
                    <Accordion.Panel
                      id="querymapping"
                      summary={getString('cv.customHealthSource.Querymapping.title')}
                      details={
                        <QueryMapping
                          formikSetFieldValue={formikProps.setFieldValue}
                          formikValues={formikProps.values}
                          connectorIdentifier={connectorIdentifier}
                          onFetchRecordsSuccess={onFetchRecordsSuccess}
                          recordsData={recordsData}
                          isQueryExecuted={isQueryExecuted}
                          setLoading={setSampleDataLoading}
                        />
                      }
                    />
                    <Accordion.Panel
                      id="metricChart"
                      summary={getString('cv.healthSource.connectors.NewRelic.metricValueAndCharts')}
                      details={
                        <MetricChartsValue
                          recordsData={recordsData}
                          formikValues={formikProps.values}
                          formikSetFieldValue={formikProps.setFieldValue}
                          isQueryExecuted={isQueryExecuted}
                          isSelectingJsonPathDisabled={isSelectingJsonPathDisabled}
                        />
                      }
                    />
                    <Accordion.Panel
                      id="riskProfile"
                      summary={getString('cv.monitoringSources.assign')}
                      details={
                        <SelectHealthSourceServices
                          values={{
                            sli: !!formikProps?.values?.sli,
                            healthScore: !!formikProps?.values?.healthScore,
                            continuousVerification: !!formikProps?.values?.continuousVerification
                          }}
                          hideServiceIdentifier
                          metricPackResponse={metricPacks}
                          labelNamesResponse={labelNamesResponse}
                          hideCV={formikProps.values?.queryType === QueryType.SERVICE_BASED}
                          hideSLIAndHealthScore={formikProps.values?.queryType === QueryType.HOST_BASED}
                        />
                      }
                    />
                  </Accordion>
                </Layout.Horizontal>
              </Container>
            }
          />
          <DrawerFooter
            isSubmit
            onPrevious={onPrevious}
            onNext={onSubmitCustomHealthSource({
              formikProps,
              createdMetrics,
              selectedMetricIndex,
              mappedMetrics,
              selectedMetric,
              onSubmit,
              sourceData,
              transformedSourceData,
              getString
            })}
          />
        </FormikForm>
      )}
    </Formik>
  )
}
