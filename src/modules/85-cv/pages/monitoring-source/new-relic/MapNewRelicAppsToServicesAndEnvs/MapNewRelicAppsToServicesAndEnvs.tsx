import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Color, Intent, Layout, SelectOption, Text, Utils } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { useParams } from 'react-router-dom'
import { SetupSourceMappingList } from '@cv/components/CVSetupSourcesView/SetupSourceMappingList/SetupSourceMappingList'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/strings'
import {
  AppdynamicsValidationResponse,
  getNewRelicMetricDataPromise,
  MetricPackDTO,
  MetricPackValidationResponse,
  useGetNewRelicApplications
} from 'services/cv'
import { useConfirmationDialog } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { StepLabelProps } from '@cv/components/CVSetupSourcesView/StepLabel/StepLabel'
import { SelectMetricPack } from '@cv/pages/monitoring-source/SelectMetricPack/SelectMetricPack'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import {
  useGetHarnessServices,
  HarnessService,
  HarnessEnvironment,
  useGetHarnessEnvironments
} from '@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import type { NewRelicServiceEnvMapping } from '../NewRelicMonitoringSourceUtils'
import { SelectedAppsSideNav } from './SelectedAppsSideNav/SelectedAppsSideNav'
import { ValidateMappingCell, ValidationMappingCellProps } from '../../ValidateMappingCell/ValidateMappingCell'
import css from './MapNewRelicAppsToServiceAndEnvs.module.scss'

const MetricPackStep: StepLabelProps = {
  stepNumber: 1,
  totalSteps: 2
}

const MappingApplicationsStep: StepLabelProps = {
  stepNumber: 2,
  totalSteps: 2
}

const TOTAL_ITEMS_TO_RENDER = 30

type TableData = {
  environment?: SelectOption
  service?: SelectOption
  applicationName: string
  applicationId: number
  validationResult?: ValidationMappingCellProps['validationStatus']
  guid?: string
}

function transformNewRelicDataToAppd(metricData: MetricPackValidationResponse): AppdynamicsValidationResponse[] {
  const appDMeticData: AppdynamicsValidationResponse = {
    overallStatus: metricData.overallStatus,
    metricPackName: metricData.metricPackName,
    values: []
  }
  for (const newRelicData of metricData.metricValidationResponses || []) {
    appDMeticData.values?.push({
      value: newRelicData.value,
      apiResponseStatus: newRelicData.status,
      metricName: newRelicData.metricName
    })
  }
  return [appDMeticData]
}

