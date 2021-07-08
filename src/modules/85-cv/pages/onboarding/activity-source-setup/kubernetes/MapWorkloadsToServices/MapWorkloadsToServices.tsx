import React, { useEffect, useState } from 'react'
import { Color, Container, Heading, SelectOption, Text } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { useParams } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { useGetWorkloads } from 'services/cv'
import { PageError } from '@common/components/Page/PageError'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import { EnvironmentSelect } from '@cv/pages/monitoring-source/app-dynamics/SelectApplications/EnvironmentSelect'
import {
  EnvironmentResponseDTO,
  ServiceResponseDTO,
  useGetEnvironmentListForProject,
  useGetServiceListForProject
} from 'services/cd-ng'
import { Table, useToaster } from '@common/components'
import { NavItem } from '@cv/pages/onboarding/SetupPageLeftNav/NavItem/NavItem'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { ServiceSelectOrCreate } from '@cv/components/ServiceSelectOrCreate/ServiceSelectOrCreate'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { WorkloadInfo, KubernetesActivitySourceInfo, NamespaceToWorkload } from '../KubernetesActivitySourceUtils'
import css from './MapWorkloadsToServices.module.scss'

export interface MapWorkloadsToServicesProps {
  data: KubernetesActivitySourceInfo
  onSubmit: (data: KubernetesActivitySourceInfo) => void
  onPrevious: () => void
}

interface WorkloadsToServicesTableProps {
  selectedWorkloads: Map<string, WorkloadInfo>
  selectedNamespace: string
  connectorIdentifier: string
  onClickWorkload: (selectedWorkload: WorkloadInfo) => void
}

const TOTAL_ITEMS_PER_PAGE = 6

function generateOptions(response?: EnvironmentResponseDTO[] | ServiceResponseDTO[]): SelectOption[] {
  return response
    ? (response
        .filter(entity => entity && entity.identifier && entity.name)
        .map(entity => ({ value: entity.identifier, label: entity.name })) as SelectOption[])
    : []
}

function updateTableRow(tableData: WorkloadInfo[], fieldName: string, value: any, rowIndex: number): WorkloadInfo[] {
  const updatedTableData = [...tableData]
  updatedTableData[rowIndex] = {
    ...tableData[rowIndex],
    [fieldName]: value
  }
  return updatedTableData
}

function removeWorkloadsWithoutAllColumnsSelected(
  selectedWorkloads: Map<string, Map<string, WorkloadInfo>>
): Map<string, Map<string, WorkloadInfo>> {
  for (const namespace of selectedWorkloads) {
    const [, tableData] = namespace
    for (const tableRow of tableData) {
      const [workload, rowData] = tableRow
      if (!rowData.selected || !rowData.serviceIdentifier || !rowData.environmentIdentifier) {
        tableData.delete(workload)
      }
    }
  }

  return selectedWorkloads
}

function generateUpdatedServiceOptions(
  serviceOptions: SelectOption[],
  selectedService: SelectOption,
  currentService: SelectOption
): SelectOption[] {
  const updatedServiceOptions = [...serviceOptions]
  if (currentService?.value) updatedServiceOptions.push(currentService)
  updatedServiceOptions.splice(
    updatedServiceOptions.findIndex(service => service.value === selectedService.value),
    1
  )
  updatedServiceOptions.sort((a, b) => (a.label as any) - (b.label as any))
  return updatedServiceOptions
}

function removeSelectedOptions(selectedWorkloads: Map<string, WorkloadInfo>, generatedOptions: SelectOption[]): void {
  for (const selectedWorkload of selectedWorkloads) {
    const [, tableRow] = selectedWorkload
    const selectedServiceIndex = generatedOptions.findIndex(
      option => option.value === tableRow.serviceIdentifier?.value
    )
    if (selectedServiceIndex > -1) {
      generatedOptions.splice(selectedServiceIndex, 1)
    }
  }
}

