import React, { useEffect, useState } from 'react'
import { Formik, FormInput, FormikForm, SelectOption, Layout, Icon } from '@wings-software/uicore'

import { noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
//import { useStrings } from 'framework/strings'
import { getListOfBranchesWithStatusPromise, GitBranchDTO, GitSyncConfig } from 'services/cd-ng'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'

interface GitFilter {
  repo: string
  branch: GitBranchDTO
}

interface GitFilterForm {
  repo: string
  branch: GitBranchDTO['branchName']
}

interface GitFiltersProps {
  defaultValue?: GitFilterForm
  onChange: (value: GitFilter) => void
  onChangeCallback?: Function
  className?: string
}

// interface BranchSelectOption {
//   label: string // todo: add support for| JSX.Element in select
//   value: string
// }

const GitFilters: React.FC<GitFiltersProps> = props => {
  const { defaultValue = { repo: '', branch: '' } } = props
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const { accountId, orgIdentifier, projectIdentifier } = useParams()
  const [loadingBranchList, setLoadingBranchList] = React.useState<boolean>(false)
  const [page] = React.useState<number>(0)

  const defaultRepoSelect: SelectOption = {
    label: 'All Repositories',
    value: ''
  }

  const defaultBranchSelect: SelectOption = {
    label: 'Default Branches',
    value: ''
  }

  const [repoSelectOptions, setRepoSelectOptions] = React.useState<SelectOption[]>([defaultRepoSelect])
  const [selectedGitRepo, setSelectedGitRepo] = useState<string>(defaultValue.repo || '')
  const [selectedGitBranch, setSelectedGitBranch] = useState<string>(defaultValue.branch || '')
  const [branchSelectOptions, setBranchSelectOptions] = React.useState<SelectOption[]>([defaultBranchSelect])

  const fetchBranches = (repoId: string): void => {
    setLoadingBranchList(true)
    getListOfBranchesWithStatusPromise({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        yamlGitConfigIdentifier: repoId,
        page,
        size: 10
      }
    }).then(response => {
      setLoadingBranchList(false)

      if (response.data?.content?.length) {
        setBranchSelectOptions(
          response.data.content.map((branch: GitBranchDTO) => {
            return {
              label: `${branch.branchName || ''}  - ${branch.branchSyncStatus || ''}`,
              value: branch.branchName || ''
            }
          })
        )
        setSelectedGitBranch(response.data.content[0].branchName || '')
      }
    })
  }

  // const branchChangeHandler = (branchName: string) => {
  //   setSelectedGitBranch(branchName)
  // }

  useEffect(() => {
    if (projectIdentifier && gitSyncRepos?.length) {
      const reposAvailable = gitSyncRepos?.map((gitRepo: GitSyncConfig) => {
        return {
          label: gitRepo.name || '',
          value: gitRepo.identifier || ''
        }
      })

      setRepoSelectOptions([defaultRepoSelect].concat(reposAvailable))
      if (selectedGitRepo) {
        fetchBranches(selectedGitRepo)
      } else {
        setSelectedGitBranch(defaultValue.branch || '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitSyncRepos, projectIdentifier, selectedGitRepo])

  // useEffect(() => {
  //   props.onChange?.()
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [gitSyncRepos, projectIdentifier, selectedGitRepo])

  return (
    <Formik<GitFilterForm> initialValues={{ repo: selectedGitRepo, branch: selectedGitBranch }} onSubmit={noop}>
      <FormikForm initialValues={defaultValue} onSubmit={noop} className={props.className}>
        <Layout.Horizontal spacing="small" margin={{ right: 'small' }}>
          <Icon padding={{ top: 'xsmall' }} name="repository"></Icon>
          <FormInput.Select
            name={'repo'}
            disabled={loadingRepos}
            items={repoSelectOptions}
            onChange={(selected: SelectOption) => {
              setSelectedGitRepo(selected.value as string)
            }}
          ></FormInput.Select>

          <Icon padding={{ top: 'xsmall' }} name="git-new-branch"></Icon>
          <FormInput.Select
            name={'branch'}
            items={branchSelectOptions}
            disabled={!(selectedGitRepo && !loadingBranchList)}
          />
        </Layout.Horizontal>
      </FormikForm>
    </Formik>
  )
}

export default GitFilters