export function MapNewRelicAppsToServicesAndEnvs(): JSX.Element {
  const { onPrevious, onNext, sourceData } = useContext(SetupSourceTabsContext)
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { serviceOptions, setServiceOptions } = useGetHarnessServices()
  const { environmentOptions, setEnvironmentOptions } = useGetHarnessEnvironments()
  const [tableData, setTableData] = useState<TableData[]>([])
  const [applicationFilter, setApplicationFilter] = useState<string | undefined>()
  const [openMetricsGUID, setOpenMetricsGUID] = useState<{ guid: string; applicationId: number } | undefined>()
  const [validationText, setValidationText] = useState({ titleText: '', contentText: '' })
  const [metricValidationResult, setMetricValidationResult] = useState<
    Map<
      number,
      {
        result?: MetricPackValidationResponse
        errorMsg?: string
      }
    >
  >(new Map())
  const [selectedMetricPacks, setSelectedMetricPacks] = useState<MetricPackDTO[]>(sourceData.selectedMetricPacks || [])
  const { openDialog } = useConfirmationDialog({
    ...validationText,
    cancelButtonText: getString('cv.monitoringSources.backToMapping'),
    intent: Intent.WARNING,
    buttonIntent: Intent.PRIMARY
  })
  const [selectedApps, setSelectedApps] = useState<Map<number, NewRelicServiceEnvMapping>>(
    sourceData?.mappedServicesAndEnvs || new Map()
  )
  const { data, error, loading, refetch } = useGetNewRelicApplications({
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountId,
      filter: applicationFilter,
      connectorIdentifier: sourceData.connectorRef?.value,
      offset: 0,
      pageSize: 100
    }
  })

  useEffect(() => {
    if (!data?.data?.length) {
      return
    }

    const applicationData: TableData[] = []
    for (const application of data?.data) {
      const { applicationId, applicationName } = application || {}
      if (
        applicationId &&
        applicationName &&
        (!applicationFilter || applicationName.toLocaleLowerCase().includes(applicationFilter.toLocaleLowerCase()))
      ) {
        const selectedDetails = selectedApps.get(applicationId)
        applicationData.push({
          applicationId,
          applicationName,
          service: selectedDetails?.service,
          environment: selectedDetails?.environment
        })
      }
    }

    setTableData(applicationData)
  }, [data])

  const validateMapping = (mapping: NewRelicServiceEnvMapping): void => {
    const { applicationName, applicationId, guid } = mapping

    setMetricValidationResult(oldMetricValidation => {
      oldMetricValidation.set(applicationId, {
        result: { overallStatus: 'LOADING' as MetricPackValidationResponse['overallStatus'] }
      })
      return new Map(oldMetricValidation)
    })
    getNewRelicMetricDataPromise({
      queryParams: {
        projectIdentifier,
        orgIdentifier,
        accountId,
        appName: applicationName,
        appId: applicationId.toString(),
        requestGuid: guid as string,
        connectorIdentifier: sourceData.connectorRef?.value || ''
      },
      body: selectedMetricPacks
    })
      .then(response => {
        setMetricValidationResult(oldMetricValidation => {
          if (response?.data) {
            oldMetricValidation.set(applicationId, { result: response.data })
            return new Map(oldMetricValidation)
          } else if (response.status === 'ERROR') {
            oldMetricValidation.set(applicationId, {
              errorMsg: getErrorMessage({ data: response })
            })
            return new Map(oldMetricValidation)
          }
          return oldMetricValidation
        })
      })
      .catch(e => {
        setMetricValidationResult(oldMetricValidation => {
          oldMetricValidation.set(applicationId, { errorMsg: getErrorMessage(e) })
          return new Map(oldMetricValidation)
        })
      })
  }

  const updateSelectedApps = (
    applicationId: number,
    applicationName: string,
    service?: SelectOption,
    environment?: SelectOption
  ): void => {
    const guid = Utils.randomId()
    setSelectedApps(oldApps => {
      const exisitingApp = oldApps.get(applicationId)
      if (exisitingApp && (!service || !environment)) {
        oldApps.delete(applicationId)
      }

      oldApps.set(applicationId, {
        applicationId,
        service: service as SelectOption,
        environment: environment as SelectOption,
        applicationName: applicationName,
        guid: service && environment ? guid : undefined
      })
      return new Map(oldApps)
    })
    if (service && environment) {
      validateMapping({ applicationId, applicationName, service, environment, guid })
    }
  }

  const selectedApplicationNames = useMemo(() => {
    const appNames = []
    for (const selectedApp of selectedApps) {
      if (selectedApp?.[1]?.service && selectedApp[1].environment) {
        appNames.push(selectedApp[1].applicationName)
      }
    }
    return appNames
  }, [selectedApps])

  return (
    <SetupSourceLayout
      leftPanelContent={
        <SelectedAppsSideNav
          selectedApps={selectedApplicationNames}
          loading={loading}
          headerText={getString('cv.monitoringSources.newRelic.selectedApplications')}
        />
      }
      content={
        <Layout.Vertical spacing="medium">
          <SelectMetricPack
            dataSourceType="NEW_RELIC"
            onSelectMetricPack={setSelectedMetricPacks}
            stepProps={MetricPackStep}
          />
          <SetupSourceMappingList<TableData>
            loading={loading}
            error={{
              onClick: () => refetch(),
              message: getErrorMessage(error)
            }}
            noData={{
              onClick: () => refetch(),
              buttonText: getString('retry'),
              message: getString('cv.monitoringSources.appD.noAppsMsg')
            }}
            tableFilterProps={{
              placeholder: getString('cv.monitoringSources.appD.searchPlaceholderApplications'),
              isItemInFilter: (filterString: string, rowObject: TableData) => {
                return rowObject.applicationName.toLocaleLowerCase().includes(filterString.toLocaleLowerCase())
              },
              totalItemsToRender: TOTAL_ITEMS_TO_RENDER,
              appliedFilter: applicationFilter,
              onFilterForMoreThan100Items: (filterString: string) => setApplicationFilter(filterString)
            }}
            mappingListHeaderProps={{
              mainHeading: getString('cv.monitoringSources.newRelic.mapNewRelicAppsToServicesAndEnvs'),
              subHeading: getString('cv.monitoringSources.newRelic.mappingServiceAndEnvSubheading'),
              stepLabelProps: MappingApplicationsStep
            }}
            tableProps={{
              data: tableData,
              columns: [
                {
                  Header: getString('cv.monitoringSources.newRelic.newRelicAppColumn'),
                  accessor: 'applicationName',
                  width: '20%',
                  disableSortBy: true,
                  Cell: function AppName(tableProps: CellProps<TableData>) {
                    return (
                      <Text lineClamp={1} color={Color.BLACK}>
                        {tableProps.row.original?.applicationName}
                      </Text>
                    )
                  }
                },
                {
                  Header: getString('cv.monitoringSources.appD.mapToHarnessEnvironment'),
                  accessor: 'environment',
                  width: '30%',
                  disableSortBy: true,
                  Cell: function Environment(cellProps: CellProps<TableData>) {
                    const { applicationId, applicationName } = cellProps.row.original || {}
                    const { service, environment } = selectedApps?.get(applicationId) || {}
                    return (
                      <HarnessEnvironment
                        className={css.dropDown}
                        item={environment}
                        key={applicationId}
                        onSelect={env => {
                          updateSelectedApps(applicationId, applicationName, service, env)
                        }}
                        options={environmentOptions}
                        onNewCreated={newOption => {
                          if (newOption?.identifier && newOption.name) {
                            const newEnvOption = { label: newOption.name, value: newOption.identifier }
                            setEnvironmentOptions([newEnvOption, ...environmentOptions])
                            updateSelectedApps(applicationId, applicationName, service, newEnvOption)
                          }
                        }}
                      />
                    )
                  }
                },
                {
                  Header: getString('cv.monitoringSources.appD.mappingToHarnessService'),
                  accessor: 'service',
                  width: '30%',
                  disableSortBy: true,
                  Cell: function Service(cellProps: CellProps<TableData>) {
                    const { applicationId, applicationName } = cellProps.row.original || {}
                    const { service, environment } = selectedApps?.get(applicationId) || {}
                    return (
                      <HarnessService
                        className={css.dropDown}
                        item={service}
                        key={applicationId}
                        onSelect={(selectedService: SelectOption) => {
                          updateSelectedApps(applicationId, applicationName, selectedService, environment)
                        }}
                        options={serviceOptions}
                        onNewCreated={newOption => {
                          if (newOption?.identifier && newOption.name) {
                            const newServiceOption = { label: newOption.name, value: newOption.identifier }
                            setServiceOptions([newServiceOption, ...serviceOptions])
                            updateSelectedApps(applicationId, applicationName, newServiceOption, environment)
                          }
                        }}
                      />
                    )
                  }
                },
                {
                  Header: getString('cv.monitoringSources.appD.validation'),
                  accessor: 'validationResult',
                  width: '20%',
                  disableSortBy: true,
                  Cell: function ValCell(cellProps: CellProps<TableData>) {
                    const { applicationId } = cellProps.row.original || {}
                    const { errorMsg, result } = metricValidationResult.get(applicationId) || {}
                    const { guid } = selectedApps.get(applicationId) || {}
                    return (
                      <ValidateMappingCell
                        validationStatus={result?.overallStatus}
                        apiError={errorMsg}
                        onRetry={() => {
                          const mapping = selectedApps.get(applicationId)
                          if (mapping) validateMapping(mapping)
                        }}
                        onCellClick={() => setOpenMetricsGUID({ guid: guid as string, applicationId })}
                      />
                    )
                  }
                }
              ]
            }}
          />
          {openMetricsGUID && (
            <MetricsVerificationModal
              verificationType={getString('connectors.newRelicLabel')}
              verificationData={transformNewRelicDataToAppd(
                metricValidationResult.get(openMetricsGUID.applicationId)?.result as MetricPackValidationResponse
              )}
              guid={openMetricsGUID.guid}
              onHide={() => setOpenMetricsGUID(undefined)}
            />
          )}
        </Layout.Vertical>
      }
      footerCTAProps={{
        onNext: async () => {
          if (!selectedApps.size) {
            setValidationText({
              titleText: getString('cv.monitoringSources.oneMetricMappingValidation'),
              contentText: getString('cv.monitoringSources.newRelic.oneMetricMappingValidationSubtext')
            })
            openDialog()
          } else if (!selectedMetricPacks.length) {
            setValidationText({
              titleText: getString('cv.monitoringSources.oneMetricPackValidation'),
              contentText: getString('cv.monitoringSources.oneMetricMappingValidationSubtext')
            })
            openDialog()
          } else {
            const filteredApps = new Map(selectedApps)
            for (const app of filteredApps) {
              const [appId, mapping] = app || []
              if (!mapping?.environment || !mapping?.service) {
                filteredApps.delete(appId)
              }
            }
            onNext({ ...sourceData, mappedServicesAndEnvs: filteredApps, selectedMetricPacks })
          }
        },
        onPrevious: () => onPrevious({ ...sourceData, mappedServicesAndEnvs: selectedApps, selectedMetricPacks })
      }}
    />
  )
}