function initializeTableData(selectedWorkloads: Map<string, WorkloadInfo>, workloads?: string[]): WorkloadInfo[] {
  if (!workloads?.length) {
    return []
  }
  const tableData: WorkloadInfo[] = []
  for (const workload of workloads) {
    const existingWorkload = selectedWorkloads.get(workload)
    if (existingWorkload) {
      tableData.push(existingWorkload)
    } else {
      tableData.push({ selected: false, workload })
    }
  }

  return tableData
}

function initializeSelectedWorkloads(
  selectedWorkloads: NamespaceToWorkload,
  selectedNamespaces: string[]
): NamespaceToWorkload {
  if (!selectedWorkloads?.size) {
    return new Map(selectedNamespaces?.map((selectedNamespace: string) => [selectedNamespace, new Map()]))
  }

  const namespaces = Array.from(selectedWorkloads.keys())
  for (const selectedNamespace of namespaces) {
    if (!selectedNamespaces.find(n => n === selectedNamespace)) {
      selectedWorkloads.delete(selectedNamespace)
    }
  }

  for (const namespace of selectedNamespaces) {
    if (!selectedWorkloads.has(namespace)) {
      selectedWorkloads.set(namespace, new Map())
    }
  }

  return new Map(selectedWorkloads)
}

function WorkloadsToServicesTable(props: WorkloadsToServicesTableProps): JSX.Element {
  const { onClickWorkload, selectedNamespace, selectedWorkloads, connectorIdentifier } = props
  const { getString } = useStrings()
  const queryParams = useParams<ProjectPathProps>()
  const { data: sOptions } = useGetServiceListForProject({ queryParams })
  const [tableData, setTableData] = useState<WorkloadInfo[]>([])
  const { showError } = useToaster()
  const [{ pageOffset, filteredWorkload }, setFilterAndPageOffset] = useState<{
    pageOffset: number
    filteredWorkload?: string
  }>({
    pageOffset: 0,
    filteredWorkload: undefined
  })

  const {
    data: workloads,
    error,
    loading,
    refetch: refetchWorkloads
  } = useGetWorkloads({
    queryParams: {
      ...queryParams,
      offset: pageOffset,
      connectorIdentifier,
      namespace: selectedNamespace,
      pageSize: TOTAL_ITEMS_PER_PAGE,
      filter: filteredWorkload,
      orgIdentifier: queryParams.orgIdentifier,
      projectIdentifier: queryParams.projectIdentifier
    }
  })
  const { data: envOptions, error: environmentError } = useGetEnvironmentListForProject({ queryParams })
  const [serviceOptions, setServiceOptions] = useState<SelectOption[]>([{ label: '', value: getString('loading') }])
  const [createdServices, setCreatedServices] = useState<SelectOption[]>([])
  const [environmentOptions, setEnvironmentOptions] = useState<SelectOption[]>([
    { label: '', value: getString('loading') }
  ])

  useEffect(() => {
    if (loading) {
      const loadingItems = Array<WorkloadInfo>(TOTAL_ITEMS_PER_PAGE).fill(
        { selected: false, workload: getString('loading') },
        0,
        TOTAL_ITEMS_PER_PAGE
      )
      setTableData(loadingItems)
    } else {
      setTableData(initializeTableData(selectedWorkloads, workloads?.data?.content))
    }
  }, [workloads, selectedWorkloads, loading])

  useEffect(() => {
    if (environmentError?.message) {
      showError(environmentError?.message, 5000)
    } else {
      setEnvironmentOptions(generateOptions(envOptions?.data?.content))
    }
  }, [envOptions, environmentError])

  useEffect(() => {
    const generatedOptions = [...generateOptions(sOptions?.data?.content), ...createdServices]
    removeSelectedOptions(selectedWorkloads, generatedOptions)
    setServiceOptions(generatedOptions)
  }, [sOptions, selectedNamespace])

  const { pageSize, pageIndex, totalItems, totalPages } = workloads?.data || {}

  return (
    <>
      <TableFilter
        onFilter={namespaceSubstring => setFilterAndPageOffset({ pageOffset: 0, filteredWorkload: namespaceSubstring })}
        appliedFilter={filteredWorkload}
        placeholder={getString('cv.activitySources.kubernetes.searchWorkloadPlaceholder')}
      />
      <Table<WorkloadInfo>
        className={css.workloadTable}
        data={tableData || []}
        onRowClick={(data, index) => {
          onClickWorkload({ ...data, selected: !data.selected })
          setTableData(updateTableRow(tableData, 'selected', !data.selected, index))
        }}
        pagination={{
          pageSize: pageSize || 0,
          pageIndex: pageIndex,
          pageCount: totalPages || 0,
          itemCount: totalItems || 0,
          gotoPage: newPageIndex => setFilterAndPageOffset({ pageOffset: newPageIndex, filteredWorkload })
        }}
        columns={[
          {
            accessor: 'selected',
            width: '5%',
            disableSortBy: true,
            Cell: function CheckColumn(tableProps: CellProps<WorkloadInfo>) {
              return loading ? (
                <Container height={16} width={16} className={Classes.SKELETON} />
              ) : (
                <input
                  type="checkbox"
                  checked={tableProps.value}
                  onChange={() => {
                    onClickWorkload({ ...tableProps.row.original, selected: !tableProps.value })
                    setTableData(updateTableRow(tableData, 'selected', !tableProps.value, tableProps.row.index))
                  }}
                />
              )
            }
          },
          {
            Header: getString('cv.activitySources.kubernetes.workloadToServiceTableColumns.workload'),
            accessor: 'workload',
            width: '20%',
            disableSortBy: true,
            Cell: function Workload(tableProps: CellProps<WorkloadInfo>) {
              return (
                <Text color={Color.BLACK} className={loading ? Classes.SKELETON : undefined}>
                  {tableProps.value}
                </Text>
              )
            }
          },
          {
            Header: getString('cv.activitySources.kubernetes.workloadToServiceTableColumns.mapToService'),
            accessor: 'serviceIdentifier',
            width: '30%',
            disableSortBy: true,
            Cell: function ServiceIdentifier(tableProps: CellProps<WorkloadInfo>) {
              return loading ? (
                <Container height={16} className={Classes.SKELETON} />
              ) : (
                <ServiceSelectOrCreate
                  item={tableProps.value}
                  className={cx(css.selectWidth, loading ? Classes.SKELETON : undefined)}
                  options={serviceOptions || []}
                  onSelect={selectedService => {
                    setServiceOptions(generateUpdatedServiceOptions(serviceOptions, selectedService, tableProps.value))
                    onClickWorkload({ ...tableProps.row.original, serviceIdentifier: selectedService })
                    setTableData(updateTableRow(tableData, 'serviceIdentifier', selectedService, tableProps.row.index))
                  }}
                  onNewCreated={createdService => {
                    if (!createdService || !createdService.name || !createdService.identifier) {
                      return
                    }
                    const serviceOption = { label: createdService.name, value: createdService.identifier }
                    setServiceOptions(
                      generateUpdatedServiceOptions(serviceOptions, { label: '', value: -1 }, serviceOption)
                    )
                    onClickWorkload({ ...tableProps.row.original, serviceIdentifier: serviceOption })
                    setCreatedServices([...createdServices, serviceOption])
                    setTableData(updateTableRow(tableData, 'serviceIdentifier', serviceOption, tableProps.row.index))
                  }}
                />
              )
            }
          },
          {
            Header: getString('cv.activitySources.kubernetes.workloadToServiceTableColumns.mapToEnvironment'),
            accessor: 'environmentIdentifier',
            width: '35%',
            disableSortBy: true,
            Cell: function EnvironmentIdentifier(tableProps: CellProps<WorkloadInfo>) {
              return loading ? (
                <Container height={16} className={Classes.SKELETON} />
              ) : (
                <EnvironmentSelect
                  options={environmentOptions || []}
                  className={cx(css.selectWidth, loading ? Classes.SKELETON : undefined)}
                  item={tableProps.value}
                  onSelect={selectedEnv => {
                    onClickWorkload({ ...tableProps.row.original, environmentIdentifier: selectedEnv })
                    setTableData(updateTableRow(tableData, 'environmentIdentifier', selectedEnv, tableProps.row.index))
                  }}
                  onNewCreated={createdEnv => {
                    if (!createdEnv || !createdEnv.name || !createdEnv.identifier) {
                      return
                    }
                    const envOption = { label: createdEnv.name, value: createdEnv.identifier }
                    setEnvironmentOptions([
                      envOption,
                      ...generateUpdatedServiceOptions(environmentOptions, { label: '', value: -1 }, envOption)
                    ])
                    onClickWorkload({ ...tableProps.row.original, environmentIdentifier: envOption })
                    setTableData(updateTableRow(tableData, 'environmentIdentifier', envOption, tableProps.row.index))
                  }}
                />
              )
            }
          }
        ]}
      />
      {!workloads?.data?.content?.length && !loading && !error?.data && (
        <NoDataCard
          message={getString('cv.activitySources.kubernetes.noWorkloads')}
          icon="warning-sign"
          buttonText={getString('retry')}
          onClick={() => refetchWorkloads()}
          className={css.noWorkloads}
        />
      )}
      {error?.data && !loading && <PageError message={getErrorMessage(error)} onClick={() => refetchWorkloads()} />}
    </>
  )
}

