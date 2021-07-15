import React, { useState } from 'react'
import { useModalHook, Button, StepWizard } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router'
import type { GitSyncConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import GitSyncRepoFormStep from '@gitsync/pages/steps/GitSyncRepoFormStep'
import GitConnection from '@gitsync/components/GitConnection/GitConnection'
import GitSyncRepoForm from '../components/gitSyncRepoForm/GitSyncRepoForm'
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
  const { getString } = useStrings()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [syncRepo, setSyncRepo] = useState<GitSyncConfig | void>()
  const [modalProps, setModalProps] = useState<IDialogProps>({
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 1200,
      minHeight: 720,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const handleSuccess = (data?: GitSyncConfig): void => {
    props.onSuccess?.(data)
  }

  const [showModal, hideModal] = useModalHook(() => {
    const closeHandler = (): void => {
      props.onClose?.()
      hideModal()
    }

    return isNewUser ? (
      <Dialog {...modalProps}>
        <StepWizard
          stepClassName={css.noPadding}
          title={getString('enableGitExperience')}
          icon="git-landing-page"
          iconProps={{ size: 80, className: css.icon }}
        >
          <GitSyncRepoFormStep
            name={getString('gitsync.configureHarnessFolder')}
            accountId={accountId}
            isEditMode={isEditMode}
            isNewUser={isNewUser}
            gitSyncRepoInfo={undefined}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            onClose={closeHandler}
          />
          <GitConnection
            name={getString('gitsync.selectConnectivityMode')}
            onSuccess={(data?: GitSyncConfig) => {
              handleSuccess(data)
            }}
          />
        </StepWizard>
        <Button minimal icon="cross" iconProps={{ size: 18 }} className={css.crossIcon} onClick={closeHandler} />
      </Dialog>
    ) : (
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
  }, [isEditMode, syncRepo, isNewUser])

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
