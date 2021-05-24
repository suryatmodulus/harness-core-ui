import React, { useContext, useState } from 'react'
import { useParams } from 'react-router'
import { Accordion, Container, Formik, FormikForm, Layout, SelectOption, Text, Utils } from '@wings-software/uicore'
import { useGetLabelNames, useGetMetricNames, useGetMetricPacks } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { FooterCTA, SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/strings'
import {
  useGetHarnessEnvironments,
  useGetHarnessServices
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import { MapPrometheusMetricToService } from './components/MapPrometheusMetricToService/MapPrometheusMetricToService'
import { PrometheusRiskProfile } from './components/PrometheusRiskProfile/PrometheusRiskProfile'
import { QueryViewer } from './components/QueryViewer/QueryViewer'
import { PrometheusMetricsSideNav } from './components/PrometheusMetricsSideNav/PrometheusMetricsSideNav'
import { PrometheusQueryBuilder } from './components/PrometheusQueryBuilder/PrometheusQueryBuilder'
import { updateMultiSelectOption } from './components/PrometheusQueryBuilder/components/PrometheusFilterSelector/utils'
import { updateSelectedMetricsMap, validateMappings, initializePrometheusGroupNames } from './utils'
import { MapPrometheusQueryToServiceFieldNames } from './constants'
import type { MapPrometheusQueryToService } from '../../constants'
import css from './MapPrometheusQueriesToServicesAndEnvs.module.scss'

export function MapPrometheusQueriesToServicesAndEnvs(): JSX.Element {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { onPrevious, onNext, sourceData } = useContext(SetupSourceTabsContext)
  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<{
    selectedMetric: string
    mappedMetrics: Map<string, MapPrometheusQueryToService>
  }>({
    selectedMetric:
      (Array.from(sourceData.mappedServicesAndEnvs?.keys() || [])?.[0] as string) ||
      getString('cv.monitoringSources.prometheus.prometheusMetric'),
    mappedMetrics:
      sourceData.mappedServicesAndEnvs ||
      new Map([
        [
          getString('cv.monitoringSources.prometheus.prometheusMetric'),
          { metricName: getString('cv.monitoringSources.prometheus.prometheusMetric') }
        ]
      ])
  })
  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState({
    createdMetrics: Array.from(mappedMetrics.keys()) || [getString('cv.monitoringSources.prometheus.prometheusMetric')],
    selectedMetricIndex: Array.from(mappedMetrics.keys()).findIndex(metric => metric === selectedMetric)
  })

  const connectorIdentifier = sourceData.connectorRef.value
  const [rerenderKey, setRerenderKey] = useState('')

  const labelNamesResponse = useGetLabelNames({
    queryParams: { projectIdentifier, orgIdentifier, accountId, connectorIdentifier }
  })
  const metricNamesResponse = useGetMetricNames({
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountId,
      connectorIdentifier
    }
  })

  const { serviceOptions, setServiceOptions } = useGetHarnessServices()
  const { environmentOptions, setEnvironmentOptions } = useGetHarnessEnvironments()
  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'PROMETHEUS' }
  })
  const [prometheusGroupNames, setPrometheusGroupName] = useState<SelectOption[]>(
    initializePrometheusGroupNames(mappedMetrics, getString)
  )

  return (
    <Formik<MapPrometheusQueryToService | undefined>
      onSubmit={updatedSource => {
        if (updatedSource) {
          mappedMetrics.set(selectedMetric, updatedSource)
        }
        onNext({ ...sourceData, mappedServicesAndEnvs: new Map(mappedMetrics) })
      }}
      initialValues={mappedMetrics.get(selectedMetric || '')}
      key={rerenderKey}
      isInitialValid={(args: any) => {
        return (
          Object.keys(validateMappings(getString, createdMetrics, selectedMetricIndex, args.initialValues)).length === 0
        )
      }}
      enableReinitialize={true}
      validate={values => {
        return validateMappings(getString, createdMetrics, selectedMetricIndex, values)
      }}
    >
      {formikProps => (
        <FormikForm>
          <SetupSourceLayout
            leftPanelContent={
              <PrometheusMetricsSideNav
                createdMetrics={createdMetrics}
                defaultSelectedMetric={selectedMetric}
                renamedMetric={formikProps.values?.metricName}
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
                isValidInput={formikProps.isValid}
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
                        formikProps.setFieldValue(MapPrometheusQueryToServiceFieldNames.IS_MANUAL_QUERY, false)
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
                        <MapPrometheusMetricToService
                          onChange={formikProps.setFieldValue}
                          serviceValue={formikProps.values?.serviceIdentifier}
                          environmentValue={formikProps.values?.envIdentifier}
                          groupNames={prometheusGroupNames}
                          groupNameValue={formikProps.values?.groupName}
                          serviceOptions={serviceOptions}
                          setServiceOptions={setServiceOptions}
                          setPrometheusGroupNames={setPrometheusGroupName}
                          environmentOptions={environmentOptions}
                          setEnvironmentOptions={setEnvironmentOptions}
                        />
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
                      id="riskProfile"
                      summary={getString('cv.monitoringSources.riskProfile')}
                      details={
                        <PrometheusRiskProfile
                          metricPackResponse={metricPackResponse}
                          labelNamesResponse={labelNamesResponse}
                        />
                      }
                    />
                  </Accordion>
                  <QueryViewer
                    className={css.validationContainer}
                    values={formikProps.values}
                    connectorIdentifier={connectorIdentifier}
                    onChange={(fieldName, value) => {
                      if (
                        fieldName === MapPrometheusQueryToServiceFieldNames.IS_MANUAL_QUERY &&
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
                  />
                </Layout.Horizontal>
              </Container>
            }
          />
          <FooterCTA onPrevious={onPrevious} onNext={formikProps.submitForm} />
        </FormikForm>
      )}
    </Formik>
  )
}
