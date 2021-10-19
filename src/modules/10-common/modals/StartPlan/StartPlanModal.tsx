import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { Editions } from '@common/constants/SubscriptionTypes'
import StartPlanModalContent from './StartPlanModalContent'

import css from './StartPlanModal.module.scss'

export interface UseProjectModalProps {
  handleStartPlan?: () => Promise<void>
  module: Module
  edition?: Editions
}
export interface UseStartPlanModalReturn {
  showModal: () => void
  hideModal: () => void
}

const useStartPlanModal = (props: UseProjectModalProps): UseStartPlanModalReturn => {
  const { handleStartPlan, module, edition } = props

  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        <StartPlanModalContent
          edition={edition}
          module={module}
          handleStartPlan={() => {
            hideModal()
            handleStartPlan?.()
          }}
        />
      </Dialog>
    )
  }, [])

  return {
    showModal,
    hideModal
  }
}

export default useStartPlanModal
