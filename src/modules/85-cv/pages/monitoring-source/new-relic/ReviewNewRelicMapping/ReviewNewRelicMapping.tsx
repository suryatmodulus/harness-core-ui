import React, { useContext, useMemo } from 'react'
import type { CellProps } from 'react-table'
import { Text, Color } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { SetupSourceMappingList } from '@cv/components/CVSetupSourcesView/SetupSourceMappingList/SetupSourceMappingList'
import { useStrings } from 'framework/exports'
import { useToaster } from '@common/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useSaveDSConfig, useCreateDataSource } from 'services/cv'
import type { NewRelicDSConfig, NewRelicServiceEnvMapping } from '../NewRelicMonitoringSourceUtils'

type TableData = {
  applicationName: string
  environment: string
  service: string
}

export function ReviewNewRelicMapping(): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { onNext, onPrevious, sourceData } = useContext(SetupSourceTabsContext)
  const { showError, clear } = useToaster()
  const { mutate: updateDSConfigs } = useSaveDSConfig({})
  const { mutate: createDSConfig } = useCreateDataSource({})
  const tableData = useMemo(() => {
    const mappedServiceAndEnv: TableData[] = []
    for (const mappedApp of sourceData.mappedServicesAndEnvs || new Map()) {
      const { applicationName, service, environment } = mappedApp[1]
      mappedServiceAndEnv.push({
        applicationName,
        service: service.label,
        environment: environment.label
      })
    }

    return mappedServiceAndEnv
  }, [sourceData])
  return (
    <SetupSourceLayout
      content={
        <SetupSourceMappingList
          mappingListHeaderProps={{
            mainHeading: getString('cv.monitoringSources.newRelic.totalMappedApplications', {
              total: tableData.length
            }),
            subHeading: getString('cv.monitoringSources.reviewPageSubHeading')
          }}
          tableFilterProps={{
            isItemInFilter: (filterString: string, rowObject: TableData) => {
              return (
                rowObject.applicationName.toLocaleLowerCase().includes(filterString.toLocaleLowerCase()) ||
                rowObject.service.toLocaleLowerCase().includes(filterString.toLocaleLowerCase()) ||
                rowObject.environment.toLocaleLowerCase().includes(filterString.toLocaleLowerCase())
              )
            },
            placeholder: `${getString('cv.monitoringSources.appD.searchPlaceholderApplications')}, ${getString(
              'environments'
            )}, ${getString('or')} ${getString('services')}`
          }}
          tableProps={{
            data: tableData,
            columns: [
              {
                Header: getString('cv.monitoringSources.newRelic.newRelicAppColumn'),
                accessor: 'applicationName',
                width: '30%',
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
                Header: getString('cv.monitoringSources.appD.mappedToHarnessService'),
                accessor: 'service',
                width: '30%',
                disableSortBy: true,
                Cell: function ServiceName(tableProps: CellProps<TableData>) {
                  return (
                    <Text lineClamp={1} color={Color.BLACK}>
                      {tableProps.row.original?.service}
                    </Text>
                  )
                }
              },
              {
                Header: getString('cv.monitoringSources.appD.mappedToHarnessEnvironment'),
                accessor: 'environment',
                width: '30%',
                disableSortBy: true,
                Cell: function EnvironmentName(tableProps: CellProps<TableData>) {
                  return (
                    <Text lineClamp={1} color={Color.BLACK}>
                      {tableProps.row.original?.environment}
                    </Text>
                  )
                }
              }
            ]
          }}
        />
      }
      footerCTAProps={{
        isSubmit: true,
        onPrevious: () => onPrevious(),
        onNext: async () => {
          const dsConfig: NewRelicDSConfig = {
            connectorIdentifier: sourceData.connectorRef.value,
            type: 'NEW_RELIC',
            accountId,
            projectIdentifier,
            orgIdentifier,
            productName: sourceData.productName,
            identifier: sourceData.identifier,
            monitoringSourceName: sourceData.monitoringSourceName,
            newRelicServiceConfigList: []
          }

          for (const entry of sourceData.mappedServicesAndEnvs.entries()) {
            const { applicationId, applicationName, environment, service }: NewRelicServiceEnvMapping = entry[1]
            if (applicationId && applicationName && environment?.value && service?.value) {
              dsConfig.newRelicServiceConfigList.push({
                applicationId,
                applicationName,
                envIdentifier: environment.value as string,
                serviceIdentifier: service.value as string,
                metricPacks: sourceData.selectedMetricPacks
              })
            }
          }

          try {
            if (sourceData.isEdit) {
              await updateDSConfigs(dsConfig, { queryParams: { accountId } })
            } else {
              await createDSConfig(dsConfig, { queryParams: { accountId } })
            }
            onNext(dsConfig)
          } catch (e) {
            clear()
            showError(getErrorMessage(e), 7000)
          }
        }
      }}
    />
  )
}
