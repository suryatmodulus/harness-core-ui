import React, { useEffect, useState } from 'react'
import {
  SelectOption,
  Layout,
  Icon,
  Select,
  useModalHook,
  Button,
  Text,
  Container,
  Color
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
//import { useStrings } from 'framework/strings'
import cx from 'classnames'
import { Menu, Dialog } from '@blueprintjs/core'
import { GitBranchDTO, GitSyncConfig, syncGitBranchPromise, useGetListOfBranchesWithStatus } from 'services/cd-ng'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './GitFilters.module.scss'

interface GitFilterForm {
  repo: string
  branch: GitBranchDTO['branchName']
}

interface GitFiltersProps {
  defaultValue?: GitFilterForm
  onChange: (value: GitFilterForm) => void
  className?: string
  branchSelectClassName?: string
}

interface BranchSelectOption extends SelectOption {
  branchSyncStatus?: GitBranchDTO['branchSyncStatus']
}

// interface BranchSelectOption {
//   label: string // todo: add support for| JSX.Element in select
//   value: string
// }

const GitFilters: React.FC<GitFiltersProps> = props => {
  const { defaultValue = { repo: '', branch: '' } } = props
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [page] = React.useState<number>(0)

  const defaultRepoSelect: SelectOption = {
    label: 'All Repositories',
    value: ''
  }

  const defaultBranchSelect: BranchSelectOption = {
    label: 'Default Branches',
    value: ''
  }

  const [repoSelectOptions, setRepoSelectOptions] = React.useState<SelectOption[]>([defaultRepoSelect])
  const [selectedGitRepo, setSelectedGitRepo] = useState<string>(defaultValue.repo || '')
  const [selectedGitBranch, setSelectedGitBranch] = useState<string>(defaultValue.branch || '')
  const [branchSelectOptions, setBranchSelectOptions] = React.useState<BranchSelectOption[]>([defaultBranchSelect])
  const [unSyncedSelectedBranch, setUnSyncedSelectedBranch] = React.useState<BranchSelectOption | null>(null)
  const [searchTerm, setSearchTerm] = React.useState<string>('')

  const { data: response, loading, refetch: getListOfBranchesWithStatus } = useGetListOfBranchesWithStatus({
    lazy: true,
    debounce: 500
  })

  useEffect(() => {
    if (!loading && response?.data?.branches?.content?.length) {
      setBranchSelectOptions(
        response.data.branches.content.map((branch: GitBranchDTO) => {
          return {
            label: branch.branchName || '',
            value: branch.branchName || '',
            branchSyncStatus: branch.branchSyncStatus
          }
        })
      )
      setSelectedGitBranch(response?.data?.defaultBranch?.branchName || '')
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  useEffect(() => {
    if (selectedGitRepo && !unSyncedSelectedBranch) {
      getListOfBranchesWithStatus({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          yamlGitConfigIdentifier: selectedGitRepo,
          page,
          size: 10,
          searchTerm
        }
      })
    } else {
      setSelectedGitBranch('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedGitRepo, unSyncedSelectedBranch])

  const startBranchSync = (): void => {
    syncGitBranchPromise({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        repoIdentifier: selectedGitRepo,
        branch: unSyncedSelectedBranch?.value as string
      },
      body: undefined
    })
    setUnSyncedSelectedBranch(null)
  }

  useEffect(() => {
    if (projectIdentifier && gitSyncRepos?.length) {
      const reposAvailable = gitSyncRepos?.map((gitRepo: GitSyncConfig) => {
        return {
          label: gitRepo.name || '',
          value: gitRepo.identifier || ''
        }
      })

      setRepoSelectOptions([defaultRepoSelect].concat(reposAvailable))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitSyncRepos, projectIdentifier])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={!!unSyncedSelectedBranch?.value}
        onClose={() => {
          hideModal()
          setUnSyncedSelectedBranch(null)
        }}
      >
        {unSyncedSelectedBranch?.branchSyncStatus === 'UNSYNCED' ? (
          <Container padding="xlarge">
            <Layout.Horizontal className={'spaceBetween'}>
              <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_800}>
                {'Sync the branch'}
              </Text>
              <Icon size={24} name="refresh"></Icon>
            </Layout.Horizontal>
            <Text margin={{ top: 'medium' }}>{`Branch '${
              unSyncedSelectedBranch.value as string
            }' is currently not Synced.`}</Text>
            <Text margin={{ bottom: 'medium', top: 'small' }}>
              {'Explaination text - What is syncing and why the branch needs to be sync.Do you want to Sync?'}
            </Text>
            <div className={css.btnConatiner}>
              <Button minimal margin={{ right: 'small' }} onClick={() => setUnSyncedSelectedBranch(null)}>
                Cancel
              </Button>
              <Button intent="primary" onClick={() => startBranchSync()}>
                Sync
              </Button>
            </div>
          </Container>
        ) : (
          <Container padding="large" className={css.syncModal}>
            <Icon size={24} margin="large" name="spinner"></Icon>
            <Text color={Color.GREY_800} font={{ weight: 'bold', size: 'medium' }} margin={{ bottom: 'small' }}>
              {'Sync in progress'}
            </Text>
            <Text>
              {
                'Sync in happening in the background, you can check on the status in the branch dropdown. This may take a few minutes to complete.'
              }
            </Text>
            <Button margin={{ top: 'medium' }} intent="primary" onClick={() => setUnSyncedSelectedBranch(null)}>
              OK
            </Button>
          </Container>
        )}

        {/* <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            setUnSyncedSelectedBranch(null)
            hideModal()
          }}
          // className={css.crossIcon}
        /> */}
      </Dialog>
    ),
    [unSyncedSelectedBranch]
  )

  const getSyncIcon = (syncStatus: GitBranchDTO['branchSyncStatus']): JSX.Element | void => {
    switch (syncStatus) {
      case 'SYNCED':
        return <Icon size={20} name="synced"></Icon>

      case 'SYNCING':
        return <Icon className={'rotate'} name="syncing"></Icon>

      case 'UNSYNCED':
        return <Icon name="not-synced"></Icon>
    }
  }

  const handleBranchClick = (branch: BranchSelectOption): void => {
    if (branch.branchSyncStatus === 'SYNCED') {
      setSelectedGitBranch(branch.value as string)
    } else {
      setUnSyncedSelectedBranch(branch)
      showModal()
    }
  }

  return (
    <Layout.Horizontal
      spacing="xsmall"
      margin={{ right: 'small' }}
      className={cx(props.className, css.gitFilterContainer)}
    >
      <Icon padding={{ top: 'small' }} name="repository"></Icon>
      <Select
        name={'repo'}
        className={css.repoSelectDefault}
        value={repoSelectOptions.find(repoOption => repoOption.value === selectedGitRepo)}
        disabled={loadingRepos}
        items={repoSelectOptions}
        onChange={(selected: SelectOption) => {
          setSelectedGitRepo(selected.value as string)
        }}
      ></Select>

      <Icon padding={{ top: 'small' }} margin={{ left: 'large' }} name="git-new-branch"></Icon>
      <Select
        name={'branch'}
        value={branchSelectOptions.find(branchOption => branchOption.value === selectedGitBranch)}
        items={branchSelectOptions}
        disabled={!(selectedGitRepo && !loading)}
        data-id="gitBranchSelect"
        className={cx(props.branchSelectClassName)}
        onQueryChange={(query: string) => setSearchTerm(query)}
        itemRenderer={(item: BranchSelectOption): React.ReactElement => {
          return (
            <Menu.Item
              key={item.value as string}
              active={item.value === selectedGitBranch}
              // disabled={item.branchSyncStatus !== 'SYNCED'}
              onClick={() => handleBranchClick(item)}
              text={
                <Layout.Horizontal className={'spaceBetween'}>
                  <span>{item.label}</span>
                  {item.branchSyncStatus && getSyncIcon(item.branchSyncStatus)}
                </Layout.Horizontal>
              }
            />
          )
        }}
      ></Select>
    </Layout.Horizontal>
  )
}

export default GitFilters
