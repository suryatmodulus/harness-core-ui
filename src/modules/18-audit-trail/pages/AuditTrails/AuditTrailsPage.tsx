import React, { useState } from 'react'
import { Color, DateRangePickerButton, FontVariation, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import { useGetAuditList } from 'services/audit'
import { useStrings } from 'framework/strings'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { AuditFilterProperties } from 'services/audit'
import { useMutateAsGet } from '@common/hooks'
import AuditTrailsListView from './views/AuditTrailsListView'
import AuditTrailsEmptyState from './audit_trails_empty_state.png'
import css from './AuditTrailsPage.module.scss'

const AuditTrailsPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [page, setPage] = useState(0)
  const [selectedFilterProperties] = useState<AuditFilterProperties>()
  const { getString } = useStrings()
  const [startDate, setStartDate] = useState<Date>(() => {
    const start = new Date()
    start.setDate(start.getDate() - 7)
    start.setHours(0, 0, 0, 0)
    return start
  })

  const [endDate, setEndDate] = useState<Date>(() => {
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return end
  })

  const onDateChange = (selectedDates: [Date, Date]): void => {
    setStartDate(selectedDates[0])
    setEndDate(selectedDates[1])
  }

  const {
    data: auditData,
    loading,
    error,
    refetch
  } = useMutateAsGet(useGetAuditList, {
    queryParams: {
      accountIdentifier: accountId,
      pageSize: 10,
      pageIndex: page
    },
    body: {
      scopes: [{ accountIdentifier: accountId, orgIdentifier, projectIdentifier }],
      ...selectedFilterProperties,
      filterType: 'Audit',
      startTime: startDate.getTime(),
      endTime: endDate.getTime()
    }
  })

  return (
    <>
      <Page.Header
        title={getString('common.auditTrail')}
        breadcrumbs={<NGBreadcrumbs />}
        content={
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600}>
            {getString('auditTrail.externalDataText')}
            <a target="_blank" href="https://harness.io/docs/api/tag/Audits" rel="noreferrer">
              {` ${getString('auditTrail.auditLogAPI')}`}
            </a>
          </Text>
        }
      />
      <Page.SubHeader className={css.subHeaderContainer}>
        <Layout.Horizontal flex className={css.subHeader}>
          <DateRangePickerButton
            width={240}
            className={css.dateRange}
            initialButtonText={getString('common.last7days')}
            dateRangePickerProps={{ defaultValue: [startDate, endDate] }}
            onChange={onDateChange}
            renderButtonText={selectedDates =>
              `${selectedDates[0].toLocaleDateString()} - ${selectedDates[1].toLocaleDateString()}`
            }
          />
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body
        className={css.pageBody}
        noData={{
          when: () => !auditData?.data?.content?.length,
          image: AuditTrailsEmptyState,
          imageClassName: css.emptyStateImage,
          messageTitle: getString('auditTrail.emptyStateMessageTitle'),
          message: getString('auditTrail.emptyStateMessage')
        }}
        error={(error as any)?.data?.message || error?.message}
        retryOnError={() => refetch()}
        loading={loading}
      >
        <AuditTrailsListView setPage={setPage} data={auditData?.data || {}} />
      </Page.Body>
    </>
  )
}

export default AuditTrailsPage
