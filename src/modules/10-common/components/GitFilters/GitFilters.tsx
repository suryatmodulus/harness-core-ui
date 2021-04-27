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
import { getListOfBranchesWithStatusPromise, GitBranchDTO, GitSyncConfig, syncGitBranchPromise } from 'services/cd-ng'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import css from './GitFilters.module.scss'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { debounce } from 'lodash-es'

interface GitFilterForm {
  repo: string
  branch: GitBranchDTO['branchName']
}

interface GitFiltersProps {
  defaultValue?: GitFilterForm
  onChange: (value: GitFilterForm) => void
  onChangeCallback?: Function
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
  const [loadingBranchList, setLoadingBranchList] = React.useState<boolean>(false)
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

  const fetchBranches = (repoId: string): void => {
    setLoadingBranchList(true)

    getListOfBranchesWithStatusPromise({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        yamlGitConfigIdentifier: repoId,
        page,
        size: 10,
        searchTerm
      }
    }).then(response => {
      setLoadingBranchList(false)

      if (response.data?.content?.length) {
        setBranchSelectOptions(
          response.data.content.map((branch: GitBranchDTO) => {
            return {
              label: branch.branchName || '',
              value: branch.branchName || '',
              branchSyncStatus: branch.branchSyncStatus
            }
          })
        )
        setSelectedGitBranch(response.data.content[0].branchName || '')
      }
    })
  }

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

  useEffect(() => {
    if (selectedGitRepo) {
      fetchBranches(selectedGitRepo)
    } else {
      setSelectedGitBranch(defaultValue.branch || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGitRepo, searchTerm])

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

  const getSyncIcon = (syncStatus: GitBranchDTO['branchSyncStatus']) => {
    switch (syncStatus) {
      case 'UNSYNCED':
        return (
          <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 8.07884C19.9982 9.21368 19.5466 10.3015 18.7442 11.104C17.9417 11.9064 16.8539 12.358 15.719 12.3598H14.0732C14.1789 12.0522 14.246 11.7326 14.273 11.4085C14.2825 11.2753 14.2921 11.1421 14.2921 11.0089C14.2921 9.87354 13.841 8.78466 13.0382 7.98182C12.2354 7.17899 11.1465 6.72796 10.0111 6.72796C8.87571 6.72796 7.78683 7.17899 6.984 7.98182C6.18116 8.78466 5.73013 9.87354 5.73013 11.0089C5.73013 11.1421 5.73965 11.2753 5.74916 11.4085C5.77617 11.7326 5.84328 12.0522 5.94894 12.3598H3.35182C2.50453 12.3654 1.68697 12.0479 1.06567 11.4717C0.444373 10.8956 0.0660862 10.1043 0.00787304 9.259C-0.0503401 8.41369 0.215899 7.57799 0.752355 6.92214C1.28881 6.26629 2.05512 5.83962 2.89519 5.72906C2.998 4.33425 3.57061 3.01549 4.51955 1.98807C5.46849 0.960658 6.7377 0.285279 8.11997 0.0721975C9.50224 -0.140884 10.9159 0.120919 12.1302 0.814866C13.3445 1.50881 14.2877 2.59391 14.8058 3.89301C15.1057 3.82747 15.412 3.79556 15.719 3.79788C16.8539 3.79964 17.9417 4.25123 18.7442 5.05369C19.5466 5.85614 19.9982 6.944 20 8.07884ZM7.65656 8.57828C7.59928 8.63591 7.55771 8.70725 7.53582 8.78551C7.51394 8.86376 7.51246 8.94632 7.53154 9.02531C7.55062 9.1043 7.58962 9.17708 7.64481 9.23671C7.7 9.29635 7.76955 9.34085 7.84683 9.36598L9.22815 9.82642C9.28804 9.84894 9.35186 9.85915 9.41579 9.85643C9.47971 9.85372 9.54243 9.83813 9.6002 9.81061C9.65796 9.78308 9.70957 9.74419 9.75195 9.69625C9.79433 9.64831 9.82661 9.59232 9.84684 9.53162C9.86707 9.47092 9.87485 9.40676 9.86971 9.34298C9.86457 9.2792 9.84661 9.21712 9.81692 9.16044C9.78722 9.10377 9.7464 9.05366 9.69689 9.01313C9.64738 8.9726 9.5902 8.94248 9.52877 8.92456L9.04169 8.76189C9.48294 8.5713 9.97084 8.51603 10.4435 8.60308C10.9162 8.69013 11.3524 8.91559 11.6968 9.25087C11.9624 9.51775 12.1611 9.84358 12.2768 10.2018C12.3926 10.5601 12.422 10.9406 12.3628 11.3124C12.3529 11.3741 12.3552 11.4372 12.3697 11.498C12.3842 11.5588 12.4105 11.6161 12.4472 11.6668C12.4838 11.7174 12.5301 11.7603 12.5834 11.793C12.6367 11.8258 12.6958 11.8477 12.7576 11.8575C12.7824 11.862 12.8075 11.8643 12.8327 11.8642C12.9459 11.8642 13.0554 11.8239 13.1415 11.7505C13.2277 11.6771 13.2848 11.5754 13.3027 11.4637C13.3855 10.9432 13.3441 10.4105 13.1819 9.90909C13.0198 9.40766 12.7413 8.95166 12.3694 8.57828C11.7348 7.97177 10.8908 7.63329 10.013 7.63329C9.13517 7.63329 8.29116 7.97177 7.65656 8.57828ZM12.1792 12.4996L10.7978 12.0392C10.6797 12.0048 10.5529 12.0174 10.4439 12.0745C10.3349 12.1316 10.2523 12.2287 10.2134 12.3454C10.1745 12.4621 10.1823 12.5894 10.2352 12.7004C10.2882 12.8115 10.3821 12.8978 10.4972 12.9411L10.9843 13.1037C10.543 13.2939 10.0552 13.349 9.58256 13.262C9.10994 13.1749 8.67375 12.9497 8.32915 12.6148C8.06361 12.3479 7.86489 12.022 7.74916 11.6638C7.63344 11.3055 7.60399 10.925 7.66322 10.5532C7.68328 10.4286 7.65301 10.3011 7.57906 10.1988C7.50511 10.0965 7.39354 10.0277 7.2689 10.0076C7.14426 9.98759 7.01676 10.0179 6.91444 10.0918C6.81212 10.1658 6.74337 10.2773 6.72332 10.402C6.6405 10.9224 6.68187 11.4551 6.84405 11.9565C7.00624 12.458 7.28464 12.914 7.65656 13.2873C7.96575 13.5966 8.33283 13.8419 8.73682 14.0092C9.14081 14.1766 9.57381 14.2627 10.0111 14.2627C10.4484 14.2627 10.8814 14.1766 11.2854 14.0092C11.6894 13.8419 12.0564 13.5966 12.3656 13.2873C12.4229 13.2297 12.4645 13.1584 12.4864 13.0801C12.5082 13.0019 12.5097 12.9193 12.4906 12.8403C12.4716 12.7613 12.4326 12.6885 12.3774 12.6289C12.3222 12.5693 12.2526 12.5248 12.1754 12.4996H12.1792Z"
              fill="#B0B1C4"
            />
          </svg>
        )

      case 'SYNCING':
        return (
          <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 8.07884C19.9982 9.21368 19.5466 10.3015 18.7442 11.104C17.9417 11.9064 16.8539 12.358 15.719 12.3598H14.0732C14.1789 12.0522 14.246 11.7326 14.273 11.4085C14.2825 11.2753 14.2921 11.1421 14.2921 11.0089C14.2921 9.87354 13.841 8.78466 13.0382 7.98182C12.2354 7.17899 11.1465 6.72796 10.0111 6.72796C8.87571 6.72796 7.78683 7.17899 6.984 7.98182C6.18116 8.78466 5.73013 9.87354 5.73013 11.0089C5.73013 11.1421 5.73965 11.2753 5.74916 11.4085C5.77617 11.7326 5.84328 12.0522 5.94894 12.3598H3.35182C2.50453 12.3654 1.68697 12.0479 1.06567 11.4717C0.444373 10.8956 0.0660862 10.1043 0.00787304 9.259C-0.0503401 8.41369 0.215899 7.57799 0.752355 6.92214C1.28881 6.26629 2.05512 5.83962 2.89519 5.72906C2.998 4.33425 3.57061 3.01549 4.51955 1.98807C5.46849 0.960658 6.7377 0.285279 8.11997 0.0721975C9.50224 -0.140884 10.9159 0.120919 12.1302 0.814866C13.3445 1.50881 14.2877 2.59391 14.8058 3.89301C15.1057 3.82747 15.412 3.79556 15.719 3.79788C16.8539 3.79964 17.9417 4.25123 18.7442 5.05369C19.5466 5.85614 19.9982 6.944 20 8.07884ZM7.65656 8.57828C7.59928 8.63591 7.55771 8.70725 7.53582 8.78551C7.51394 8.86376 7.51246 8.94632 7.53154 9.02531C7.55062 9.1043 7.58962 9.17708 7.64481 9.23671C7.7 9.29635 7.76955 9.34085 7.84683 9.36598L9.22815 9.82642C9.28804 9.84894 9.35186 9.85915 9.41579 9.85643C9.47971 9.85372 9.54243 9.83813 9.6002 9.81061C9.65796 9.78308 9.70957 9.74419 9.75195 9.69625C9.79433 9.64831 9.82661 9.59232 9.84684 9.53162C9.86707 9.47092 9.87485 9.40676 9.86971 9.34298C9.86457 9.2792 9.84661 9.21712 9.81692 9.16044C9.78722 9.10377 9.7464 9.05366 9.69689 9.01313C9.64738 8.9726 9.5902 8.94248 9.52877 8.92456L9.04169 8.76189C9.48294 8.5713 9.97084 8.51603 10.4435 8.60308C10.9162 8.69013 11.3524 8.91559 11.6968 9.25087C11.9624 9.51775 12.1611 9.84358 12.2768 10.2018C12.3926 10.5601 12.422 10.9406 12.3628 11.3124C12.3529 11.3741 12.3552 11.4372 12.3697 11.498C12.3842 11.5588 12.4105 11.6161 12.4472 11.6668C12.4838 11.7174 12.5301 11.7603 12.5834 11.793C12.6367 11.8258 12.6958 11.8477 12.7576 11.8575C12.7824 11.862 12.8075 11.8643 12.8327 11.8642C12.9459 11.8642 13.0554 11.8239 13.1415 11.7505C13.2277 11.6771 13.2848 11.5754 13.3027 11.4637C13.3855 10.9432 13.3441 10.4105 13.1819 9.90909C13.0198 9.40766 12.7413 8.95166 12.3694 8.57828C11.7348 7.97177 10.8908 7.63329 10.013 7.63329C9.13517 7.63329 8.29116 7.97177 7.65656 8.57828ZM12.1792 12.4996L10.7978 12.0392C10.6797 12.0048 10.5529 12.0174 10.4439 12.0745C10.3349 12.1316 10.2523 12.2287 10.2134 12.3454C10.1745 12.4621 10.1823 12.5894 10.2352 12.7004C10.2882 12.8115 10.3821 12.8978 10.4972 12.9411L10.9843 13.1037C10.543 13.2939 10.0552 13.349 9.58256 13.262C9.10994 13.1749 8.67375 12.9497 8.32915 12.6148C8.06361 12.3479 7.86489 12.022 7.74916 11.6638C7.63344 11.3055 7.60399 10.925 7.66322 10.5532C7.68328 10.4286 7.65301 10.3011 7.57906 10.1988C7.50511 10.0965 7.39354 10.0277 7.2689 10.0076C7.14426 9.98759 7.01676 10.0179 6.91444 10.0918C6.81212 10.1658 6.74337 10.2773 6.72332 10.402C6.6405 10.9224 6.68187 11.4551 6.84405 11.9565C7.00624 12.458 7.28464 12.914 7.65656 13.2873C7.96575 13.5966 8.33283 13.8419 8.73682 14.0092C9.14081 14.1766 9.57381 14.2627 10.0111 14.2627C10.4484 14.2627 10.8814 14.1766 11.2854 14.0092C11.6894 13.8419 12.0564 13.5966 12.3656 13.2873C12.4229 13.2297 12.4645 13.1584 12.4864 13.0801C12.5082 13.0019 12.5097 12.9193 12.4906 12.8403C12.4716 12.7613 12.4326 12.6885 12.3774 12.6289C12.3222 12.5693 12.2526 12.5248 12.1754 12.4996H12.1792Z"
              fill="#3DC7F6"
            />
          </svg>
        )

      case 'SYNCED':
        return (
          <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 8.07884C19.9982 9.21368 19.5466 10.3015 18.7442 11.104C17.9417 11.9064 16.8539 12.358 15.719 12.3598H14.0732C14.1789 12.0522 14.246 11.7326 14.273 11.4085C14.2825 11.2753 14.2921 11.1421 14.2921 11.0089C14.2921 9.87354 13.841 8.78466 13.0382 7.98182C12.2354 7.17899 11.1465 6.72796 10.0111 6.72796C8.87571 6.72796 7.78683 7.17899 6.984 7.98182C6.18116 8.78466 5.73013 9.87354 5.73013 11.0089C5.73013 11.1421 5.73965 11.2753 5.74916 11.4085C5.77617 11.7326 5.84328 12.0522 5.94894 12.3598H3.35182C2.50453 12.3654 1.68697 12.0479 1.06567 11.4717C0.444373 10.8956 0.0660862 10.1043 0.00787304 9.259C-0.0503401 8.41369 0.215899 7.57799 0.752355 6.92214C1.28881 6.26629 2.05512 5.83962 2.89519 5.72906C2.998 4.33425 3.57061 3.01549 4.51955 1.98807C5.46849 0.960658 6.7377 0.285279 8.11997 0.0721975C9.50224 -0.140884 10.9159 0.120919 12.1302 0.814866C13.3445 1.50881 14.2877 2.59391 14.8058 3.89301C15.1057 3.82747 15.412 3.79556 15.719 3.79788C16.8539 3.79964 17.9417 4.25123 18.7442 5.05369C19.5466 5.85614 19.9982 6.944 20 8.07884ZM7.65656 8.57828C7.59928 8.63591 7.55771 8.70725 7.53582 8.78551C7.51394 8.86376 7.51246 8.94632 7.53154 9.02531C7.55062 9.1043 7.58962 9.17708 7.64481 9.23671C7.7 9.29635 7.76955 9.34085 7.84683 9.36598L9.22815 9.82642C9.28804 9.84894 9.35186 9.85915 9.41579 9.85643C9.47971 9.85372 9.54243 9.83813 9.6002 9.81061C9.65796 9.78308 9.70957 9.74419 9.75195 9.69625C9.79433 9.64831 9.82661 9.59232 9.84684 9.53162C9.86707 9.47092 9.87485 9.40676 9.86971 9.34298C9.86457 9.2792 9.84661 9.21712 9.81692 9.16044C9.78722 9.10377 9.7464 9.05366 9.69689 9.01313C9.64738 8.9726 9.5902 8.94248 9.52877 8.92456L9.04169 8.76189C9.48294 8.5713 9.97084 8.51603 10.4435 8.60308C10.9162 8.69013 11.3524 8.91559 11.6968 9.25087C11.9624 9.51775 12.1611 9.84358 12.2768 10.2018C12.3926 10.5601 12.422 10.9406 12.3628 11.3124C12.3529 11.3741 12.3552 11.4372 12.3697 11.498C12.3842 11.5588 12.4105 11.6161 12.4472 11.6668C12.4838 11.7174 12.5301 11.7603 12.5834 11.793C12.6367 11.8258 12.6958 11.8477 12.7576 11.8575C12.7824 11.862 12.8075 11.8643 12.8327 11.8642C12.9459 11.8642 13.0554 11.8239 13.1415 11.7505C13.2277 11.6771 13.2848 11.5754 13.3027 11.4637C13.3855 10.9432 13.3441 10.4105 13.1819 9.90909C13.0198 9.40766 12.7413 8.95166 12.3694 8.57828C11.7348 7.97177 10.8908 7.63329 10.013 7.63329C9.13517 7.63329 8.29116 7.97177 7.65656 8.57828ZM12.1792 12.4996L10.7978 12.0392C10.6797 12.0048 10.5529 12.0174 10.4439 12.0745C10.3349 12.1316 10.2523 12.2287 10.2134 12.3454C10.1745 12.4621 10.1823 12.5894 10.2352 12.7004C10.2882 12.8115 10.3821 12.8978 10.4972 12.9411L10.9843 13.1037C10.543 13.2939 10.0552 13.349 9.58256 13.262C9.10994 13.1749 8.67375 12.9497 8.32915 12.6148C8.06361 12.3479 7.86489 12.022 7.74916 11.6638C7.63344 11.3055 7.60399 10.925 7.66322 10.5532C7.68328 10.4286 7.65301 10.3011 7.57906 10.1988C7.50511 10.0965 7.39354 10.0277 7.2689 10.0076C7.14426 9.98759 7.01676 10.0179 6.91444 10.0918C6.81212 10.1658 6.74337 10.2773 6.72332 10.402C6.6405 10.9224 6.68187 11.4551 6.84405 11.9565C7.00624 12.458 7.28464 12.914 7.65656 13.2873C7.96575 13.5966 8.33283 13.8419 8.73682 14.0092C9.14081 14.1766 9.57381 14.2627 10.0111 14.2627C10.4484 14.2627 10.8814 14.1766 11.2854 14.0092C11.6894 13.8419 12.0564 13.5966 12.3656 13.2873C12.4229 13.2297 12.4645 13.1584 12.4864 13.0801C12.5082 13.0019 12.5097 12.9193 12.4906 12.8403C12.4716 12.7613 12.4326 12.6885 12.3774 12.6289C12.3222 12.5693 12.2526 12.5248 12.1754 12.4996H12.1792Z"
              fill="#B0B1C4"
            />
          </svg>
        )
    }
  }

  const handleBranchClick = (branch: BranchSelectOption): void => {
    console.log('handleBranchClick', handleBranchClick)
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
        disabled={!(selectedGitRepo && !loadingBranchList)}
        data-id="gitBranchSelect"
        className={cx(props.branchSelectClassName)}
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
                  {getSyncIcon(item.branchSyncStatus)}
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