export function MapWorkloadsToServices(props: MapWorkloadsToServicesProps): JSX.Element {
  const { data, onSubmit, onPrevious } = props
  const [selectedWorkloads, setSelectedWorkloads] = useState(
    initializeSelectedWorkloads(data.selectedWorkloads, data.selectedNamespaces)
  )
  const [selectedNamespace, setSelectedNamespace] = useState<string>(data.selectedNamespaces[0])
  const [validationErrorMessage, setValidationErrorMessage] = useState<string>()
  const { getString } = useStrings()

  return (
    <Container className={css.main}>
      <Container className={css.namespaceNav}>
        {data.selectedNamespaces?.map((namespace: string) => {
          return (
            <NavItem
              label={namespace}
              leftLogo={{ name: 'service-kubernetes' }}
              key={namespace}
              isSelected={selectedNamespace === namespace}
              className={css.namespace}
              height={30}
              onClick={setSelectedNamespace}
            />
          )
        })}
      </Container>
      <Container className={css.workloadMapping}>
        <Heading level={2} className={css.mapWorkloadHeading}>
          {getString('cv.activitySources.kubernetes.mapWorkloadsToServices')}
        </Heading>
        <WorkloadsToServicesTable
          key={selectedNamespace}
          connectorIdentifier={(data.connectorRef?.value as string) || ''}
          selectedWorkloads={selectedWorkloads.get(selectedNamespace) as Map<string, WorkloadInfo>}
          selectedNamespace={selectedNamespace}
          onClickWorkload={workloadInfo => {
            const workloads = selectedWorkloads.get(selectedNamespace || '')
            if (workloads) {
              if (workloads.has(workloadInfo.workload) && !workloadInfo.selected)
                workloads.delete(workloadInfo.workload)
              else workloads.set(workloadInfo.workload, workloadInfo)
              setSelectedWorkloads(new Map(selectedWorkloads))
            }
          }}
        />
        {validationErrorMessage && <Text intent="danger">{validationErrorMessage}</Text>}
      </Container>
      <SubmitAndPreviousButtons
        onPreviousClick={onPrevious}
        onNextClick={() => {
          const filteredWorkloads = removeWorkloadsWithoutAllColumnsSelected(selectedWorkloads)
          if (!filteredWorkloads?.size || Array.from(filteredWorkloads.values()).every(workload => !workload.size)) {
            setValidationErrorMessage(getString('cv.activitySources.kubernetes.missingWorkloadMapping'))
            return
          }
          onSubmit({ ...data, selectedWorkloads: filteredWorkloads })
        }}
      />
    </Container>
  )
}
