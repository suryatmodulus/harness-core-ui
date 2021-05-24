import React, { useContext, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import type { CellProps } from 'react-table'
import { Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { useCreateDataSource, useUpdateDSConfig } from 'services/cv'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { SetupSourceMappingList } from '@cv/components/CVSetupSourcesView/SetupSourceMappingList/SetupSourceMappingList'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { transformPrometheusSourceToDSConfig } from './utils'

type TableData = {
  metricName: string
  groupName: string
  environment: string
  service: string
}

export function ReviewPrometheusMapping(): JSX.Element {
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()
  const { onNext, onPrevious, sourceData } = useContext(SetupSourceTabsContext)
  const { showError, clear } = useToaster()
  const { mutate: updateDSConfigs } = useUpdateDSConfig({
    identifier: sourceData.identifier,
    queryParams: { accountId }
  })
  const { mutate: createDSConfig } = useCreateDataSource({ queryParams: { accountId } })
  const tableData = useMemo(() => {
    const mappedServiceAndEnv: TableData[] = []
    for (const mappedApp of sourceData.mappedServicesAndEnvs || new Map()) {
      const { metricName, groupName, serviceIdentifier, envIdentifier } = mappedApp[1]
      mappedServiceAndEnv.push({
        metricName,
        groupName: groupName?.label,
        service: serviceIdentifier.label,
        environment: envIdentifier.label
      })
    }

    return mappedServiceAndEnv
  }, [sourceData])
  return (
    <SetupSourceLayout
      content={
        <SetupSourceMappingList
          mappingListHeaderProps={{
            mainHeading: getString('cv.monitoringSources.totalMappedQueries', {
              total: tableData.length,
              query: tableData.length > 1 ? getString('cv.queries') : getString('cv.query')
            }),
            subHeading: getString('cv.monitoringSources.reviewPageSubHeading')
          }}
          tableFilterProps={{
            isItemInFilter: (filterString: string, rowObject: TableData) => {
              return (
                rowObject.metricName?.toLocaleLowerCase().includes(filterString.toLocaleLowerCase()) ||
                rowObject.groupName?.toLocaleLowerCase().includes(filterString.toLocaleLowerCase()) ||
                rowObject.service?.toLocaleLowerCase().includes(filterString.toLocaleLowerCase()) ||
                rowObject.environment?.toLocaleLowerCase().includes(filterString.toLocaleLowerCase())
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
                Header: getString('cv.monitoringSources.metricNameLabel').toLocaleUpperCase(),
                accessor: 'metricName',
                width: '25%',
                disableSortBy: true,
                Cell: function AppName(tableProps: CellProps<TableData>) {
                  return (
                    <Text lineClamp={1} color={Color.BLACK} width="81%">
                      {tableProps.row.original?.metricName}
                    </Text>
                  )
                }
              },
              {
                Header: getString('cv.monitoringSources.prometheus.groupName').toLocaleUpperCase(),
                accessor: 'groupName',
                width: '25%',
                disableSortBy: true,
                Cell: function AppName(tableProps: CellProps<TableData>) {
                  return (
                    <Text lineClamp={1} color={Color.BLACK} width="81%">
                      {tableProps.row.original?.groupName}
                    </Text>
                  )
                }
              },
              {
                Header: getString('cv.monitoringSources.appD.mappedToHarnessService'),
                accessor: 'service',
                width: '25%',
                disableSortBy: true,
                Cell: function ServiceName(tableProps: CellProps<TableData>) {
                  return (
                    <Text lineClamp={1} color={Color.BLACK} width="81%">
                      {tableProps.row.original?.service}
                    </Text>
                  )
                }
              },
              {
                Header: getString('cv.monitoringSources.appD.mappedToHarnessEnvironment'),
                accessor: 'environment',
                width: '25%',
                disableSortBy: true,
                Cell: function EnvironmentName(tableProps: CellProps<TableData>) {
                  return (
                    <Text lineClamp={1} color={Color.BLACK} width="81%">
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
          const dsConfig = transformPrometheusSourceToDSConfig(sourceData)
          try {
            if (sourceData.isEdit) {
              await updateDSConfigs(dsConfig)
            } else {
              await createDSConfig(dsConfig)
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
