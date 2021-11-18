import React, { useState } from 'react'
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

const LoginEventsList: SelectOption[] = [
  { label: 'Show All Events', value: 'allEvents' },
  { label: 'Exclude Login Events', value: 'excludeLogin' },
  { label: 'Only Show Login Events', value: 'onlyLogin' }
]

const AuditTrailSubHeader: React.FC = () => {
  const [startTime, setStartTime] = useState<Date>()
  const [endTime, setEndTime] = useState<Date>()
  const [eventType, setEventType] = useState<SelectOption>()
  const [searchParam, setSearchParam] = useState<string>()
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

  const onDownloadClick = (): void => {
    //empty method
  }

  const onToggleColumn = (): void => {
    //empty method
  }

  const onFilterButtonClick = (): void => {
    openDrawer()
  }

  return (
    <Page.SubHeader>
      <Layout.Horizontal flex className={css.subHeader}>
        <Layout.Horizontal>
          <DateRangePickerButton
            width={232}
            renderButtonText={() => 'Select Date'}
            initialButtonText="Select Date"
            onChange={([start, end]) => {
              setStartTime(start)
              setEndTime(end)
            }}
          />
          <DropDown items={LoginEventsList} width={170} value={eventType?.value?.toString()} onChange={setEventType} />
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
            onFilterBtnClick={onFilterButtonClick}
            onFilterSelect={() => {
              // on Selection of filters
            }}
            fieldToLabelMapping={fieldToLabelMapping}
            filterWithValidFields={{}}
          />
          <Icon onClick={onDownloadClick} padding={{ left: 'large' }} name="download" />
          <Icon onClick={onToggleColumn} padding={{ left: 'large' }} name="remove-column" />
        </Layout.Horizontal>
      </Layout.Horizontal>
    </Page.SubHeader>
  )
}

export default AuditTrailSubHeader
