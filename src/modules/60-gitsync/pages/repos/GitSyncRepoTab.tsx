import React, { useMemo, useState } from 'react'
import {
  Button,
  Layout,
  Text,
  Container,
  Icon,
  Color,
  Formik,
  FormikForm,
  FormInput,
  Popover
} from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { Menu, Classes, Position } from '@blueprintjs/core'
import Table from '@common/components/Table/Table'
import { GitSyncConfig, GitSyncFolderConfigDTO, usePutGitSync } from 'services/cd-ng'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useStrings } from 'framework/strings'
import { getGitConnectorIcon } from '@gitsync/common/gitSyncUtils'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { Connectors } from '@connectors/constants'
import { useToaster } from '@common/components/Toaster/useToaster'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './GitSyncRepoTab.module.scss'

enum RepoState {
  VIEW = 'VIEW',
  ADD = 'ADD',
  EDIT = 'EDIT'
}

interface RightMenuProps {
  repo: GitSyncConfig
  selectedFolderIndex: number
  handleRepoUpdate: (updatedFolders: GitSyncFolderConfigDTO[]) => unknown
}

const RightMenu: React.FC<RightMenuProps> = props => {
  const { repo, selectedFolderIndex, handleRepoUpdate } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const { getString } = useStrings()

  const handleMarkAsDefaultFolder = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (repo?.gitSyncFolderConfigDTOs) {
      const folders = repo.gitSyncFolderConfigDTOs.map((oldFolder: GitSyncFolderConfigDTO, index: number) => {
        oldFolder.isDefault = selectedFolderIndex === index
        return oldFolder
      })
      handleRepoUpdate(folders)
    }
  }

  return (
    <Layout.Horizontal>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.RIGHT_TOP}
      >
        <Button
          minimal
          icon="Options"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <Menu.Item data-test="moveFolderBtn" text={getString('gitsync.moveFolder')} disabled={true} />
          <Menu.Item
            data-test="markDefaultBtn"
            text={getString('gitsync.markAsDefault')}
            onClick={handleMarkAsDefaultFolder}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const GitSyncRepoTab: React.FC = () => {
  const { gitSyncRepos, refreshStore } = useGitSyncStore()

  const { openGitSyncModal } = useCreateGitSyncModal({
    onSuccess: async () => {
      refreshStore()
    },
    onClose: async () => {
      refreshStore()
    }
  })

  const getRepoPath = (gitRepo: GitSyncConfig): string => {
    let basePath = ''
    switch (gitRepo.gitConnectorType) {
      case Connectors.GITHUB:
        basePath = 'https://github.com/'
        break
      case Connectors.GITLAB:
        basePath = 'https://gitlab.com/'
        break
      case Connectors.BITBUCKET:
        basePath = 'https://bitbucket.com/'
    }

    return gitRepo.repo?.split(basePath)[1] || ''
  }

  const RenderColumnReponame: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original

    return (
      <Layout.Horizontal spacing="small">
        <Icon name={getGitConnectorIcon(data.gitConnectorType)} size={30}></Icon>
        <div className={css.wrapper}>
          <Text className={css.name} color={Color.BLACK} title={data.name}>
            {data.name}
          </Text>
          <Text className={css.name} color={Color.GREY_400} title={data.identifier}>
            {data.identifier}
          </Text>
        </div>
      </Layout.Horizontal>
    )
  }

  const RenderColumnRepo: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    return (
      <div className={css.wrapper}>
        <Text className={css.name}>{getRepoPath(row.original)}</Text>
      </div>
    )
  }

  const RenderColumnBranch: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original
    return (
      <div className={css.wrapper}>
        <Text className={css.name}>{data.branch}</Text>
      </div>
    )
  }

  const RenderColumnRootFolder: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const { accountId } = useParams<AccountPathProps>()
    const { showSuccess, showError } = useToaster()
    const [repoState, setRepoState] = React.useState<RepoState>(RepoState.VIEW)
    const [repoData, setRepoData] = React.useState<GitSyncConfig>(row.original)
    const { mutate: updateGitSyncRepo, loading } = usePutGitSync({
      queryParams: { accountIdentifier: accountId }
    })

    const handleRepoUpdate = async (updatedFolders: GitSyncFolderConfigDTO[]): Promise<void> => {
      try {
        const payload = {
          ...pick(repoData, [
            'gitConnectorType',
            'repo',
            'branch',
            'name',
            'identifier',
            'gitConnectorType',
            'gitConnectorRef',
            'projectIdentifier',
            'orgIdentifier'
          ]),
          gitSyncFolderConfigDTOs: updatedFolders
        }
        const response = await updateGitSyncRepo(payload)
        // message is explicit because only rootFolder can be changed
        showSuccess(getString('gitsync.rootFolderUpdatedSuccessfully', { name: payload.name }))
        setRepoData(response)
        setRepoState(RepoState.VIEW)
      } catch (err) {
        showError(err?.data?.message || err?.message)
      }
    }

    return (
      <div className={css.wrapper}>
        <Layout.Vertical spacing="xsmall">
          {repoData?.gitSyncFolderConfigDTOs?.length
            ? repoData.gitSyncFolderConfigDTOs.map((rootFolderData: GitSyncFolderConfigDTO, index: number) => {
                return (
                  <Layout.Horizontal key={index} className={css.rootFoldersContainer}>
                    <Layout.Horizontal spacing="medium" className={css.rootFoldersData}>
                      <Text className={css.rootFolderRelativePath}>
                        {rootFolderData.rootFolder?.split('/.harness')[0]}
                      </Text>
                      <Text>{`${repoData.repo}/${rootFolderData.rootFolder}`}</Text>
                      {rootFolderData.isDefault && (
                        <Text padding="xsmall" background={Color.PURPLE_100}>
                          {getString('gitsync.defaultFolder')}
                        </Text>
                      )}
                    </Layout.Horizontal>

                    <RightMenu repo={repoData} selectedFolderIndex={index} handleRepoUpdate={handleRepoUpdate} />
                  </Layout.Horizontal>
                )
              })
            : null}

          {repoState === RepoState.VIEW ? (
            <Button
              minimal
              className={css.addFolderBtn}
              intent="primary"
              text={getString('gitsync.addFolder')}
              onClick={() => {
                repoState === RepoState.VIEW && setRepoState(RepoState.EDIT)
              }}
            />
          ) : (
            <Container padding="medium">
              <Formik
                initialValues={{ rootFolder: '', isDefault: false }}
                validationSchema={Yup.object().shape({
                  rootFolder: Yup.string().trim().required(getString('validation.nameRequired'))
                })}
                onSubmit={formData => {
                  if (repoData?.gitSyncFolderConfigDTOs?.length) {
                    const folders = formData.isDefault
                      ? repoData?.gitSyncFolderConfigDTOs?.map((oldFolder: GitSyncFolderConfigDTO) => {
                          oldFolder.isDefault = false
                          return oldFolder
                        })
                      : repoData?.gitSyncFolderConfigDTOs?.slice()

                    folders?.push({
                      rootFolder: formData.rootFolder,
                      isDefault: formData.isDefault
                    })

                    handleRepoUpdate(folders)
                  }
                }}
              >
                <FormikForm>
                  <Layout.Horizontal spacing="medium">
                    <FormInput.Text name="rootFolder" />
                    <FormInput.CheckBox
                      margin={{ left: 'huge', top: 'small' }}
                      font={{ size: 'normal' }}
                      name="isDefault"
                      label={getString('gitsync.markAsDefault')}
                    />
                  </Layout.Horizontal>
                  <Button
                    intent="primary"
                    type="submit"
                    text={getString('save')}
                    margin={{ right: 'large' }}
                    disabled={loading}
                  />
                  <Button
                    disabled={loading}
                    intent="danger"
                    text={getString('cancel')}
                    onClick={() => {
                      setRepoState(RepoState.VIEW)
                    }}
                  />
                </FormikForm>
              </Formik>
            </Container>
          )}
        </Layout.Vertical>
      </div>
    )
  }

  const { getString } = useStrings()

  const columns: Column<GitSyncConfig>[] = useMemo(
    () => [
      {
        Header: getString('name').toUpperCase(),
        accessor: 'repo',
        id: 'reponame',
        width: '15%',
        Cell: RenderColumnReponame
      },
      {
        Header: getString('gitsync.repositoryPath').toUpperCase(),
        accessor: 'repo',
        id: 'repo',
        width: '20%',
        Cell: RenderColumnRepo
      },
      {
        Header: getString('primaryBranch').toUpperCase(),
        accessor: 'branch',
        id: 'branch',
        width: '15%',
        Cell: RenderColumnBranch
      },
      {
        Header: getString('gitsync.rootFolderListHeader').toUpperCase(),
        accessor: 'gitSyncFolderConfigDTOs',
        id: 'rootFolders',
        width: '50%',
        Cell: RenderColumnRootFolder
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gitSyncRepos?.length]
  )
  return (
    <Container padding="large">
      <Button
        intent="primary"
        text={getString('addRepository')}
        icon="plus"
        onClick={() => openGitSyncModal(false, false, undefined)}
        id="newRepoBtn"
        margin={{ left: 'xlarge', bottom: 'small' }}
      />
      <Table<GitSyncConfig> className={css.table} columns={columns} data={gitSyncRepos || []} />
    </Container>
  )
}

export default GitSyncRepoTab
