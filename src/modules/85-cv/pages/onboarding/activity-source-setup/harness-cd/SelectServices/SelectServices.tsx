import React, { useEffect, useMemo, useState } from 'react'
import { Container, Text, Layout, Icon, Color, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useHistory } from 'react-router-dom'
import Table from '@common/components/Table/Table'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import {
  GetListServicesQueryParams,
  RestResponsePageResponseApplication,
  Service,
  useGetListServices
} from 'services/portal'
import { PageSpinner, useToaster } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/exports'
import { ServiceSelectOrCreate } from '@cv/components/ServiceSelectOrCreate/ServiceSelectOrCreate'
import {
  useGetServiceListForProject,
  ResponsePageServiceResponseDTO,
  ServiceResponseDTO,
  GetServiceListForProjectQueryParams
} from 'services/cd-ng'
import type { UseGetMockData } from '@common/utils/testUtils'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import { useRegisterActivitySource, ActivitySourceDTO } from 'services/cv'
import routes from '@common/RouteDefinitions'
import { ONBOARDING_ENTITIES } from '@cv/pages/admin/setup/SetupUtils'
import css from './SelectServices.module.scss'

const PAGE_LIMIT = 7

export interface SelectServicesProps {
  initialValues?: any
  onSubmit?: (data: any) => void
  onPrevious: () => void
  mockData?: UseGetMockData<RestResponsePageResponseApplication>
  mockGetServices?: UseGetMockData<ResponsePageServiceResponseDTO>
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
  service?: SelectOption
}

export interface CDActivitySourceDTO extends ActivitySourceDTO {
  envMappings?: Array<{
    envId: string
    appId: string
    envIdentifier: string
  }>
  serviceMappings?: Array<{
    serviceId: string
    appId: string
    serviceIdentifier: string
  }>
}

export function transformToSavePayload(data: any): CDActivitySourceDTO {
  const envMappings = Object.values(data.environments || {}).map((val: any) => ({
    envId: val.id,
    appId: val.appId,
    appName: val.appName,
    envIdentifier: val.environment?.value
  }))
  const serviceMappings = Object.values(data.services || {}).map((val: any) => ({
    serviceId: val.id,
    appId: val.appId,
    appName: val.appName,
    serviceIdentifier: val.service?.value
  }))

  return {
    identifier: data.identifier,
    name: data.name,
    uuid: data.uuid,
    type: 'HARNESS_CD10',
    envMappings,
    serviceMappings
  }
}

function initializeSelectedServices(services: { [key: string]: TableData }): Map<string, TableData> {
  if (!services) {
    return new Map()
  }

  const envs = new Map<string, TableData>()
  for (const serviceId of Object.keys(services)) {
    envs.set(serviceId, services[serviceId])
  }

  return envs
}

