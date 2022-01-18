/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import ModuleInfo from './ModuleInfo'
import css from './useVersionSelectionModal.module.scss'

interface ModalReturn {
  openVersionSelectionModal: () => void
  closeVersionSelectionModal: () => void
}

export const useVersionSelectionModal = (): ModalReturn => {
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen title="" onClose={hideModal} className={css.dialog}>
        <ModuleInfo />
      </Dialog>
    ),
    []
  )

  return {
    openVersionSelectionModal: showModal,
    closeVersionSelectionModal: hideModal
  }
}
