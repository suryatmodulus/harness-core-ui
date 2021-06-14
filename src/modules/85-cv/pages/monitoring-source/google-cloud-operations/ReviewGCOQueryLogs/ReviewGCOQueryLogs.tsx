import React, { useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps } from 'react-table'
import { Text, Color, SelectOption } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { useCreateDataSource, useUpdateDSConfig } from 'services/cv'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceMappingList } from '@cv/components/CVSetupSourcesView/SetupSourceMappingList/SetupSourceMappingList'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import routes from '@common/RouteDefinitions'
import { BaseSetupTabsObject, ONBOARDING_ENTITIES } from '@cv/pages/admin/setup/SetupUtils'
import { transformGCOLogsToDSConfig } from './utils'
import type { GCOMonitoringSourceInfo } from '../GoogleCloudOperationsMonitoringSourceUtils'
import type { GCOLogsDSConfig } from '../MapQueriesToHarnessService/types'

type TableData = {
  metricName: string
  environment: string
  service: string
  query: string
}
interface ReviewGCOQueryLogsProps {
  onSubmit: (data: BaseSetupTabsObject & GCOLogsDSConfig) => void
  onPrevious: () => void
  data: GCOMonitoringSourceInfo
}

export function ReviewGCOQueryLogs(props: ReviewGCOQueryLogsProps): JSX.Element {
  const { getString } = useStrings()
  const history = useHistory()
  const params = useParams<ProjectPathProps & AccountPathProps & { identifier: string }>()
  const { accountId } = useParams<ProjectPathProps>()
  const { onSubmit, onPrevious, data: sourceData } = props

  const { showError, clear } = useToaster()
  const { mutate: updateDSConfigs } = useUpdateDSConfig({
    identifier: sourceData?.identifier as string,
    queryParams: { accountId }
  })

  const { mutate: createDSConfig } = useCreateDataSource({ queryParams: { accountId } })

  const tableData = useMemo(() => {
    const mappedServiceAndEnv: TableData[] = []
    for (const mappedApp of sourceData.mappedServicesAndEnvs || new Map()) {
      const { metricName, serviceIdentifier, envIdentifier, query } = mappedApp[1]
      mappedServiceAndEnv.push({
        metricName,
        service: (serviceIdentifier as SelectOption)?.label,
        environment: (envIdentifier as SelectOption)?.label,
        query
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
              },
              {
                Header: getString('cv.monitoringSources.gcoLogs.query'),
                accessor: 'query',
                width: '25%',
                disableSortBy: true,
                Cell: function EnvironmentName(tableProps: CellProps<TableData>) {
                  return (
                    <Text lineClamp={1} color={Color.BLACK} width="81%">
                      {tableProps.row.original?.query}
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
          const dsConfig: GCOLogsDSConfig = transformGCOLogsToDSConfig(sourceData)
          try {
            if (sourceData?.isEdit) {
              await updateDSConfigs(dsConfig)
            } else {
              await createDSConfig(dsConfig)
            }
            onSubmit({
              ...dsConfig,
              sourceType: ONBOARDING_ENTITIES.MONITORING_SOURCE as BaseSetupTabsObject['sourceType']
            })
            history.push(`${routes.toCVAdminSetup(params)}?step=2`)
          } catch (e) {
            clear()
            showError(getErrorMessage(e), 7000)
          }
        }
      }}
    />
  )
}
