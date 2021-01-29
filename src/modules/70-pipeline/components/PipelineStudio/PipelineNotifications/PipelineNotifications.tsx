import React from 'react'
import { Text } from '@wings-software/uicore'
import { get, isNil } from 'lodash-es'
import produce from 'immer'
import { String } from 'framework/exports'
import NotificationTable from '@pipeline/components/Notifications/NotificationTable'
import type { NotificationRules } from 'services/pipeline-ng'
import { Actions } from '@pipeline/components/Notifications/NotificationUtils'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import css from './PipelineNotifications.module.scss'

const PAGE_SIZE = 5

export const PipelineNotifications: React.FC = (): JSX.Element => {
  const {
    state: { pipeline },
    updatePipeline
  } = React.useContext(PipelineContext)
  const data: NotificationRules[] = get(pipeline, 'notificationRules', [])
  const [page, setPage] = React.useState(0)

  return (
    <div className={css.pipelineNotifications}>
      <div className={css.header}>
        <Text inline font={{ size: 'medium' }} icon="yaml-builder-notifications">
          <String stringID="notifications" />
        </Text>
      </div>
      <div className={css.content}>
        <NotificationTable
          data={data.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
          pageIndex={page}
          totalPages={Math.ceil(data.length / PAGE_SIZE)}
          pageItemCount={PAGE_SIZE}
          pageSize={PAGE_SIZE}
          totalItems={data.length}
          gotoPage={setPage}
          onUpdate={(notification, _index = 0, action, closeModal) => {
            const index = page * PAGE_SIZE + _index
            if (action === Actions.Delete) {
              updatePipeline(
                produce(pipeline, draft => {
                  ;(draft as any).notificationRules.splice(index, 1)
                })
              )
            } else if (action === Actions.Added && notification) {
              updatePipeline(
                produce(pipeline, draft => {
                  if (isNil((draft as any).notificationRules)) {
                    ;(draft as any).notificationRules = []
                  }
                  notification.enabled = true
                  ;(draft as any).notificationRules.unshift(notification)
                })
              ).then(() => {
                closeModal?.()
              })
            } else if (action === Actions.Update && notification) {
              updatePipeline(
                produce(pipeline, draft => {
                  ;(draft as any).notificationRules.splice(index, 1, notification)
                })
              ).then(() => {
                closeModal?.()
              })
            }
          }}
        />
      </div>
    </div>
  )
}
