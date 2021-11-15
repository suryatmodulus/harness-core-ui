import React, { useState } from 'react'
import {
  Avatar,
  DateRangePickerButton,
  Icon,
  Layout,
  TableV2,
  Text,
  DropDown,
  SelectOption,
  ExpandingSearchInput
} from '@wings-software/uicore'
import type { Column, Renderer, CellProps } from 'react-table'

import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import type { AuditEventDTO, PageAuditEventDTO } from 'services/audit'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import type { FilterDTO } from 'services/cd-ng'
import { removeNullAndEmpty, flattenObject } from '@common/components/Filter/utils/FilterUtils'
import dummyResponse from '../../mocks/response.json'
import css from './AuditTrail.module.scss'

const LoginEventsList: SelectOption[] = [
  { label: 'Show All Events', value: 'allEvents' },
  { label: 'Exclude Login Events', value: 'excludeLogin' },
  { label: 'Only Show Login Events', value: 'onlyLogin' }
]

const renderColumnTimeStamp: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return formatDatetoLocale(row.original.timestamp)
}

const renderColumnUser: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Avatar name={row.original.resourceScope.accountIdentifier} hoverCard={false} />
      <Text lineClamp={1}>{row.original.resourceScope.accountIdentifier}</Text>
    </Layout.Horizontal>
  )
}

const renderColumnAction: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original.action
}

const renderColumnResource: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return (
    <Layout.Vertical>
      <Text>{row.original.resource.type}</Text>
      <Text>{row.original.resource.identifier}</Text>
    </Layout.Vertical>
  )
}

const renderColumnOrganization: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original.resourceScope.orgIdentifier
}

const renderColumnProject: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original?.resourceScope?.projectIdentifier || '-'
}

const renderColumnModule: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original.module || '-'
}

const renderColumnEnvironment: Renderer<CellProps<AuditEventDTO>> = ({ row }) => {
  return row.original.environment?.identifier || '-'
}

const AuditTrail: React.FC = () => {
  const { getString } = useStrings()
  const [dateSelected, setDate] = useState<Date[]>()
  const [selectedEventType, setEventType] = useState<SelectOption>()
  const [searchParam, setSearchParam] = useState<string>()
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const [filters, setFilters] = useState<FilterDTO[]>()

  // const { mutate: fetchAuditList } = useGetAuditList({})

  const data = dummyResponse.data as PageAuditEventDTO

  const onYamlDiffClick = () => {
    //empty
  }

  const columns: Column<AuditEventDTO>[] = [
    {
      Header: 'Time (PST)',
      id: 'timepst',
      width: '9%',
      accessor: row => row.timestamp,
      Cell: renderColumnTimeStamp
    },
    {
      Header: 'User',
      id: 'user',
      width: '13%',
      accessor: row => row.timestamp,
      Cell: renderColumnUser
    },
    {
      Header: 'Action',
      id: 'action',
      width: '13%',
      accessor: row => row.timestamp,
      Cell: renderColumnAction
    },
    {
      Header: 'Resource',
      id: 'resource',
      width: '15%',
      accessor: row => row.timestamp,
      Cell: renderColumnResource
    },
    {
      Header: 'Organization',
      id: 'organization',
      width: '15%',
      accessor: row => row.timestamp,
      Cell: renderColumnOrganization
    },
    {
      Header: 'Project',
      id: 'project',
      width: '15%',
      accessor: row => row.timestamp,
      Cell: renderColumnProject
    },
    {
      Header: 'Module',
      id: 'module',
      width: '10%',
      accessor: row => row.timestamp,
      Cell: renderColumnModule
    },
    {
      Header: 'Environment',
      id: 'environment',
      width: '10%',
      accessor: row => row.timestamp,
      Cell: renderColumnEnvironment
    },
    {
      Header: '',
      id: 'yaml',
      width: '5%',
      accessor: row => row.timestamp,
      Cell: () => <Icon name="file" onClick={onYamlDiffClick} />
    }
  ]

  const onDateChange = (selectedDates: [Date, Date]): void => {
    setDate(selectedDates)
  }

  const handleFilterSelection = (
    _option: SelectOption,
    event?: React.SyntheticEvent<HTMLElement, Event> | undefined
  ): void => {
    event?.stopPropagation()
    event?.preventDefault()
  }

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('connectorNames', getString('connectors.name'))
  fieldToLabelMapping.set('connectorIdentifiers', getString('identifier'))
  fieldToLabelMapping.set('description', getString('description'))
  fieldToLabelMapping.set('types', getString('typeLabel'))
  fieldToLabelMapping.set('tags', getString('tagsLabel'))
  fieldToLabelMapping.set('connectivityStatuses', getString('connectivityStatus'))

  const onDownloadClick = (): void => {
    /* empty */
  }
  const onToggleColumn = (): void => {
    /* empty */
  }

  return (
    <>
      <Page.Header title={getString('common.auditTrail')} breadcrumbs={<NGBreadcrumbs />} />
      <Page.SubHeader>
        <Layout.Horizontal flex className={css.subHeader}>
          <Layout.Horizontal>
            <DateRangePickerButton
              width={232}
              renderButtonText={() => 'Select Date'}
              initialButtonText="Select Date"
              onChange={onDateChange}
            />
            <DropDown
              items={LoginEventsList}
              width={170}
              value={selectedEventType?.value?.toString()}
              onChange={setEventType}
            />
          </Layout.Horizontal>
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
            <ExpandingSearchInput
              alwaysExpanded
              className={css.search}
              onChange={text => {
                setSearchParam(text.trim())
              }}
              width={300}
            />
            <FilterSelector<FilterDTO>
              appliedFilter={appliedFilter}
              filters={filters}
              onFilterBtnClick={() => {
                //empty
              }}
              onFilterSelect={handleFilterSelection}
              fieldToLabelMapping={fieldToLabelMapping}
              filterWithValidFields={removeNullAndEmpty(
                pick(flattenObject(appliedFilter?.filterProperties || {}), ...fieldToLabelMapping.keys())
              )}
            />
            <Icon onClick={onDownloadClick} padding={{ left: 'large' }} name="download" />
            <Icon onClick={onToggleColumn} padding={{ left: 'large' }} name="remove-column" />
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body>
        <TableV2<AuditEventDTO>
          data={data?.content || []}
          columns={columns}
          className={css.table}
          pagination={{
            itemCount: data?.content?.length || 0,
            pageSize: data?.pageSize || 10,
            pageCount: data?.totalPages || 0,
            pageIndex: data?.pageIndex || 0
          }}
        />
      </Page.Body>
    </>
  )
}

export default AuditTrail