const SelectServices: React.FC<SelectServicesProps> = props => {
  const { getString } = useStrings()
  const [tableData, setTableData] = useState<TableData[]>([])
  const [selectedServices, setSelectedServices] = useState<Map<string, TableData>>(
    initializeSelectedServices(props.initialValues.services)
  )
  const [serviceOptions, setServiceOptions] = useState<any>([])
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [validationText, setValidationText] = useState<undefined | string>()
  const { showError, clear } = useToaster()
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<string | undefined>()
  const [offset, setOffset] = useState(0)
  const history = useHistory()
  const appIds = useMemo(() => Object.keys(props.initialValues.applications), [props.initialValues.applications])
  const { data, loading, error, refetch } = useGetListServices({
    queryParams: {
      appId: appIds,
      offset: String(offset),
      limit: PAGE_LIMIT.toString(),
      'search[0]': filter ? [{ field: 'keywords' }, { op: 'CONTAINS' }, { value: filter }] : undefined
    } as GetListServicesQueryParams,
    queryParamStringifyOptions: { arrayFormat: 'repeat' }
  })

  const { data: serviceResponse } = useGetServiceListForProject({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    } as GetServiceListForProjectQueryParams,
    mock: props.mockGetServices
  })

  const { mutate } = useRegisterActivitySource({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  useEffect(() => {
    if (serviceResponse?.data?.content?.length) {
      setServiceOptions(
        serviceResponse?.data?.content?.map(service => ({
          label: service.name,
          value: service.identifier
        }))
      )
    }
  }, [serviceResponse])

  useEffect(() => {
    if ((data?.resource as any)?.response) {
      const formatData = (data?.resource as any)?.response?.map((item: Service) => {
        return {
          name: item.name,
          id: item.uuid,
          appName: props.initialValues.applications[String(item.appId)],
          appId: item.appId,
          selected: selectedServices.has(item.uuid),
          service: selectedServices.get(item.uuid)?.service ?? ''
        }
      })

      setTableData(formatData)
    }
  }, [(data?.resource as any)?.response])

  const onUpdateData = (value: TableData) => {
    setSelectedServices(old => {
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

  const onNext = async () => {
    if (selectedServices?.size) {
      const newlySelectedServices: { [key: string]: TableData } = {}
      for (const service of selectedServices) {
        if (service[1]?.service?.value) {
          newlySelectedServices[service[0]] = service[1]
        }
      }
      props.onSubmit?.({
        services: newlySelectedServices,
        type: 'HarnessCD_1.0',
        sourceType: ONBOARDING_ENTITIES.CHANGE_SOURCE
      })
      setValidationText(undefined)
      const savePayload = transformToSavePayload({ ...props.initialValues, services: newlySelectedServices })
      try {
        await mutate(savePayload)
        history.push(
          `${routes.toCVAdminSetup({
            accountId,
            projectIdentifier,
            orgIdentifier
          })}?step=1`
        )
      } catch (e) {
        if (e?.data) {
          clear()
          showError(getErrorMessage(e))
        }
      }
    } else {
      setValidationText(getString('cv.activitySources.harnessCD.validation.serviceValidation'))
    }
  }

  return (
    <Container className={css.main}>
      <Text margin={{ top: 'large', bottom: 'large' }} color={Color.BLACK}>
        {getString('cv.activitySources.harnessCD.service.infoText')}
      </Text>
      <TableFilter
        placeholder={getString('cv.activitySources.harnessCD.service.searchPlaceholder')}
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

            width: '28%',
            Cell: function RenderColumnApplication(tableProps) {
              const rowData: TableData = tableProps?.row?.original as TableData
              return (
                <Layout.Horizontal spacing="small">
                  <input
                    style={{ cursor: 'pointer' }}
                    type="checkbox"
                    checked={selectedServices.has(rowData.id || '')}
                    onChange={e => {
                      tableData[tableProps.row.index] = { ...rowData, selected: e.target.checked }
                      onUpdateData(tableData[tableProps.row.index])
                      setTableData([...tableData])
                    }}
                  />
                  <Text lineClamp={1} width="95%" color={Color.BLACK}>
                    {rowData.appName}
                  </Text>
                </Layout.Horizontal>
              )
            },

            disableSortBy: true
          },
          {
            Header: getString('cv.activitySources.harnessCD.service.harnessServices'),
            accessor: 'name',
            width: '28%',
            Cell: function RenderApplications(tableProps) {
              const rowData: TableData = tableProps?.row?.original as TableData

              return (
                <Layout.Horizontal spacing="small">
                  <Icon name="cd-main" />
                  <Text color={Color.BLACK} lineClamp={1} width="95%">
                    {rowData.name}
                  </Text>
                </Layout.Horizontal>
              )
            },
            disableSortBy: true
          },
          {
            Header: getString('cv.activitySources.harnessCD.service.services'),
            accessor: 'service',
            width: '44%',
            Cell: function ServiceCell({ row, value }) {
              return (
                <Layout.Horizontal className={css.serviceContent}>
                  <Icon name="harness" margin={{ right: 'small', top: 'small' }} size={20} />
                  <ServiceSelectOrCreate
                    item={value}
                    options={serviceOptions}
                    onSelect={val => {
                      tableData[row.index] = { ...row.original, service: val }
                      onUpdateData(tableData[row.index])
                      setTableData([...tableData])
                    }}
                    onNewCreated={(val: ServiceResponseDTO) => {
                      setServiceOptions([{ label: val.name, value: val.identifier }, ...serviceOptions])
                      tableData[row.index] = {
                        ...row.original,
                        service: { label: val.name as string, value: val.identifier as string }
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
      <SubmitAndPreviousButtons
        onPreviousClick={props.onPrevious}
        onNextClick={onNext}
        nextButtonProps={{ text: getString('submit') }}
      />
      {error?.message && (
        <Container className={css.loadingErrorNoData}>
          <PageError message={error.message} onClick={() => refetch()} />
        </Container>
      )}
      {!tableData?.length && !error?.message && (
        <Container className={css.loadingErrorNoData}>
          <NoDataCard
            icon="warning-sign"
            message={getString('cv.activitySources.harnessCD.service.noData')}
            buttonText={getString('retry')}
            onClick={() => refetch()}
          />
        </Container>
      )}
    </Container>
  )
}

export default SelectServices
