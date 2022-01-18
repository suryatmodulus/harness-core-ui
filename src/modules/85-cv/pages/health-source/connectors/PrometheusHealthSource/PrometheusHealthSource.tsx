/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useContext, useMemo } from 'react'
import { Container, Formik, FormikForm, Text, Layout, SelectOption, Utils, Accordion } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { StackdriverDefinition, useGetLabelNames, useGetMetricNames, useGetMetricPacks } from 'services/cv'
import { useStrings } from 'framework/strings'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { PrometheusQueryBuilder } from './components/PrometheusQueryBuilder/PrometheusQueryBuilder'
import {
  validateMappings,
  initializePrometheusGroupNames,
  initializeCreatedMetrics,
  initializeSelectedMetricsMap,
  updateSelectedMetricsMap,
  transformPrometheusSetupSourceToHealthSource,
  transformPrometheusHealthSourceToSetupSource
} from './PrometheusHealthSource.utils'
import {
  SelectedAndMappedMetrics,
  PrometheusMonitoringSourceFieldNames,
  CreatedMetricsWithSelectedIndex,
  MapPrometheusQueryToService,
  PrometheusSetupSource
} from './PrometheusHealthSource.constants'
import { PrometheusGroupName } from './components/PrometheusGroupName/PrometheusGroupName'
import type { UpdatedHealthSource } from '../../HealthSourceDrawer/HealthSourceDrawerContent.types'
import { updateMultiSelectOption } from './components/PrometheusQueryBuilder/components/PrometheusFilterSelector/utils'
import { PrometheusQueryViewer } from './components/PrometheusQueryViewer/PrometheusQueryViewer'
import SelectHealthSourceServices from '../../common/SelectHealthSourceServices/SelectHealthSourceServices'
import css from './PrometheusHealthSource.module.scss'

export interface PrometheusHealthSourceProps {
  data: any
  onSubmit: (formdata: PrometheusSetupSource, UpdatedHealthSource: UpdatedHealthSource) => Promise<void>
}

