import { Color, Container, FormInput, Icon, Layout, Select, SelectOption, Text } from '@wings-software/uicore'
import type { FormikContext } from 'formik'
import React from 'react'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { GitSyncConfig, EntityGitDetails, useGetListOfBranchesWithStatus, GitBranchDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export interface GitContextFormProps<T> {
  formikProps: FormikContext<T>
  gitDetails?: EntityGitDetails
  className?: string
}

export interface GitContextProps {
  repo: string
  branch: string
}

const branchSyncStatus: Record<string, GitBranchDTO['branchSyncStatus']> = {
  SYNCED: 'SYNCED',
  SYNCING: 'SYNCING',
  UNSYNCED: 'UNSYNCED'
}

/**
 * GitContextForm can be used inside any form as a subForm to set Git context
 * @param gitContextFormProps: GitContextFormProps
 */
const GitContextForm: React.FC<GitContextFormProps<Record<string, any> & GitContextProps>> = gitContextFormProps => {
  const { getString } = useStrings()
  const { gitDetails, formikProps } = gitContextFormProps
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const [repoSelectOptions, setRepoSelectOptions] = React.useState<SelectOption[]>([])
  const isEditing = !!gitDetails?.objectId
  const defaultBranchSelect: SelectOption = {
    label: gitDetails?.branch ?? (gitSyncRepos[0]?.branch || ''),
    value: gitDetails?.branch ?? (gitSyncRepos[0]?.branch || '')
  }

  const [branchSelectOptions, setBranchSelectOptions] = React.useState<SelectOption[]>([defaultBranchSelect])
  const [searchTerm, setSearchTerm] = React.useState<string>('')

  React.useEffect(() => {
    if (gitSyncRepos?.length && !loadingRepos) {
      const reposAvailable = gitSyncRepos?.map((gitRepo: GitSyncConfig) => {
        return {
          label: gitRepo.name || '',
          value: gitRepo.identifier || ''
        }
      })
      formikProps.setFieldValue('repo', gitDetails?.repoIdentifier ?? gitSyncRepos[0]?.identifier)
      formikProps.setFieldValue('branch', gitDetails?.branch ?? gitSyncRepos[0]?.branch)
      setRepoSelectOptions(reposAvailable)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingRepos])

  const {
    data: branchList,
    loading: loadingBranchList,
    refetch: getListOfBranchesWithStatus
  } = useGetListOfBranchesWithStatus({
    lazy: true,
    debounce: 500
  })

  React.useEffect(() => {
    !isEditing &&
      getListOfBranchesWithStatus({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          yamlGitConfigIdentifier: formikProps.values.repo,
          page: 0,
          size: 20,
          searchTerm
        }
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, formikProps.values.repo])

  React.useEffect(() => {
    if (!loadingBranchList && branchList?.data?.branches?.content?.length) {
      const defaultBranch = branchList.data.defaultBranch?.branchName as string
      formikProps.setFieldValue('branch', defaultBranch)

      const syncedBranchOption: SelectOption[] = []

      branchList.data.branches.content.forEach((branch: GitBranchDTO) => {
        if (branch.branchSyncStatus === branchSyncStatus.SYNCED) {
          syncedBranchOption.push({
            label: branch.branchName || '',
            value: branch.branchName || ''
          })
        }
      })

      setBranchSelectOptions(syncedBranchOption)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingBranchList])

  return (
    <Container
      border={{ top: true }}
      padding={{ top: 'medium', bottom: 'medium' }}
      className={cx(gitContextFormProps.className)}
    >
      <Text margin={{ top: 'small', bottom: 'small' }}>
        {getString('common.gitSync.gitRepositoryDetails').toUpperCase()}
      </Text>
      <FormInput.Select
        name="repo"
        label={getString('common.git.selectRepoLabel')}
        items={repoSelectOptions}
        disabled={loadingRepos || isEditing}
        onChange={(selected: SelectOption) => {
          const selectedRepo = gitSyncRepos.find((repo: GitSyncConfig) => repo.identifier === selected.value)
          formikProps.setFieldValue('branch', selectedRepo?.branch)
        }}
      />
      <Text color={Color.GREY_300}>{getString('common.gitSync.selectBranchLabel')}</Text>
      <Layout.Horizontal spacing="small">
        <Select
          name="branch"
          value={branchSelectOptions.find(branchOption => branchOption.value === formikProps.values.branch)}
          items={branchSelectOptions}
          onQueryChange={(query: string) => setSearchTerm(query)}
          disabled={loadingBranchList || isEditing}
          onChange={selected => formikProps.setFieldValue('branch', selected.value)}
        />
        {loadingBranchList && <Icon margin={{ top: 'xsmall' }} name="spinner" />}
      </Layout.Horizontal>
    </Container>
  )
}

export default GitContextForm
