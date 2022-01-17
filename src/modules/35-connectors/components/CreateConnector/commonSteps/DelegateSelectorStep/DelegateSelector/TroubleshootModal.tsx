/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useModalHook } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import DelegateInstallationError from '@delegates/components/CreateDelegate/components/DelegateInstallationError/DelegateInstallationError'

export interface UseTroubleshootModalReturn {
  showModal: () => void
  hideModal: () => void
}

export const useTroubleshootModal = (): UseTroubleshootModalReturn => {
  const [showModal, hideModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={Classes.DIALOG}
        style={{
          width: 'auto'
        }}
      >
        <DelegateInstallationError />
      </Dialog>
    )
  }, [])

  return {
    showModal,
    hideModal
  }
}