export function PrometheusHealthSource(props: PrometheusHealthSourceProps): JSX.Element {
  const { data: sourceData, onSubmit } = props

  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const {
    onPrevious,
    sourceData: { existingMetricDetails }
  } = useContext(SetupSourceTabsContext)

  const metricDefinitions = existingMetricDetails?.spec?.metricDefinitions
  const { getString } = useStrings()
  const connectorIdentifier = sourceData?.connectorRef || ''
  const [labelNameTracingId, metricNameTracingId] = useMemo(() => [Utils.randomId(), Utils.randomId()], [])
  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'PROMETHEUS' }
  })
  const labelNamesResponse = useGetLabelNames({
    queryParams: { projectIdentifier, orgIdentifier, accountId, connectorIdentifier, tracingId: labelNameTracingId }
  })
  const metricNamesResponse = useGetMetricNames({
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountId,
      tracingId: metricNameTracingId,
      connectorIdentifier
    }
  })

  const transformedSourceData = useMemo(
    () => transformPrometheusHealthSourceToSetupSource(sourceData, getString),
    [sourceData]
  )
  const [rerenderKey, setRerenderKey] = useState('')
  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<SelectedAndMappedMetrics>(
    initializeSelectedMetricsMap(
      getString('cv.monitoringSources.prometheus.prometheusMetric'),
      transformedSourceData.mappedServicesAndEnvs
    )
  )
  const [prometheusGroupNames, setPrometheusGroupName] = useState<SelectOption[]>(
    initializePrometheusGroupNames(mappedMetrics, getString)
  )
  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState<CreatedMetricsWithSelectedIndex>(
    initializeCreatedMetrics(
      getString('cv.monitoringSources.prometheus.prometheusMetric'),
      selectedMetric,
      mappedMetrics
    )
  )

  const initialFormValues: MapPrometheusQueryToService | undefined = mappedMetrics.get(selectedMetric || '')

  return (
    <Formik<MapPrometheusQueryToService | undefined>
      formName="mapPrometheus"
      initialValues={initialFormValues}
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
      {formikProps => {
        const currentSelectedMetricDetail = metricDefinitions?.find(
          (metricDefinition: StackdriverDefinition) =>
            metricDefinition.metricName === mappedMetrics.get(selectedMetric || '')?.metricName
        )

        return (
          <FormikForm>
            <SetupSourceLayout
              leftPanelContent={
                <MultiItemsSideNav
                  defaultMetricName={getString('cv.monitoringSources.prometheus.prometheusMetric')}
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
                          { ...(formikProps.values as MapPrometheusQueryToService) } || { metricName: updatedMetric }
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
                  {formikProps.values?.isManualQuery && (
                    <Container className={css.manualQueryWarning}>
                      <Text icon="warning-sign" iconProps={{ size: 14 }}>
                        {getString('cv.monitoringSources.prometheus.isManualQuery')}
                      </Text>
                      <Text
                        intent="primary"
                        onClick={() =>
                          formikProps.setFieldValue(PrometheusMonitoringSourceFieldNames.IS_MANUAL_QUERY, false)
                        }
                      >
                        {getString('cv.monitoringSources.prometheus.undoManualQuery')}
                      </Text>
                    </Container>
                  )}
                  <Layout.Horizontal className={css.content} spacing="xlarge">
                    <Accordion activeId="metricToService" className={css.accordian}>
                      <Accordion.Panel
                        id="metricToService"
                        summary={getString('cv.monitoringSources.mapMetricsToServices')}
                        details={
                          <>
                            <NameId
                              nameLabel={getString('cv.monitoringSources.metricNameLabel')}
                              identifierProps={{
                                inputName: PrometheusMonitoringSourceFieldNames.METRIC_NAME,
                                idName: PrometheusMonitoringSourceFieldNames.METRIC_IDENTIFIER,
                                isIdentifierEditable: Boolean(!currentSelectedMetricDetail?.identifier)
                              }}
                            />
                            <PrometheusGroupName
                              groupNames={prometheusGroupNames}
                              onChange={formikProps.setFieldValue}
                              item={formikProps.values?.groupName}
                              setPrometheusGroupNames={setPrometheusGroupName}
                            />
                          </>
                        }
                      />
                      {!formikProps.values?.isManualQuery && (
                        <Accordion.Panel
                          id="queryBuilder"
                          summary={getString('cv.monitoringSources.buildYourQuery')}
                          details={
                            <PrometheusQueryBuilder
                              connectorIdentifier={connectorIdentifier}
                              labelNamesResponse={labelNamesResponse}
                              metricNamesResponse={metricNamesResponse}
                              aggregatorValue={formikProps.values?.aggregator}
                              onUpdateFilter={(fieldName, updatedItem) => {
                                formikProps.setFieldValue(
                                  fieldName,
                                  updateMultiSelectOption(updatedItem, (formikProps.values as any)[fieldName])
                                )
                              }}
                              onRemoveFilter={(fieldName, index) => {
                                const arr = (formikProps.values as any)[fieldName]
                                if (arr) {
                                  arr.splice(index, 1)
                                  formikProps.setFieldValue(fieldName, Array.from(arr))
                                }
                              }}
                            />
                          }
                        />
                      )}
                      <Accordion.Panel
                        id="assign"
                        summary={getString('cv.monitoringSources.assign')}
                        details={
                          <SelectHealthSourceServices
                            values={{
                              sli: !!formikProps?.values?.sli,
                              healthScore: !!formikProps?.values?.healthScore,
                              continuousVerification: !!formikProps?.values?.continuousVerification
                            }}
                            metricPackResponse={metricPackResponse}
                            labelNamesResponse={labelNamesResponse}
                          />
                        }
                      />
                    </Accordion>
                    <PrometheusQueryViewer
                      onChange={(fieldName, value) => {
                        if (
                          fieldName === PrometheusMonitoringSourceFieldNames.IS_MANUAL_QUERY &&
                          value === true &&
                          formikProps.values
                        ) {
                          formikProps.values.prometheusMetric = undefined
                          formikProps.values.serviceFilter = undefined
                          formikProps.values.envFilter = undefined
                          formikProps.values.additionalFilter = undefined
                          formikProps.values.prometheusMetric = undefined
                          formikProps.values.aggregator = undefined
                          formikProps.setValues({ ...formikProps.values, isManualQuery: true })
                        } else {
                          formikProps.setFieldValue(fieldName, value)
                        }
                      }}
                      values={formikProps.values}
                      connectorIdentifier={connectorIdentifier}
                    />
                  </Layout.Horizontal>
                </Container>
              }
            />
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={async () => {
                formikProps.setTouched({
                  ...formikProps.touched,
                  [PrometheusMonitoringSourceFieldNames.SLI]: true,
                  [PrometheusMonitoringSourceFieldNames.RISK_CATEGORY]: true,
                  [PrometheusMonitoringSourceFieldNames.LOWER_BASELINE_DEVIATION]: true
                })

                if (Object.keys(formikProps.errors || {})?.length > 0) {
                  formikProps.validateForm()
                  return
                }
                const updatedMetric = formikProps.values
                if (updatedMetric) mappedMetrics.set(selectedMetric, updatedMetric)
                await onSubmit(
                  sourceData,
                  transformPrometheusSetupSourceToHealthSource({
                    ...transformedSourceData,
                    mappedServicesAndEnvs: mappedMetrics
                  })
                )
              }}
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
