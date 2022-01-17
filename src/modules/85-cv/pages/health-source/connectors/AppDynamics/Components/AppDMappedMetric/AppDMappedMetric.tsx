/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Accordion,
  SelectOption,
  FormInput,
  Text,
  Color,
  FontVariation,
  Radio
} from '@wings-software/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { useGetMetricPacks, useGetServiceInstanceMetricPath, AppDMetricDefinitions } from 'services/cv'
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
import { PATHTYPE } from './AppDMappedMetric.constant'
import css from '../../AppDHealthSource.module.scss'
import basePathStyle from '../BasePath/BasePath.module.scss'

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
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'APP_DYNAMICS' }
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

  useEffect(() => {
    if (formikValues.pathType === PATHTYPE.DropdownPath) {
      formikSetField('fullPath', '')
    }
  }, [formikValues.pathType])

  const completeMetricPath = useMemo(
    () => `${basePathValue}|${formikValues.appDTier}|${metricPathValue}`.split('|').join(' / '),
    [basePathValue, formikValues.appDTier, metricPathValue]
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
                    <Text padding={{ bottom: 'medium' }} font={{ variation: FontVariation.H6 }}>
                      {getString('cv.monitoringSources.appD.appdPathTitle')}
                    </Text>
                    <Radio
                      padding={{ bottom: 'medium', left: 'xlarge' }}
                      label={getString('cv.healthSource.connectors.AppDynamics.metricPathType.text')}
                      checked={formikValues?.pathType === PATHTYPE.FullPath}
                      onChange={() => formikSetField('pathType', PATHTYPE.FullPath)}
                    />
                    <FormInput.Text name={'fullPath'} disabled={formikValues?.pathType !== PATHTYPE.FullPath} />
                    <Radio
                      padding={{ bottom: 'medium', left: 'xlarge' }}
                      label={getString('cv.healthSource.connectors.AppDynamics.metricPathType.dropdown')}
                      checked={formikValues?.pathType === PATHTYPE.DropdownPath}
                      onChange={() => formikSetField('pathType', PATHTYPE.DropdownPath)}
                    />
                    <Container
                      padding={{ left: 'large' }}
                      className={cx({ [css.disabled]: formikValues?.pathType !== PATHTYPE.DropdownPath })}
                    >
                      <Text padding={{ bottom: 'medium' }}>
                        {getString('cv.monitoringSources.appD.appdPathDetail')}
                      </Text>
                      <BasePath
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
                      <Container className={basePathStyle.basePathContainer}>
                        <Text
                          font={{ variation: FontVariation.SMALL_BOLD }}
                          color={Color.GREY_400}
                          className={basePathStyle.basePathLabel}
                        >
                          {getString('cv.healthSource.connectors.AppDynamics.selectedPathLabel')}
                        </Text>
                        <Text className={basePathStyle.basePathValue} font={{ variation: FontVariation.SMALL_SEMI }}>
                          {completeMetricPath}
                        </Text>
                      </Container>
                    </Container>
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
