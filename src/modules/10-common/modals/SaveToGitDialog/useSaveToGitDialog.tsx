import React, { useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router'
import { Entities } from '@common/interfaces/GitSyncInterface'
import SaveToGitForm, {
  GitResourceInterface,
  SaveToGitFormInterface
} from '@common/components/SaveToGitForm/SaveToGitForm'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './useSaveToGitDialog.module.scss'

export interface UseSaveToGitDialogProps {
  onSuccess?: (data: SaveToGitFormInterface) => void
  onClose?: () => void
}

export interface UseSaveToGitDialogReturn {
  openSaveToGitDialog: (isEditing: boolean, resource: GitResourceInterface, _modalProps?: IDialogProps) => void
  hideSaveToGitDialog: () => void
}

const useSaveToGitDialog = (props: UseSaveToGitDialogProps): UseSaveToGitDialogReturn => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [resource, setResource] = useState<GitResourceInterface>({
    type: Entities.CONNECTORS,
    name: '',
    identifier: ''
  })
  const [modalProps, setModalProps] = useState<IDialogProps>({
    isOpen: true,
    style: {
      width: 720,
      minHeight: 540,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const handleSuccess = (data: SaveToGitFormInterface): void => {
    props.onSuccess?.(data)
  }

  const [showModal, hideModal] = useModalHook(() => {
    const closeHandler = (): void => {
      props.onClose?.()
      hideModal()
    }
    return (
      <Dialog className={css.gitDialog} {...modalProps}>
        <GitSyncStoreProvider>
          <SaveToGitForm
            accountId={accountId}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            isEditing={isEditMode}
            resource={resource}
            onSuccess={data => {
              handleSuccess(data)
              hideModal()
            }}
            onClose={closeHandler}
          />
        </GitSyncStoreProvider>
        <Button minimal icon="cross" iconProps={{ size: 18 }} className={css.crossIcon} onClick={closeHandler} />
      </Dialog>
    )
  }, [isEditMode, resource])

  return {
    openSaveToGitDialog: (isEditing: boolean, resourceData: GitResourceInterface, _modalProps?: IDialogProps) => {
      setIsEditMode(isEditing)
      setResource(resourceData)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideSaveToGitDialog: hideModal
  }
}

export default useSaveToGitDialog
