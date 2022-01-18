/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { useModalHook, Button, ButtonVariation } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import EnableTwoFactorAuthView from '@user-profile/modals/EnableTwoFactorAuth/views/EnableTwoFactorView'
import css from './useEnableTwoFactorAuthModal.module.scss'

export interface UseEnableTwoFactorAuthModalReturn {
  openEnableTwoFactorAuthModal: (isReset: boolean) => void
  closeEnableTwoFactorAuthModal: () => void
}

export const useEnableTwoFactorAuthModal = (): UseEnableTwoFactorAuthModalReturn => {
  const [isReset, setIsReset] = useState<boolean>(false)

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog enforceFocus={false} isOpen={true} onClose={hideModal} className={cx(css.dialog, Classes.DIALOG)}>
        <EnableTwoFactorAuthView onEnable={hideModal} onCancel={hideModal} isReset={isReset} />
        <Button
          variation={ButtonVariation.ICON}
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={hideModal}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [isReset]
  )

  const open = useCallback(
    (_isReset: boolean) => {
      setIsReset(_isReset)
      showModal()
    },
    [showModal]
  )
  return {
    openEnableTwoFactorAuthModal: (_isReset: boolean) => open(_isReset),
    closeEnableTwoFactorAuthModal: hideModal
  }
}
