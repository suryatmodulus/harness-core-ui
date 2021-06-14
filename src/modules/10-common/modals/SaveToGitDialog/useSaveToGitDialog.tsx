import React, { useState } from 'react'
import { useModalHook, Button } from '@wings-software/uicore'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router'
import { noop } from 'lodash-es'
import { Entities } from '@common/interfaces/GitSyncInterface'
import SaveToGitForm, {
  GitResourceInterface,
  SaveToGitFormInterface
} from '@common/components/SaveToGitForm/SaveToGitForm'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { EntityGitDetails, ResponseMessage, useCreatePR } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ProgressOverlay, StepStatus } from '../ProgressOverlay/ProgressOverlay'
import { useGitDiffEditorDialog } from '../GitDiffEditor/useGitDiffEditorDialog'
import css from './useSaveToGitDialog.module.scss'

export interface UseSaveSuccessResponse {
  status?: 'SUCCESS' | 'FAILURE' | 'ERROR'
  nextCallback?: () => void
}

export interface UseSaveToGitDialogProps<T> {
  onSuccess?: (
    data: SaveToGitFormInterface,
    payload?: T,
    objectId?: EntityGitDetails['objectId']
  ) => Promise<UseSaveSuccessResponse>
  onClose?: () => void
}

export interface OpenSaveToGitDialogValue<T> {
  isEditing: boolean
  resource: GitResourceInterface
  payload: T
  _modalProps?: IDialogProps
}

export interface UseSaveToGitDialogReturn<T> {
  openSaveToGitDialog: (args: OpenSaveToGitDialogValue<T>) => void
  hideSaveToGitDialog: () => void
}

