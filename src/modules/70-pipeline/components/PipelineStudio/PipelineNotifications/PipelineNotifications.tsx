import React, { useState } from 'react'
import { isNil } from 'lodash-es'
import produce from 'immer'
import NotificationTable, { NotificationRulesItem } from '@pipeline/components/Notifications/NotificationTable'
import type { NotificationRules } from 'services/pipeline-ng'
import { Actions } from '@pipeline/components/Notifications/NotificationUtils'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { getStagesMultiSelectOptionFromPipeline } from '../CommonUtils/CommonUtils'
import css from './PipelineNotifications.module.scss'

const PAGE_SIZE = 10

export const PipelineNotifications: React.FC = (): JSX.Element => {
  const {
    state: { pipeline },
    updatePipeline,
    isReadonly
  } = React.useContext(PipelineContext)

  const [page, setPage] = React.useState(0)

  const [selectedNotificationTypeFilter, setSelectedNotificationTypeFilter] = useState<string | undefined>(undefined)

  const allRowsData: NotificationRulesItem[] = (pipeline.notificationRules || []).map(
    (notificationRules: NotificationRules, index: number) => ({
      index,
      notificationRules
    })
  )

  // filter table data
  let data = allRowsData
  if (selectedNotificationTypeFilter) {
    data = allRowsData.filter(
      item => item.notificationRules.notificationMethod?.type === selectedNotificationTypeFilter
    )
  }

  return (
    <div className={css.pipelineNotifications}>
      <NotificationTable
        data={data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
        stagesOptions={getStagesMultiSelectOptionFromPipeline(pipeline)}
        getExistingNotificationNames={(skipIndex?: number): string[] => {
          return allRowsData.filter(item => item.index !== skipIndex).map(item => item.notificationRules.name!)
        }}
        pageIndex={page}
        totalPages={Math.ceil(data.length / PAGE_SIZE)}
        pageItemCount={PAGE_SIZE}
        pageSize={PAGE_SIZE}
        filterType={selectedNotificationTypeFilter}
        totalItems={data.length}
        gotoPage={index => {
          setPage(index)
        }}
        onFilterType={type => {
          setSelectedNotificationTypeFilter(type)
        }}
        onUpdate={(notificationItem, action, closeModal) => {
          const index = notificationItem?.index
          const notification = notificationItem?.notificationRules
          if (action === Actions.Delete) {
            updatePipeline(
              produce(pipeline, draft => {
                draft.notificationRules?.splice(index || 0, 1)
              })
            )
          } else if (action === Actions.Added && notification) {
            updatePipeline(
              produce(pipeline, draft => {
                if (isNil(draft.notificationRules)) {
                  draft.notificationRules = []
                }
                notification.enabled = true
                draft.notificationRules.unshift(notification)
              })
            ).then(() => {
              closeModal?.()
            })
          } else if (action === Actions.Update && notification) {
            updatePipeline(
              produce(pipeline, draft => {
                draft.notificationRules?.splice(index || 0, 1, notification)
              })
            ).then(() => {
              closeModal?.()
            })
          }
        }}
        isReadonly={isReadonly}
      />
    </div>
  )
}
