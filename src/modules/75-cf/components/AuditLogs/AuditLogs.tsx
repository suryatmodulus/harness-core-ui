import cx from 'classnames'
import React, { useState } from 'react'
import { Container } from '@wings-software/uicore'
import type { Feature } from 'services/cf'
import { SEVEN_DAYS_IN_MILLIS } from '@cf/utils/CFUtils'
import { AuditLogsToolbar } from './AuditLogsToolbar'
import { AuditLogsList } from './AuditLogsList'

export interface AuditLogsProps {
  flagData: Feature
  objectType: 'FeatureActivation' | 'Segment'
  className?: string
}

export const AuditLogs: React.FC<AuditLogsProps> = ({ className, flagData, objectType }) => {
  const now = Date.now()
  const [startDate, setStartDate] = useState<Date>(new Date(now - SEVEN_DAYS_IN_MILLIS))
  const [endDate, setEndDate] = useState<Date>(new Date(now))

  return (
    <Container className={cx(className)}>
      <AuditLogsToolbar
        startDate={startDate}
        endDate={endDate}
        onSelectedDateRangeChange={selectedDates => {
          setStartDate(selectedDates[0])
          setEndDate(selectedDates[1])
        }}
      />
      <AuditLogsList startDate={startDate} endDate={endDate} flagData={flagData} objectType={objectType} />
    </Container>
  )
}