export function useSaveToGitDialog<T = Record<string, string>>(
  props: UseSaveToGitDialogProps<T>
): UseSaveToGitDialogReturn<T> {
  const [isEditMode, setIsEditMode] = useState(false)
  const [payloadData, setPayloadData] = useState<T>()
  const [resource, setResource] = useState<GitResourceInterface>({
    type: Entities.CONNECTORS,
    name: '',
    identifier: ''
  })
  const { getString } = useStrings()
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

  // Status Dialog States
  const [prCreateStatus, setPRCreateStatus] = useState<StepStatus>()
  const [prMetaData, setPRMetaData] = useState<
    Pick<SaveToGitFormInterface, 'branch' | 'targetBranch' | 'isNewBranch'>
  >()
  const [nextCallback, setNextCallback] = useState<UseSaveSuccessResponse['nextCallback']>()
  const [error, setError] = useState<Error>()
  const [createUpdateStatus, setCreateUpdateStatus] = useState<StepStatus>()
  const { mutate: createPullRequest, loading: creatingPR } = useCreatePR({})
  let entity = resource.type || ''
  entity = (entity.endsWith('s') ? entity.substring(0, entity.length - 1) : entity).toLowerCase()

  const entityCreateUpdateStage = {
    status: createUpdateStatus,
    intermediateLabel: isEditMode
      ? getString('common.updating', { name: resource.name, entity })
      : getString('common.creating', { name: resource.name, entity }),
    finalLabel: `${error?.message}`
  }
  const fromBranch = prMetaData?.branch || ''
  const toBranch = prMetaData?.targetBranch || ''
  const setupBranchStage = {
    status: createUpdateStatus,
    intermediateLabel: getString('common.gitSync.settingUpNewBranch', {
      branch: fromBranch
    })
  }
  const pushingChangesToBranch = {
    status: createUpdateStatus,
    intermediateLabel: getString('common.gitSync.pushingChangestoBranch', {
      branch: fromBranch
    })
  }
  const createPRStage = {
    status: prCreateStatus,
    intermediateLabel: getString('common.gitSync.creatingPR', {
      fromBranch,
      toBranch
    }),
    finalLabel: getString('common.gitSync.unableToCreatePR')
  }
  // Dialogs
  // modal to show when a git conflict occurs
  const { openGitDiffDialog } = useGitDiffEditorDialog({
    onSuccess: (payload, objectId: EntityGitDetails['objectId'], gitData?: SaveToGitFormInterface): void => {
      try {
        if (gitData) {
          handleSuccess(gitData, payload as T, objectId)
        }
      } catch (e) {
        //ignore error
      }
    },
    onClose: noop
  })
  // modal to show while creating/updating an entity and creating a PR
  const [showCreateUpdateWithPRCreationModal, hideCreateUpdateWithPRCreationModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        className={Classes.DIALOG}
        style={{
          minWidth: 600,
          paddingBottom: 0,
          maxHeight: 500
        }}
      >
        <ProgressOverlay
          preFirstStage={prMetaData?.isNewBranch ? setupBranchStage : undefined}
          firstStage={entityCreateUpdateStage}
          postFirstStage={pushingChangesToBranch}
          secondStage={createPRStage}
          onClose={() => {
            hideCreateUpdateWithPRCreationModal()
            if (createUpdateStatus === 'SUCCESS') {
              nextCallback?.()
            }
          }}
        />
      </Dialog>
    )
  }, [creatingPR, createUpdateStatus, error, prCreateStatus, prMetaData])
  //modal to show while only creating/updating an entity
  const [showCreateUpdateModal, hideCreateUpdateModal] = useModalHook(() => {
    return (
      <Dialog
        isOpen={true}
        className={Classes.DIALOG}
        style={{
          minWidth: 600,
          paddingBottom: 0,
          maxHeight: 500
        }}
      >
        <ProgressOverlay
          firstStage={entityCreateUpdateStage}
          postFirstStage={{
            status: createUpdateStatus,
            intermediateLabel: getString('common.gitSync.pushingChangestoBranch', {
              branch: resource.gitDetails?.branch
            })
          }}
          onClose={() => {
            hideCreateUpdateModal()
            if (createUpdateStatus === 'SUCCESS') {
              nextCallback?.()
            }
          }}
        />
      </Dialog>
    )
  }, [createUpdateStatus, error])
  const handleSuccess = (data: SaveToGitFormInterface, diffData?: T, objectId?: EntityGitDetails['objectId']): void => {
    setCreateUpdateStatus('IN_PROGRESS')
    if (data?.createPr) {
      setPRMetaData({ branch: data?.branch, targetBranch: data?.targetBranch, isNewBranch: data?.isNewBranch })
      setPRCreateStatus('IN_PROGRESS')
      showCreateUpdateWithPRCreationModal()
    } else {
      showCreateUpdateModal()
    }
    props
      .onSuccess?.(data, diffData, objectId)
      .then(async response => {
        setNextCallback(() => response?.nextCallback)
        setCreateUpdateStatus(response.status)

        // if entity creation/update succeeds, raise a PR, if specified
        if (response.status === 'SUCCESS') {
          if (data?.createPr) {
            try {
              const _response = await createPullRequest(
                {
                  sourceBranch: data?.branch || '',
                  targetBranch: data?.targetBranch || '',
                  title: data?.commitMsg || ''
                },
                {
                  queryParams: {
                    accountIdentifier: accountId,
                    orgIdentifier,
                    projectIdentifier,
                    yamlGitConfigIdentifier: data?.repoIdentifier || ''
                  }
                }
              )
              setPRCreateStatus(_response?.status)
            } catch (e) {
              setPRCreateStatus('ERROR')
            }
          }
        }
        // if entity creation/update fails, abort PR creation
        else {
          if (data?.createPr) {
            setPRCreateStatus('ABORTED')
          }
          throw response
        }
      })
      .catch(e => {
        setError(e)
        setCreateUpdateStatus('ERROR')
        if (data?.createPr) {
          setPRCreateStatus('ABORTED')
        }
        if (
          ((e.data?.responseMessages as ResponseMessage[]) || [])?.findIndex(
            (mssg: ResponseMessage) => mssg.code === 'SCM_CONFLICT_ERROR'
          ) !== -1
        ) {
          openGitDiffDialog(payloadData, data)
        }
      })
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
              handleSuccess(data, undefined, resource.gitDetails?.objectId)
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
    openSaveToGitDialog: ({ isEditing, resource: resourceData, _modalProps, payload }: OpenSaveToGitDialogValue<T>) => {
      setIsEditMode(isEditing)
      setPayloadData(payload)
      setResource(resourceData)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideSaveToGitDialog: hideModal
  }
}
