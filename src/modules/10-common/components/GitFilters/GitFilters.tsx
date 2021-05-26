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
import { isEmpty } from 'lodash-es'

import cx from 'classnames'
import { Menu, Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { GitBranchDTO, GitSyncConfig, syncGitBranchPromise, useGetListOfBranchesWithStatus } from 'services/cd-ng'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'
import css from './GitFilters.module.scss'

export interface GitFilterScope {
  repo: string
  branch: GitBranchDTO['branchName']
  getDefaultFromOtherRepo?: boolean
}

export interface GitFiltersProps {
  defaultValue?: GitFilterScope
  onChange: (value: GitFilterScope) => void
  className?: string
  branchSelectClassName?: string
  showRepoSelector?: boolean
  showBranchSelector?: boolean
}

interface BranchSelectOption extends SelectOption {
  branchSyncStatus?: GitBranchDTO['branchSyncStatus']
}

const branchSyncStatus: Record<string, GitBranchDTO['branchSyncStatus']> = {
  SYNCED: 'SYNCED',
  SYNCING: 'SYNCING',
  UNSYNCED: 'UNSYNCED'
}

const GitFilters: React.FC<GitFiltersProps> = props => {
  const { defaultValue = { repo: '', branch: '' }, showRepoSelector = true, showBranchSelector = true } = props
  const { showSuccess } = useToaster()
  const { getString } = useStrings()
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [page] = React.useState<number>(0)

  const defaultRepoSelect: SelectOption = {
    label: getString('common.gitSync.allRepositories'),
    value: ''
  }

  const defaultBranchSelect: BranchSelectOption = {
    label: getString('common.gitSync.defaultBranches'),
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
    setSelectedGitRepo(defaultValue.repo)
    setSelectedGitBranch(defaultValue.branch || '')
  }, [defaultValue.repo, defaultValue.branch])

  useEffect(() => {
    if (!loading && response?.data?.branches?.content?.length) {
      const defaultBranch = response.data.defaultBranch?.branchName as string
      if (isEmpty(selectedGitBranch)) {
        props.onChange({ repo: selectedGitRepo, branch: defaultBranch })
        setSelectedGitBranch(defaultBranch)
      }
      setBranchSelectOptions(
        response.data.branches.content.map((branch: GitBranchDTO) => {
          return {
            label: branch.branchName || '',
            value: branch.branchName || '',
            branchSyncStatus: branch.branchSyncStatus
          }
        })
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  useEffect(() => {
    if (selectedGitRepo) {
      if (!unSyncedSelectedBranch) {
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
      }
    } else {
      setBranchSelectOptions([defaultBranchSelect])
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
    }).then(() => showSuccess(getString('common.gitSync.syncStartSuccess', { branch: unSyncedSelectedBranch?.value })))
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
          response?.data?.defaultBranch?.branchSyncStatus === branchSyncStatus.SYNCED
            ? setSelectedGitBranch(response?.data?.defaultBranch?.branchName || '')
            : setSelectedGitRepo('')
        }}
      >
        {unSyncedSelectedBranch?.branchSyncStatus === branchSyncStatus.UNSYNCED ? (
          <Container padding="xlarge">
            <Layout.Horizontal flex={{ distribution: 'space-between' }}>
              <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_800}>
                {getString('common.gitSync.unSynced.header')}
              </Text>
              <Icon size={24} name="refresh" />
            </Layout.Horizontal>
            <Text margin={{ top: 'medium' }}>
              {getString('common.gitSync.unSynced.message1', { branch: unSyncedSelectedBranch?.value })}
            </Text>
            <Text margin={{ bottom: 'medium', top: 'small' }}>{getString('common.gitSync.unSynced.message2')}</Text>
            <div className={css.btnConatiner}>
              <Button minimal margin={{ right: 'small' }} onClick={() => setUnSyncedSelectedBranch(null)}>
                {getString('cancel')}
              </Button>
              <Button intent="primary" onClick={() => startBranchSync()}>
                {getString('common.gitSync.sync')}
              </Button>
            </div>
          </Container>
        ) : (
          <Container padding="large" className={css.syncModal}>
            <Icon size={24} margin="large" name="spinner"></Icon>
            <Text color={Color.GREY_800} font={{ weight: 'bold', size: 'medium' }} margin={{ bottom: 'small' }}>
              {getString('common.gitSync.syncing.header')}
            </Text>
            <Text>{getString('common.gitSync.syncing.message')}</Text>
            <Button margin={{ top: 'medium' }} intent="primary" onClick={() => setUnSyncedSelectedBranch(null)}>
              {getString('common.ok')}
            </Button>
          </Container>
        )}
      </Dialog>
    ),
    [unSyncedSelectedBranch]
  )

  const getSyncIcon = (syncStatus: GitBranchDTO['branchSyncStatus']): JSX.Element | void => {
    switch (syncStatus) {
      case branchSyncStatus.SYNCED:
        return <Icon size={20} name="synced" />

      case branchSyncStatus.SYNCING:
        return <Icon className={'rotate'} name="syncing" />

      case branchSyncStatus.UNSYNCED:
        return <Icon name="not-synced" />
    }
  }

  const handleBranchClick = (branch: BranchSelectOption): void => {
    if (branch.branchSyncStatus === branchSyncStatus.SYNCED) {
      const newSelected = branch.value as string
      setSelectedGitBranch(newSelected)
      props.onChange({ repo: selectedGitRepo, branch: newSelected })
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
      {showRepoSelector && (
        <>
          <Icon padding={{ top: 'small' }} name="repository" color={Color.GREY_600}></Icon>
          <Select
            name={'repo'}
            className={css.repoSelectDefault}
            value={repoSelectOptions.find(repoOption => repoOption.value === selectedGitRepo)}
            disabled={loadingRepos}
            data-id="gitRepoSelect"
            items={repoSelectOptions}
            onChange={(selected: SelectOption) => {
              setSelectedGitRepo(selected.value as string)
              !selected.value && props.onChange({ repo: '', branch: '' })
            }}
          ></Select>
        </>
      )}

      {showBranchSelector && (
        <>
          <Icon
            padding={{ top: 'small' }}
            margin={{ left: 'large' }}
            name="git-new-branch"
            color={Color.GREY_600}
          ></Icon>
          <Select
            name={'branch'}
            value={branchSelectOptions.find(branchOption => branchOption.value === selectedGitBranch)}
            items={branchSelectOptions}
            disabled={!selectedGitBranch}
            data-id="gitBranchSelect"
            className={cx(props.branchSelectClassName)}
            onQueryChange={(query: string) => setSearchTerm(query)}
            itemRenderer={(item: BranchSelectOption): React.ReactElement => {
              return (
                <Menu.Item
                  key={item.value as string}
                  active={item.value === selectedGitBranch}
                  onClick={() => handleBranchClick(item)}
                  text={
                    <Layout.Horizontal flex={{ distribution: 'space-between' }}>
                      <span>{item.label}</span>
                      {item.branchSyncStatus && getSyncIcon(item.branchSyncStatus)}
                    </Layout.Horizontal>
                  }
                />
              )
            }}
          ></Select>
        </>
      )}
    </Layout.Horizontal>
  )
}

export default GitFilters
