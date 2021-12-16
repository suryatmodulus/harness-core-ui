import React, { useState, useMemo, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Accordion, SelectOption, Utils } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import {
  useGetMetricPacks,
  useGetLabelNames,
  useGetServiceInstanceMetricPath,
  AppDMetricDefinitions
} from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { GroupName } from '@cv/pages/health-source/common/GroupName/GroupName'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import SelectHealthSourceServices from '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import {
  updateSelectedMetricsMap,
  getBasePathValue,
  getMetricPathValue,
  initializeGroupNames
} from './AppDMappedMetric.utils'
import BasePath from '../BasePath/BasePath'
import MetricChart from '../MetricChart/MetricChart'
import MetricPath from '../MetricPath/MetricPath'
import type { AppDMappedMetricInterface } from './AppDMappedMetric.types'
import { BasePathInitValue } from '../BasePath/BasePath.constants'
import { AppDynamicsMonitoringSourceFieldNames } from '../../AppDHealthSource.constants'
import css from '../../AppDHealthSource.module.scss'

export default function AppDMappedMetric({
  setMappedMetrics,
  selectedMetric,
  formikValues,
  formikSetField,
  connectorIdentifier,
  mappedMetrics,
  createdMetrics,
  isValidInput,
  setCreatedMetrics
}: AppDMappedMetricInterface): JSX.Element {
  const { getString } = useStrings()
  const labelNameTracingId = useMemo(() => Utils.randomId(), [])
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'APP_DYNAMICS' }
  })
  const labelNamesResponse = useGetLabelNames({
    queryParams: { projectIdentifier, orgIdentifier, accountId, connectorIdentifier, tracingId: labelNameTracingId }
  })

  const { data: serviceInsanceData, refetch: refetchServiceInsance } = useGetServiceInstanceMetricPath({ lazy: true })

  useEffect(() => {
    if (formikValues?.continuousVerification) {
      refetchServiceInsance({
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          connectorIdentifier,
          appName: formikValues.appdApplication,
          baseFolder: getBasePathValue(formikValues?.basePath),
          tier: formikValues.appDTier,
          metricPath: getMetricPathValue(formikValues?.metricPath)
        }
      })
    }
  }, [
    formikValues?.continuousVerification,
    formikValues.appdApplication,
    formikValues?.basePath,
    formikValues?.metricPath
  ])

  if (
    serviceInsanceData &&
    formikValues?.continuousVerification &&
    formikValues?.serviceInstanceMetricPath !== serviceInsanceData.data
  ) {
    formikSetField(AppDynamicsMonitoringSourceFieldNames.SERVICE_INSTANCE_METRIC_PATH, serviceInsanceData?.data)
  }

  const [appdGroupName, setAppdGroupName] = useState<SelectOption[]>(initializeGroupNames(mappedMetrics, getString))
  const basePathValue = getBasePathValue(formikValues?.basePath)
  const metricPathValue = getMetricPathValue(formikValues?.metricPath)
  const {
    sourceData: { existingMetricDetails }
  } = useContext(SetupSourceTabsContext)
  const metricDefinitions = existingMetricDetails?.spec?.metricDefinitions
  const currentSelectedMetricDetail = metricDefinitions?.find(
    (metricDefinition: AppDMetricDefinitions) =>
      metricDefinition.metricName === mappedMetrics.get(selectedMetric || '')?.metricName
  )

  return (
    <SetupSourceLayout
      leftPanelContent={
        <MultiItemsSideNav
          defaultMetricName={'appdMetric'}
          tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
          addFieldLabel={getString('cv.monitoringSources.addMetric')}
          createdMetrics={createdMetrics}
          defaultSelectedMetric={selectedMetric}
          renamedMetric={formikValues?.metricName}
          isValidInput={isValidInput}
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
              if (formikValues?.metricName !== removedMetric) {
                updatedMap.set(updatedMetric, { ...formikValues } || { metricName: updatedMetric })
              }

              setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
              return {
                selectedMetric: updatedMetric,
                mappedMetrics: updatedMap
              }
            })
          }}
          onSelectMetric={(newMetric, updatedList, smIndex) => {
            setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
            setMappedMetrics(oldState => {
              return updateSelectedMetricsMap({
                updatedMetric: newMetric,
                oldMetric: oldState.selectedMetric,
                mappedMetrics: oldState.mappedMetrics,
                formikValues
              })
            })
          }}
        />
      }
      content={
        <Container className={css.main}>
          <SetupSourceCardHeader
            mainHeading={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
            subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
          />
          <Container className={css.content}>
            <Accordion activeId="metricToService" className={css.accordian} allowMultiOpen>
              <Accordion.Panel
                id="metricToService"
                summary={getString('cv.monitoringSources.mapMetricsToServices')}
                details={
                  <>
                    <NameId
                      nameLabel={getString('cv.monitoringSources.metricNameLabel')}
                      identifierProps={{
                        inputName: AppDynamicsMonitoringSourceFieldNames.METRIC_NAME,
                        idName: AppDynamicsMonitoringSourceFieldNames.METRIC_IDENTIFIER,
                        isIdentifierEditable: Boolean(!currentSelectedMetricDetail?.identifier)
                      }}
                    />
                    <GroupName
                      groupNames={appdGroupName}
                      onChange={formikSetField}
                      item={formikValues?.groupName}
                      setGroupNames={setAppdGroupName}
                    />
                    {formikValues.appdApplication && (
                      <>
                        <BasePath
                          fullPath={`${basePathValue}|${formikValues.appDTier}|${metricPathValue}`
                            .split('|')
                            .join(' / ')}
                          basePathValue={formikValues?.basePath || BasePathInitValue}
                          onChange={formikSetField}
                          appName={formikValues.appdApplication}
                          connectorIdentifier={connectorIdentifier}
                        />
                        {basePathValue && formikValues.appDTier && (
                          <MetricPath
                            onChange={formikSetField}
                            metricPathValue={formikValues?.metricPath}
                            connectorIdentifier={connectorIdentifier}
                            baseFolder={basePathValue}
                            appName={formikValues.appdApplication}
                            tier={formikValues.appDTier}
                          />
                        )}
                      </>
                    )}
                  </>
                }
              />
              <Accordion.Panel
                id="metricChart"
                summary={getString('cv.monitoringSources.prometheus.chartAndRecords')}
                details={
                  <>
                    <MetricChart
                      connectorIdentifier={connectorIdentifier}
                      appName={formikValues.appdApplication}
                      tier={formikValues.appDTier}
                      baseFolder={getBasePathValue(formikValues?.basePath)}
                      metricPath={getMetricPathValue(formikValues?.metricPath)}
                    />
                  </>
                }
              />
              <Accordion.Panel
                id="riskProfile"
                summary={getString('cv.monitoringSources.assign')}
                details={
                  <>
                    <SelectHealthSourceServices
                      values={{
                        sli: !!formikValues?.sli,
                        healthScore: !!formikValues?.healthScore,
                        continuousVerification: !!formikValues?.continuousVerification
                      }}
                      metricPackResponse={metricPackResponse}
                      labelNamesResponse={labelNamesResponse}
                      hideServiceIdentifier
                    />
                  </>
                }
              />
            </Accordion>
          </Container>
        </Container>
      }
    />
  )
}
