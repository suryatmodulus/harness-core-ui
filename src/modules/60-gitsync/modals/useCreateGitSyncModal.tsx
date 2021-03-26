import React, { useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router'
import type { GitSyncConfig } from 'services/cd-ng'
import GitSyncRepoForm from '../components/GitSyncRepoForm'
import css from './useCreateGitSyncModal.module.scss'

export interface UseCreateGitSyncModalProps {
  onSuccess?: (data?: GitSyncConfig) => void
  onClose?: () => void
}

export interface UseCreateGitSyncModalReturn {
  openGitSyncModal: (
    creatingFirstRepo: boolean,
    isEditMode: boolean,
    syncRepo: GitSyncConfig | undefined,
    modalProps?: IDialogProps
  ) => void
  hideGitSyncModal: () => void
}

const useCreateGitSyncModal = (props: UseCreateGitSyncModalProps): UseCreateGitSyncModalReturn => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [syncRepo, setSyncRepo] = useState<GitSyncConfig | void>()
  const [modalProps, setModalProps] = useState<IDialogProps>({
    isOpen: true,
    style: {
      width: 1175,
      minHeight: 620,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })
  const { accountId, projectIdentifier, orgIdentifier } = useParams()

  const handleSuccess = (data?: GitSyncConfig): void => {
    props.onSuccess?.(data)
  }

  const [showModal, hideModal] = useModalHook(() => {
    const closeHandler = (): void => {
      props.onClose?.()
      hideModal()
    }
    return (
      <Dialog {...modalProps}>
        <GitSyncRepoForm
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          isEditMode={isEditMode}
          isNewUser={isNewUser}
          gitSyncRepoInfo={undefined}
          onSuccess={(data?: GitSyncConfig) => {
            handleSuccess(data)
            hideModal()
          }}
          onClose={closeHandler}
        />
        <Button minimal icon="cross" iconProps={{ size: 18 }} className={css.crossIcon} onClick={closeHandler} />
      </Dialog>
    )
  }, [isEditMode, syncRepo])

  return {
    openGitSyncModal: (
      creatingFirstRepo: boolean,
      isEditing: boolean,
      gitSyncRepo: GitSyncConfig | undefined,
      _modalProps?: IDialogProps
    ) => {
      setSyncRepo(gitSyncRepo)
      setIsNewUser(creatingFirstRepo)
      setIsEditMode(isEditing)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideGitSyncModal: hideModal
  }
}

export default useCreateGitSyncModal
