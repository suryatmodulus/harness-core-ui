import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Color, Intent, Layout, SelectOption, Text, Utils } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { useParams } from 'react-router-dom'
import { SetupSourceMappingList } from '@cv/components/CVSetupSourcesView/SetupSourceMappingList/SetupSourceMappingList'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { useStrings } from 'framework/exports'
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
      pageSize: 1000
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

  const updateSelectedApps = (
    applicationId: number,
    applicationName: string,
    service?: SelectOption,
    environment?: SelectOption
  ): void => {
    setSelectedApps(oldApps => {
      const exisitingApp = oldApps.get(applicationId)
      if (service && environment) {
        oldApps.set(applicationId, { applicationId, service, environment, applicationName: applicationName })
      } else if (exisitingApp && (!service || !environment)) {
        oldApps.delete(applicationId)
      }

      return new Map(oldApps)
    })
  }

  const updateTableData = (index: number, environment?: SelectOption, service?: SelectOption): void => {
    const guid = Utils.randomId()
    setTableData(oldTableData => {
      oldTableData[index].service = service
      oldTableData[index].environment = environment
      if (environment && service) {
        oldTableData[index].validationResult = 'LOADING'
        oldTableData[index].guid = guid
      }
      return [...oldTableData]
    })

    if (environment && service) {
      metricValidationResult.delete(tableData[index].applicationId)
      setMetricValidationResult(new Map(metricValidationResult))
      getNewRelicMetricDataPromise({
        queryParams: {
          projectIdentifier,
          orgIdentifier,
          accountId,
          appName: tableData[index].applicationName,
          appId: tableData[index].applicationId.toString(),
          requestGuid: guid,
          connectorIdentifier: sourceData.connectorRef?.value || ''
        },
        body: selectedMetricPacks
      })
        .then(response => {
          if (response?.data) {
            tableData[index].validationResult = response.data.overallStatus
            metricValidationResult.set(tableData[index].applicationId, { result: response.data })
            setTableData([...tableData])
            setMetricValidationResult(new Map(metricValidationResult))
          } else if (response.status === 'ERROR') {
            tableData[index].validationResult = undefined
            metricValidationResult.set(tableData[index].applicationId, {
              errorMsg: getErrorMessage({ data: response })
            })
            setTableData([...tableData])
            setMetricValidationResult(new Map(metricValidationResult))
          }
        })
        .catch(e => {
          tableData[index].validationResult = undefined
          metricValidationResult.set(tableData[index].applicationId, { errorMsg: getErrorMessage(e) })
          setTableData([...tableData])
          setMetricValidationResult(new Map(metricValidationResult))
        })
    }
  }

  const selectedApplicationNames = useMemo(() => {
    const appNames = []
    for (const selectedApp of selectedApps) {
      appNames.push(selectedApp[1].applicationName)
    }
    return appNames
  }, [selectedApps])

  return (
    <SetupSourceLayout
      leftPanelContent={<SelectedAppsSideNav selectedApps={selectedApplicationNames} loading={loading} />}
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
              totalItemsToRender: 30,
              appliedFilter: applicationFilter,
              onFilterForMoreThan1000Items: (filterString: string) => setApplicationFilter(filterString)
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
                    const { environment, applicationId, service, applicationName } = cellProps.row.original || {}
                    return (
                      <HarnessEnvironment
                        className={css.dropDown}
                        item={environment}
                        onSelect={env => {
                          updateTableData(cellProps.row.index, env, service)
                          updateSelectedApps(applicationId, applicationName, service, env)
                        }}
                        options={environmentOptions}
                        onNewCreated={newOption => {
                          if (newOption?.identifier && newOption.name) {
                            const newEnvOption = { label: newOption.name, value: newOption.identifier }
                            setEnvironmentOptions([newEnvOption, ...environmentOptions])
                            updateTableData(cellProps.row.index, newEnvOption, service)
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
                    const { service: rowService, applicationId, environment, applicationName } =
                      cellProps.row.original || {}
                    return (
                      <HarnessService
                        className={css.dropDown}
                        item={rowService}
                        onSelect={(service: SelectOption) => {
                          updateTableData(cellProps.row.index, environment, service)
                          updateSelectedApps(applicationId, applicationName, service, environment)
                        }}
                        options={serviceOptions}
                        onNewCreated={newOption => {
                          if (newOption?.identifier && newOption.name) {
                            const newServiceOption = { label: newOption.name, value: newOption.identifier }
                            setServiceOptions([newServiceOption, ...serviceOptions])
                            updateTableData(cellProps.row.index, environment, newServiceOption)
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
                    const { applicationId, validationResult, guid } = cellProps.row.original || {}
                    return (
                      <ValidateMappingCell
                        validationStatus={validationResult}
                        apiError={metricValidationResult.get(applicationId)?.errorMsg}
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
              verificationType={getString('cv.monitoringSources.newRelicName')}
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
            onNext({ ...sourceData, mappedServicesAndEnvs: selectedApps, selectedMetricPacks })
          }
        },
        onPrevious: () => onPrevious({ ...sourceData, mappedServicesAndEnvs: selectedApps, selectedMetricPacks })
      }}
    />
  )
}
