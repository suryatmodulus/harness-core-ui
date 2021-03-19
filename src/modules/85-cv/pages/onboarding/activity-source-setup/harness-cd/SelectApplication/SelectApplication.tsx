import React, { useState, useEffect } from 'react'
import { Container, Text, Layout, Icon, Color } from '@wings-software/uicore'
import type { CellProps, Renderer } from 'react-table'
import { useParams } from 'react-router-dom'
import Table from '@common/components/Table/Table'

import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'

import {
  useGetListApplications,
  RestResponsePageResponseApplication,
  GetListApplicationsQueryParams
} from 'services/portal'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/exports'
import type { UseGetMockData } from '@common/utils/testUtils'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import css from './SelectApplication.module.scss'

const PAGE_SIZE = 7

export interface HarnessCDActivitySourceDetailsProps {
  stepData: any
  onSubmit?: (data: any) => void
  onPrevious: () => void
  mockData?: UseGetMockData<RestResponsePageResponseApplication>
}
interface TableData {
  id: string
  name: string
  serviceCount: number
  selected: boolean
}

function initializeSelectedApplications(applications: { [key: string]: string }): Map<string, string> {
  if (!applications) {
    return new Map()
  }

  const apps = new Map<string, string>()
  for (const appId of Object.keys(applications)) {
    apps.set(appId, applications[appId])
  }

  return apps
}

const RenderColumnServicesCount: Renderer<CellProps<TableData>> = ({ row }) => {
  const data = row.original
  return <Container className={css.serviceCol}>{data.serviceCount}</Container>
}
const SelectApplication: React.FC<HarnessCDActivitySourceDetailsProps> = props => {
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()
  const [page, setPage] = useState(0)
  const [offset, setOffset] = useState(0)
  const [filter, setFilter] = useState<string | undefined>()
  const [tableData, setTableData] = useState<TableData[]>([])
  const [validationText, setValidationText] = useState<undefined | string>()
  const [selectedApps, setSelectedApps] = useState<Map<string, string>>(
    initializeSelectedApplications(props.stepData.applications)
  )
  const { data, loading, error, refetch } = useGetListApplications({
    queryParams: {
      accountId,
      offset: String(offset),
      limit: PAGE_SIZE.toString(),
      search: filter ? [{ field: 'keywords', op: 'CONTAINS', value: filter }] : undefined
    } as GetListApplicationsQueryParams,
    mock: props.mockData
  })

  const onUpdateData = (value: TableData): void => {
    setSelectedApps(old => {
      const newMap = new Map(old || [])
      const hasItem = newMap.has(value.id)
      if (value.selected && !hasItem) {
        newMap.set(value.id, value.name)
      } else if (!value.selected && hasItem) {
        newMap.delete(value.id)
      }

      return newMap
    })
  }
  useEffect(() => {
    if (!(data?.resource as any)?.response) return
    const alreadySelectedApps = props.stepData.applications ?? {}
    const formatData = []

    for (const app of (data?.resource as any)?.response) {
      if (app?.name && app.uuid) {
        formatData.push({
          name: app.name,
          id: app.uuid,
          selected: !!alreadySelectedApps[String(app.uuid)],
          serviceCount: app.services?.length
        })
      }
    }

    setTableData(formatData)
  }, [(data?.resource as any)?.response])

  if (loading) {
    return (
      <Container className={css.loadingErrorNoData}>
        <PageSpinner />
      </Container>
    )
  }

  const onNext = () => {
    if (selectedApps.size) {
      setValidationText(undefined)
      const newlySelectedApplications: { [key: string]: string } = {}
      for (const app of selectedApps) {
        newlySelectedApplications[app[0]] = app[1]
      }
      props.onSubmit?.({ ...props.stepData, applications: newlySelectedApplications })
    } else {
      setValidationText(getString('cv.activitySources.harnessCD.validation.applicationValidation'))
    }
  }

  const totalpages = Math.ceil((data?.resource as any)?.total / PAGE_SIZE)

  return (
    <Container className={css.main}>
      <Text margin={{ top: 'large', bottom: 'large' }} color={Color.BLACK}>
        {getString('cv.activitySources.harnessCD.application.infoText')}
      </Text>
      <TableFilter
        placeholder={getString('cv.activitySources.harnessCD.application.searchPlaceholder')}
        appliedFilter={filter}
        onFilter={setFilter}
      />
      <Table<TableData>
        onRowClick={rowData => {
          onUpdateData({ ...rowData, selected: !selectedApps.has(rowData.id) })
        }}
        columns={[
          {
            Header: getString('cv.activitySources.harnessCD.harnessApps') || '',
            accessor: 'selected',

            width: '40%',
            Cell: function RenderApplications(tableProps) {
              const rowData: TableData = tableProps.row?.original
              return (
                <Layout.Horizontal spacing="small">
                  <input
                    style={{ cursor: 'pointer' }}
                    type="checkbox"
                    checked={selectedApps.has(rowData.id)}
                    onChange={e => {
                      onUpdateData({ ...rowData, selected: e.target.checked })
                    }}
                  />
                  <Icon name="cd-main" />
                  <Text color={Color.BLACK} lineClamp={1} width="80%">
                    {rowData.name}
                  </Text>
                </Layout.Horizontal>
              )
            },

            disableSortBy: true
          },
          {
            Header: getString('cv.activitySources.harnessCD.application.servicesToBeImported'),
            id: 'serviceCount',
            width: '60%',
            Cell: RenderColumnServicesCount,

            disableSortBy: true
          }
        ]}
        data={tableData || []}
        pagination={{
          itemCount: (data?.resource as any)?.total || 0,
          pageSize: (data?.resource as any)?.pageSize || PAGE_SIZE,
          pageCount: totalpages || -1,
          pageIndex: page || 0,
          gotoPage: pageNumber => {
            setPage(pageNumber)
            if (pageNumber) {
              setOffset(pageNumber * PAGE_SIZE + 1)
            } else {
              setOffset(0)
            }
          }
        }}
      />
      {validationText?.length && <Text intent="danger">{validationText}</Text>}
      <SubmitAndPreviousButtons onPreviousClick={props.onPrevious} onNextClick={onNext} />
      {!tableData?.length && !error?.message && (
        <Container className={css.loadingErrorNoData}>
          <NoDataCard
            icon="warning-sign"
            message={getString('cv.activitySources.harnessCD.application.noData')}
            buttonText={getString('retry')}
            onClick={() => refetch()}
          />
        </Container>
      )}
      {error?.message && (
        <Container className={css.loadingErrorNoData}>
          <PageError message={error.message} onClick={() => refetch()} />
        </Container>
      )}
    </Container>
  )
}

export default SelectApplication
