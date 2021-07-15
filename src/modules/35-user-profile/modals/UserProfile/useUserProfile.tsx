import React, { useCallback, useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import type { UserInfo } from 'services/cd-ng'
import EditUserProfile from './views/EditUserProfile'
import css from './useUserProfile.module.scss'

export interface UseUserProfileProps {
  onSuccess?: () => void
  onCloseModal?: () => void
}

export interface UseUserProfileReturn {
  openUserProfile: (user: UserInfo) => void
  closeUserProfile: () => void
}

export const useUserProfile = ({ onSuccess }: UseUserProfileProps): UseUserProfileReturn => {
  const [user, setUser] = useState<UserInfo>()
  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        className={cx(css.dialog, Classes.DIALOG)}
      >
        {user && (
          <EditUserProfile
            user={user}
            onSubmit={() => {
              onSuccess?.()
              hideModal()
            }}
            onClose={hideModal}
          />
        )}

        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [user]
  )

  const open = useCallback(
    (_user: UserInfo) => {
      setUser(_user)
      showModal()
    },
    [showModal]
  )

  return {
    openUserProfile: (_user: UserInfo) => open(_user),
    closeUserProfile: hideModal
  }
}
