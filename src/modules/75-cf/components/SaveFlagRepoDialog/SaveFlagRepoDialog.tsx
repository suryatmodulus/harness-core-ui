import React, { ReactElement, useState } from 'react'
import { Container } from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { GitSyncConfig, GitSyncFolderConfigDTO } from 'services/cd-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { GitRepoRequestRequestBody, useCreateGitRepo } from 'services/cf'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import { DEFAULT_FLAG_GIT_REPO_PATH } from '@cf/constants'
import SaveFlagRepoDialogForm from './SaveFlagRepoDialogForm'
import css from './SaveFlagRepoDialog.module.scss'

export interface SaveFlagRepoDialogProps {
  isOpen: boolean
  closeModal: () => void
  gitRepoRefetch: () => void
}

const SaveFlagRepoDialog = ({ isOpen, closeModal, gitRepoRefetch }: SaveFlagRepoDialogProps): ReactElement => {
  const { projectIdentifier, accountId, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { gitSyncRepos } = useGitSyncStore()

  const [selectedRepoIndex, setSelectedRepoIndex] = useState(0)

  const { showError } = useToaster()
  const { getString } = useStrings()

  const { mutate: createGitRepo } = useCreateGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      org: orgIdentifier
    }
  })

  const initialFormData = {
    repoIdentifier: gitSyncRepos[selectedRepoIndex]?.identifier || '',
    rootFolder: '',
    branch: gitSyncRepos[selectedRepoIndex]?.branch || '',
    filePath: DEFAULT_FLAG_GIT_REPO_PATH
  }

  const repoSelectOptions = gitSyncRepos?.map((gitRepo: GitSyncConfig) => ({
    label: gitRepo.name || '',
    value: gitRepo.identifier || ''
  }))

  const rootFolderSelectOptions =
    gitSyncRepos[selectedRepoIndex]?.gitSyncFolderConfigDTOs?.map((folder: GitSyncFolderConfigDTO) => ({
      label: folder.rootFolder || '',
      value: folder.rootFolder || ''
    })) || []

  const handleRepoOptionChange = (value: string): void => {
    const index = gitSyncRepos.findIndex(repo => repo.identifier === value)

    setSelectedRepoIndex(index)
  }

  const handleCreateGitRepo = async (values: GitRepoRequestRequestBody): Promise<void> => {
    try {
      await createGitRepo({
        ...values
      })

      closeModal()
      gitRepoRefetch()
    } catch (error) {
      showError(getErrorMessage(error), 0, getString('cf.selectFlagRepo.createRepoError'))
    }
  }

  return (
    <Dialog
      enforceFocus={false}
      isOpen={isOpen}
      onClose={() => closeModal()}
      title={getString('cf.selectFlagRepo.dialogTitle')}
    >
      <Container className={css.modalBody}>
        <SaveFlagRepoDialogForm
          initialFormData={initialFormData}
          repoSelectOptions={repoSelectOptions}
          rootFolderSelectOptions={rootFolderSelectOptions}
          handleRepoOptionChange={value => handleRepoOptionChange(value as string)}
          onSubmit={(formData: GitRepoRequestRequestBody) => handleCreateGitRepo(formData)}
          onClose={() => closeModal()}
        />
      </Container>
    </Dialog>
  )
}

export default SaveFlagRepoDialog
