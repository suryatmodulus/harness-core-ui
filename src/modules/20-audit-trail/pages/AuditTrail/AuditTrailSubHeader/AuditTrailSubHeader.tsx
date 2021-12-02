import React, { useState, useEffect } from 'react'
import { Page, Layout, DateRangePickerButton, DropDown, SelectOption, Icon, useModalHook } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import type { FilterDTO } from 'services/cd-ng'
import { useGetFilterList } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { AuditFilterProperties } from 'services/audit'
import FilterDrawer from '../FilterDrawer/FilterDrawer'
import css from './AuditTrailSubHeader.module.scss'

const eventsList: SelectOption[] = [
  { label: 'Show All Events', value: 'allEvents' },
  { label: 'Exclude Login Events', value: 'excludeLogin' },
  { label: 'Only Show Login Events', value: 'onlyLogin' }
]

// Creating dummy interface, since some properties are not present
export interface AuditFiltersPayload extends AuditFilterProperties {
  eventType?: string
}

interface AuditTrailSubHeaderProps {
  onApplyFilters: (data: AuditFiltersPayload) => void
  handleDownloadClick?: () => void
}

const AuditTrailSubHeader: React.FC<AuditTrailSubHeaderProps> = ({ handleDownloadClick, onApplyFilters }) => {
  const [filtersPayload, setFiltersPayload] = useState<AuditFiltersPayload>({})
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | null>()
  const [filters, setFilters] = useState<FilterDTO[]>([])

  const fieldToLabelMapping = new Map<string, string>()

  const { data: filterResponse, refetch: refetchFilterList } = useGetFilterList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      type: 'Connector'
    }
  })

  useEffect(() => {
    setFilters(filterResponse?.data?.content || [])
  }, [filterResponse])

  const [openDrawer, closeDrawer] = useModalHook(() => {
    return (
      <FilterDrawer
        onApply={(appliedFilters: AuditFiltersPayload) => {
          setFiltersPayload({
            ...filtersPayload,
            ...appliedFilters
          })
        }}
        filters={filters}
        closeDrawer={closeDrawer}
        refetchFilters={refetchFilterList}
      />
    )
  }, [filters, filtersPayload])

  useEffect(() => {
    onApplyFilters(filtersPayload)
  }, [filtersPayload])

  const onFilterButtonClick = (): void => {
    openDrawer()
  }

  const onEventTypeChange = (selected: SelectOption): void => {
    setFiltersPayload({
      ...filtersPayload,
      eventType: selected.value as string
    })
  }

  return (
    <Page.SubHeader>
      <Layout.Horizontal flex className={css.subHeader}>
        <Layout.Horizontal>
          <DateRangePickerButton
            className={css.dateRangePicker}
            width={240}
            renderButtonText={selectedDates => {
              return `${selectedDates[0].toLocaleDateString()} - ${selectedDates[1].toLocaleDateString()}`
            }}
            initialButtonText="Select Dates" //What should be the placeholder here.
            onChange={([start, end]) => {
              // convert date and time to numbers
              setFiltersPayload({
                ...filtersPayload,
                startTime: start,
                endTime: end
              })
            }}
          />
          <DropDown
            items={eventsList}
            width={170}
            value={filtersPayload?.eventType}
            onChange={onEventTypeChange}
            placeholder="Select event type" //what should be the placeholder here?
          />
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
          <FilterSelector<FilterDTO>
            appliedFilter={appliedFilter}
            filters={filters}
            onFilterBtnClick={onFilterButtonClick}
            onFilterSelect={(option: SelectOption) => {
              if (option.value) {
                const selectedFilter = filters.find(filter => filter.identifier === option.value)
                if (selectedFilter) {
                  setAppliedFilter(selectedFilter)
                }
              } else {
                setAppliedFilter(undefined)
              }
            }}
            fieldToLabelMapping={fieldToLabelMapping}
            filterWithValidFields={{}}
          />
          <Icon onClick={handleDownloadClick} padding={{ left: 'large' }} name="download-light" />
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Page.SubHeader>
  )
}

export default AuditTrailSubHeader
