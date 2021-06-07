import { Dialog, IDialogProps } from '@blueprintjs/core'
import { Layout, useModalHook } from '@wings-software/uicore'
import { upperFirst } from 'lodash-es'
import React from 'react'
import { useStrings } from 'framework/strings'
import { DelegateSelectionLogsTask } from './DelegateSelectionLogsTask'
import css from './DelegateSelectionLogs.module.scss'

export interface DelegateTaskData {
  taskId: string
  taskName: string
  delegateName: string
}

export interface UseDelegateSelectionLogsModalReturn {
  openDelegateSelectionLogsModal: (task: DelegateTaskData, modalProps?: IDialogProps) => void
  hideModal: () => void
}

export function useDelegateSelectionLogsModal(): UseDelegateSelectionLogsModalReturn {
  const [delegateTask, setDelegateTask] = React.useState<DelegateTaskData | null>(null)
  const { getString } = useStrings()
  const [modalProps, setModalProps] = React.useState<IDialogProps>({
    isOpen: true,
    title: upperFirst(getString('common.logs.delegateSelectionLogs')),
    isCloseButtonShown: true,
    onClose: () => {
      hideModal()
    },
    style: {
      width: 900,
      minHeight: 240,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        {!!delegateTask && (
          <Layout.Vertical spacing="xxlarge" padding="large" className={css.main}>
            <DelegateSelectionLogsTask task={delegateTask} />
          </Layout.Vertical>
        )}
      </Dialog>
    ),
    [delegateTask, modalProps]
  )
  return {
    openDelegateSelectionLogsModal: (task, _modalProps?: IDialogProps | undefined) => {
      setDelegateTask(task)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideModal
  }
}
