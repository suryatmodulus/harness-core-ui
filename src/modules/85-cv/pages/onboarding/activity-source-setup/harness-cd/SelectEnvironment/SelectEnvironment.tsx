import React, { useEffect, useState } from 'react'
import { Container, Text, Layout, Icon, Color, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import Table from '@common/components/Table/Table'

import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'

import { Environment, GetListEnvironmentsQueryParams, useGetListEnvironments } from 'services/portal'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { EnvironmentSelect } from '@cv/pages/monitoring-source/app-dynamics/SelectApplications/EnvironmentSelect'
import {
  useGetEnvironmentListForProject,
  EnvironmentResponseDTO,
  GetEnvironmentListForProjectQueryParams
} from 'services/cd-ng'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import css from './SelectEnvironment.module.scss'

const PAGE_LIMIT = 7
export interface SelectEnvironmentProps {
  initialValues?: any
  onSubmit?: (data: any) => void
  onPrevious: () => void
}

export interface Options {
  name: string
  value: string
}

interface TableData {
  name: string
  id: string
  appName: string
  appId: string
  selected: boolean
  environment?: SelectOption
}

function initializeSelectedEnvironments(environments: { [key: string]: TableData }): Map<string, TableData> {
  if (!environments) {
    return new Map()
  }

  const envs = new Map<string, TableData>()
  for (const environmentId of Object.keys(environments)) {
    envs.set(environmentId, environments[environmentId])
  }

  return envs
}

const SelectEnvironment: React.FC<SelectEnvironmentProps> = props => {
  const { getString } = useStrings()
  const [tableData, setTableData] = useState<TableData[]>([])
  const [selectedEnvironments, setSelectedEnvironments] = useState<Map<string, TableData>>(
    initializeSelectedEnvironments(props.initialValues.environments)
  )
  const [environmentOptions, setEnvironmentOptions] = useState<any>([])
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [validationText, setValidationText] = useState<undefined | string>()
  const {
    data,
    loading,
    error,
    refetch: refetchEnvironments
  } = useGetListEnvironments({
    lazy: true
  })
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<string | undefined>()
  const [offset, setOffset] = useState(0)
  const { data: environmentsResponse } = useGetEnvironmentListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetEnvironmentListForProjectQueryParams
  })
  useEffect(() => {
    if (environmentsResponse?.data?.content?.length) {
      setEnvironmentOptions(
        environmentsResponse?.data?.content?.map(env => ({
          label: env.name,
          value: env.identifier
        }))
      )
    }
  }, [environmentsResponse])

  useEffect(() => {
    const appIds = Object.keys(props.initialValues.applications || {})
    refetchEnvironments({
      queryParams: {
        appId: appIds,
        offset: String(offset),
        accountId: accountId,
        limit: PAGE_LIMIT.toString(),
        'search[0]': filter ? [{ field: 'keywords' }, { op: 'CONTAINS' }, { value: filter }] : undefined
      } as GetListEnvironmentsQueryParams,
      queryParamStringifyOptions: { arrayFormat: 'repeat' }
    })
  }, [props.initialValues.selectedApplications, filter, offset])

  useEffect(() => {
    if ((data?.resource as any)?.response) {
      const formatData = (data?.resource as any)?.response?.map((item: Environment) => {
        return {
          name: item.name,
          id: item.uuid,
          appName: props.initialValues.applications[String(item.appId)],
          appId: item.appId,
          selected: selectedEnvironments.has(item.uuid),
          environment: selectedEnvironments.get(item.uuid)?.environment || {}
        }
      })

      setTableData(formatData)
    }
  }, [(data?.resource as any)?.response])

  const onUpdateData = (value: TableData) => {
    setSelectedEnvironments(old => {
      const newMap = new Map(old || [])
      const hasItem = newMap.has(value.id || '')
      if (value.selected) {
        newMap.set(value.id, value)
      } else if (!value.selected && hasItem) {
        newMap.delete(value.id)
      }

      return newMap
    })
  }

  if (loading) {
    return (
      <Container className={css.loadingErrorNoData}>
        <PageSpinner />
      </Container>
    )
  }

  const onNext = () => {
    if (selectedEnvironments?.size) {
      setValidationText(undefined)
      const newlySelectedEnvironments: { [key: string]: TableData } = {}
      for (const env of selectedEnvironments) {
        if (env[1]?.environment?.value) {
          newlySelectedEnvironments[env[0]] = env[1]
        }
      }
      props.onSubmit?.({ ...props.initialValues, environments: newlySelectedEnvironments })
    } else {
      setValidationText(getString('cv.activitySources.harnessCD.validation.environmentValidation'))
    }
  }

  return (
    <Container className={css.main}>
      <Text margin={{ top: 'large', bottom: 'large' }} color={Color.BLACK}>
        {getString('cv.activitySources.harnessCD.environment.infoText')}
      </Text>
      <TableFilter
        placeholder={getString('cv.activitySources.harnessCD.environment.searchPlaceholder')}
        onFilter={filterValue => setFilter(filterValue)}
        appliedFilter={filter}
      />
      <Table<TableData>
        onRowClick={(rowData, index) => {
          tableData[index] = { ...rowData, selected: !rowData.selected }
          onUpdateData(tableData[index])
          setTableData([...tableData])
        }}
        columns={[
          {
            Header: getString('cv.activitySources.harnessCD.harnessApps'),
            accessor: 'appName',
            width: '30%',
            Cell: function RendApplicationName(tableProps) {
              const rowData: TableData = tableProps?.row?.original as TableData
              return (
                <Layout.Horizontal spacing="small">
                  <input
                    style={{ cursor: 'pointer' }}
                    type="checkbox"
                    checked={selectedEnvironments.has(rowData.id || '')}
                    onChange={e => {
                      tableData[tableProps.row.index] = { ...rowData, selected: e.target.checked }
                      onUpdateData(tableData[tableProps.row.index])
                      setTableData([...tableData])
                    }}
                  />
                  <Text color={Color.BLACK}>{rowData.appName}</Text>
                </Layout.Horizontal>
              )
            },

            disableSortBy: true
          },
          {
            Header: getString('cv.activitySources.harnessCD.environment.harnessEnv'),
            accessor: 'name',
            width: '33%',
            Cell: function RenderApplications(tableProps) {
              const rowData: TableData = tableProps?.row?.original as TableData

              return (
                <Layout.Horizontal spacing="small">
                  <Icon name="harness" />
                  <Text color={Color.BLACK}>{rowData.name}</Text>
                </Layout.Horizontal>
              )
            },
            disableSortBy: true
          },
          {
            Header: getString('cv.activitySources.harnessCD.environment.env'),
            accessor: 'environment',
            width: '36%',
            Cell: function EnvironmentCell({ row, value }) {
              return (
                <Layout.Horizontal>
                  <Icon name="harness" margin={{ right: 'small', top: 'small' }} size={20} />
                  <EnvironmentSelect
                    item={value}
                    options={environmentOptions}
                    onSelect={val => {
                      tableData[row.index] = { ...row.original, environment: val }
                      onUpdateData(tableData[row.index])
                      setTableData([...tableData])
                    }}
                    onNewCreated={(val: EnvironmentResponseDTO) => {
                      setEnvironmentOptions([{ label: val.name, value: val.identifier }, ...environmentOptions])
                      tableData[row.index] = {
                        ...row.original,
                        environment: { label: val.name as string, value: val.identifier as string }
                      }
                      setTableData([...tableData])
                      onUpdateData(tableData[row.index])
                    }}
                  />
                </Layout.Horizontal>
              )
            },

            disableSortBy: true
          }
        ]}
        data={tableData || []}
        pagination={{
          itemCount: (data?.resource as any)?.total || 0,
          pageSize: (data?.resource as any)?.pageSize || PAGE_LIMIT,
          pageCount: Math.ceil((data?.resource as any)?.total / PAGE_LIMIT) || -1,
          pageIndex: page || 0,
          gotoPage: pageNumber => {
            setPage(pageNumber)
            if (pageNumber) {
              setOffset(pageNumber * PAGE_LIMIT + 1)
            } else {
              setOffset(0)
            }
          }
        }}
      />
      {validationText && <Text intent="danger">{validationText}</Text>}
      <SubmitAndPreviousButtons onPreviousClick={props.onPrevious} onNextClick={onNext} />
      {error?.message && (
        <Container className={css.loadingErrorNoData}>
          <PageError message={error.message} onClick={() => refetchEnvironments()} />
        </Container>
      )}
      {!tableData?.length && !error?.message && (
        <Container className={css.loadingErrorNoData}>
          <NoDataCard
            icon="warning-sign"
            message={getString('cv.activitySources.harnessCD.environment.noData')}
            buttonText={getString('retry')}
            onClick={() => refetchEnvironments()}
          />
        </Container>
      )}
    </Container>
  )
}

export default SelectEnvironment
