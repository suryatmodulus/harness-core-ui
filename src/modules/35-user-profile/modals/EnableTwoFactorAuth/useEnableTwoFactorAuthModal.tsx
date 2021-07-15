import React, { useCallback, useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
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
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
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
