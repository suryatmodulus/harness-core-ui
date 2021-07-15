import React from 'react'
import {
  Button,
  Container,
  DateRangePickerButton,
  DateRangePickerButtonProps,
  FlexExpander,
  Layout
} from '@wings-software/uicore'
import type { ContainerProps } from '@wings-software/uicore/dist/components/Container/Container'
import { useStrings } from 'framework/strings'

export interface AuditLogsToolbar extends ContainerProps {
  startDate: Date
  endDate: Date
  onSelectedDateRangeChange: DateRangePickerButtonProps['onChange']
}

export const AuditLogsToolbar: React.FC<AuditLogsToolbar> = ({
  startDate,
  endDate,
  onSelectedDateRangeChange,
  ...props
}) => {
  const { getString } = useStrings()

  return (
    <Container
      flex
      padding="medium"
      style={{ borderBottom: '1px solid var(--grey-250)', paddingLeft: 'var(--spacing-large)' }}
      {...props}
    >
      <DateRangePickerButton
        initialButtonText={getString('common.last7days')}
        rightIcon={undefined}
        icon="calendar"
        dateRangePickerProps={{
          defaultValue: [startDate, endDate]
          // TODO: Bug in component not to be able to select time properly
          // timePrecision: TimePrecision.MINUTE,
          // timePickerProps: {
          //   showArrowButtons: true
          // }
        }}
        renderButtonText={selectedDates => {
          return `${selectedDates[0].toLocaleDateString()} - ${selectedDates[1].toLocaleDateString()}`
        }}
        onChange={selectedDates => {
          onSelectedDateRangeChange(selectedDates)
        }}
      />
      <FlexExpander />
      <Layout.Horizontal spacing="small" style={{ display: 'none' }}>
        {/* <ExpandingSearchInput name="search" placeholder={getString('cf.auditLogs.searchPlaceholder')} /> */}
        <Button minimal icon="main-search" disabled />
        <Button minimal icon="settings" disabled />
      </Layout.Horizontal>
    </Container>
  )
}
