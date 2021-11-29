import React, { useState, useEffect } from 'react'
import {
  Page,
  Layout,
  DateRangePickerButton,
  DropDown,
  SelectOption,
  ExpandingSearchInput,
  Icon,
  useModalHook
} from '@wings-software/uicore'
import FilterSelector from '@common/components/Filter/FilterSelector/FilterSelector'
import type { FilterDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import FilterDrawer from '../FilterDrawer/FilterDrawer'
import css from './AuditTrailSubHeader.module.scss'

const eventsList: SelectOption[] = [
  { label: 'Show All Events', value: 'allEvents' },
  { label: 'Exclude Login Events', value: 'excludeLogin' },
  { label: 'Only Show Login Events', value: 'onlyLogin' }
]

export interface TableFiltersPayload {
  startTime?: Date
  endTime?: Date
  eventType?: string
  searchText?: string
  filters?: any
}
interface AuditTrailSubHeaderProps {
  onChange: (data: TableFiltersPayload) => void
  handleDownloadClick?: () => void
  toggleColumn?: () => void
}

const AuditTrailSubHeader: React.FC<AuditTrailSubHeaderProps> = ({ handleDownloadClick, toggleColumn, onChange }) => {
  const [filtersData, setFiltersData] = useState<TableFiltersPayload>({})
  const { getString } = useStrings()

  const fieldToLabelMapping = new Map<string, string>()
  fieldToLabelMapping.set('connectorNames', getString('connectors.name'))
  fieldToLabelMapping.set('connectorIdentifiers', getString('identifier'))
  fieldToLabelMapping.set('description', getString('description'))
  fieldToLabelMapping.set('types', getString('typeLabel'))
  fieldToLabelMapping.set('tags', getString('tagsLabel'))
  fieldToLabelMapping.set('connectivityStatuses', getString('connectivityStatus'))

  const [openDrawer, closeDrawer] = useModalHook(() => {
    return <FilterDrawer closeDrawer={closeDrawer} />
  })

  useEffect(() => {
    onChange(filtersData)
  }, [filtersData])

  const onFilterButtonClick = (): void => {
    openDrawer()
  }

  const onEventTypeChange = (selected: SelectOption): void => {
    setFiltersData({
      ...filtersData,
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
              setFiltersData({
                ...filtersData,
                startTime: start,
                endTime: end
              })
            }}
          />
          <DropDown
            items={eventsList}
            width={170}
            value={filtersData?.eventType?.toString()}
            onChange={onEventTypeChange}
            placeholder="Select event type" //what should be the placeholder here?
          />
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
          <ExpandingSearchInput
            alwaysExpanded
            className={css.search}
            onChange={text => {
              setFiltersData({
                ...filtersData,
                searchText: text
              })
            }}
            width={300}
          />
          <FilterSelector<FilterDTO>
            onFilterBtnClick={onFilterButtonClick}
            onFilterSelect={() => {
              // on Selection of filters
            }}
            fieldToLabelMapping={fieldToLabelMapping}
            filterWithValidFields={{}}
          />
          <Icon onClick={handleDownloadClick} padding={{ left: 'large' }} name="download-light" />
          <Icon onClick={toggleColumn} padding={{ left: 'large' }} name="toggle-column" />
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Page.SubHeader>
  )
}

export default AuditTrailSubHeader
