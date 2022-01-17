/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import type { Module } from '@common/interfaces/RouteInterfaces'
import StartTrialModalContent from './StartTrialModalContent'

import css from './StartTrialModal.module.scss'

export interface UseProjectModalProps {
  handleStartTrial?: () => Promise<void>
  module: Module
}
export interface UseStartTrialModalReturn {
  showModal: () => void
  hideModal: () => void
}

const useStartTrialModal = (props: UseProjectModalProps): UseStartTrialModalReturn => {
  const { handleStartTrial, module } = props

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
        <StartTrialModalContent
          module={module}
          handleStartTrial={() => {
            hideModal()
            handleStartTrial?.()
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

export default useStartTrialModal
