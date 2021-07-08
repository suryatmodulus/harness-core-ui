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
  Popover,
  useModalHook,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Tag
} from '@wings-software/uicore'
import cx from 'classnames'
import type { CellProps, Renderer, Column } from 'react-table'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { Menu, Classes, Position, Dialog } from '@blueprintjs/core'
import Table from '@common/components/Table/Table'
import {
  GitSyncConfig,
  GitSyncFolderConfigDTO,
  ResponseConnectorValidationResult,
  useGetTestGitRepoConnectionResult,
  usePutGitSync
} from 'services/cd-ng'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useStrings } from 'framework/strings'
import { getCompleteGitPath, getGitConnectorIcon, getRepoPath } from '@gitsync/common/gitSyncUtils'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useToaster } from '@common/components/Toaster/useToaster'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { HARNESS_FOLDER_SUFFIX } from '@gitsync/common/Constants'
import { TestConnectionWidget, TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { StringUtils } from '@common/exports'
import { getExternalUrl } from '@gitsync/common/gitSyncUtils'
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
  isDefault?: boolean
}

const RightMenu: React.FC<RightMenuProps> = props => {
  const { repo, selectedFolderIndex, handleRepoUpdate, isDefault } = props
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
            disabled={isDefault}
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
        <Text className={css.name} color={Color.BLACK}>
          {getRepoPath(row.original)}
        </Text>
      </div>
    )
  }

  const RenderColumnBranch: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original
    return (
      <div className={css.wrapper}>
        <Text className={css.name} color={Color.BLACK}>
          {data.branch}
        </Text>
      </div>
    )
  }

  const RenderColumnRootFolder: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
    const { showSuccess, showError } = useToaster()
    const [repoState, setRepoState] = React.useState<RepoState>(RepoState.VIEW)
    const [repoData, setRepoData] = React.useState<GitSyncConfig>(row.original)
    const { mutate: updateGitSyncRepo, loading } = usePutGitSync({
      queryParams: { accountIdentifier: accountId }
    })
    const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.NOT_INITIATED)
    const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

    const handleRepoUpdate = async (
      updatedFolders: GitSyncFolderConfigDTO[],
      whileAddingNewFolder = false
    ): Promise<void> => {
      try {
        modalErrorHandler?.hide()
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
        hideModal()
      } catch (e) {
        if (whileAddingNewFolder) {
          modalErrorHandler?.showDanger(e.data?.message || e.message)
        } else {
          showError(e.data?.message || e.message)
        }
      }
    }

    const { mutate: testRepo, loading: testing } = useGetTestGitRepoConnectionResult({
      identifier: '',
      pathParams: {
        identifier: ''
      },
      queryParams: {
        repoURL: ''
      }
    })

    const testConnection = async (identifier: string, repoURL: string): Promise<void> => {
      setTestStatus(TestStatus.IN_PROGRESS)
      testRepo(undefined, {
        pathParams: {
          identifier
        },
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          repoURL
        }
      })
        .then((response: ResponseConnectorValidationResult) => {
          if (response?.data?.status !== 'SUCCESS') {
            setTestStatus(TestStatus.FAILED)
          } else {
            setTestStatus(TestStatus.SUCCESS)
          }
        })
        .catch(_e => {
          setTestStatus(TestStatus.FAILED)
        })
    }

    const [showModal, hideModal] = useModalHook(() => {
      return (
        <Dialog
          isOpen={true}
          onClose={() => {
            hideModal()
            setRepoState(RepoState.VIEW)
            setTestStatus(TestStatus.NOT_INITIATED)
          }}
          title={
            <Text padding={{ bottom: 'small' }} margin={{ left: 'medium' }} font={{ weight: 'bold' }}>
              {getString('gitsync.addNewHarnessFolderLabel')}
            </Text>
          }
          style={{
            width: 700
          }}
        >
          <ModalErrorHandler bind={setModalErrorHandler} />
          <Container
            margin={{ left: 'xxlarge', right: 'xxlarge' }}
            border={{ top: true, color: Color.GREY_250 }}
            padding={{ top: 'xlarge' }}
          >
            <Formik
              initialValues={{ rootFolder: '', isDefault: false, repo: repoData.repo || '' }}
              validationSchema={Yup.object().shape({
                rootFolder: Yup.string()
                  .trim()
                  .required(getString('validation.nameRequired'))
                  .matches(StringUtils.regexName, getString('common.validation.namePatternIsNotValid'))
              })}
              formName="gitSyncRepoTab"
              onSubmit={formData => {
                if (repoData?.gitSyncFolderConfigDTOs?.length) {
                  const folders = formData.isDefault
                    ? repoData?.gitSyncFolderConfigDTOs?.map((oldFolder: GitSyncFolderConfigDTO) => {
                        oldFolder.isDefault = false
                        return oldFolder
                      })
                    : repoData?.gitSyncFolderConfigDTOs?.slice()

                  folders?.push({
                    rootFolder: formData.rootFolder.concat(HARNESS_FOLDER_SUFFIX),
                    isDefault: formData.isDefault
                  })
                  handleRepoUpdate(folders, true)
                }
              }}
            >
              {({ values: formValues }) => (
                <FormikForm>
                  <Layout.Vertical border={{ bottom: true, color: Color.GREY_250 }} margin={{ bottom: 'medium' }}>
                    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="large">
                      <Layout.Vertical>
                        <FormInput.Text
                          className={cx(css.inputFields, { [css.noSpacing]: formValues.repo })}
                          name="repo"
                          label={getString('repositoryUrlLabel')}
                          disabled={!!formValues.repo}
                        />
                        {formValues.repo ? (
                          <Text
                            font={{ size: 'small' }}
                            padding={{ top: 'xsmall', bottom: 'large' }}
                            color={Color.GREY_250}
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={getRepoPath({
                              repo: formValues.repo,
                              gitConnectorType: repoData.gitConnectorType
                            })}
                          >
                            {getRepoPath({
                              repo: formValues.repo,
                              gitConnectorType: repoData.gitConnectorType
                            })}
                          </Text>
                        ) : null}
                      </Layout.Vertical>
                      {formValues.repo ? (
                        <Container padding={{ bottom: 'medium' }}>
                          <TestConnectionWidget
                            testStatus={testStatus}
                            onTest={() =>
                              testConnection(
                                getIdentifierFromValue(repoData?.gitConnectorRef || ''),
                                repoData?.repo || ''
                              )
                            }
                          />
                        </Container>
                      ) : null}
                    </Layout.Horizontal>
                    <Layout.Vertical>
                      <FormInput.Text
                        className={cx(css.inputFields, css.placeholder, { [css.noSpacing]: formValues.rootFolder })}
                        name="rootFolder"
                        label={getString('gitsync.pathToHarnessFolder')}
                        placeholder={HARNESS_FOLDER_SUFFIX}
                      />
                      {formValues.rootFolder ? (
                        <Text
                          font={{ size: 'small' }}
                          padding={{ top: 'xsmall', bottom: 'xxlarge' }}
                          color={Color.GREY_250}
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={getCompleteGitPath(formValues.repo, formValues.rootFolder, HARNESS_FOLDER_SUFFIX)}
                        >
                          {getCompleteGitPath(formValues.repo, formValues.rootFolder, HARNESS_FOLDER_SUFFIX)}
                        </Text>
                      ) : null}
                      <Container
                        padding={{
                          left: 'xlarge'
                        }}
                      >
                        <FormInput.CheckBox name="isDefault" label={getString('gitsync.markAsDefaultLabel')} />
                      </Container>
                    </Layout.Vertical>
                  </Layout.Vertical>
                  <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                    <Button
                      intent="primary"
                      type="submit"
                      text={getString('gitsync.addFolder')}
                      margin={{ right: 'large' }}
                      disabled={loading || testing || testStatus === TestStatus.FAILED}
                    />
                    {loading ? (
                      <Icon name="steps-spinner" color={Color.PRIMARY_7} margin={{ right: 'large' }} size={18} />
                    ) : null}
                    <Button
                      disabled={loading}
                      text={getString('cancel')}
                      onClick={() => {
                        setRepoState(RepoState.VIEW)
                        setTestStatus(TestStatus.NOT_INITIATED)
                        hideModal()
                      }}
                    />
                  </Layout.Horizontal>
                </FormikForm>
              )}
            </Formik>
          </Container>
        </Dialog>
      )
    }, [modalErrorHandler?.showDanger, loading, testStatus])

    React.useEffect(() => {
      if (repoState === RepoState.EDIT) {
        showModal()
      }
    }, [repoState])

    return (
      <div className={css.wrapper}>
        <Layout.Vertical spacing="xsmall">
          {repoData?.gitSyncFolderConfigDTOs?.length
            ? repoData.gitSyncFolderConfigDTOs.map((rootFolderData: GitSyncFolderConfigDTO, index: number) => {
                const folder = '/'.concat(rootFolderData.rootFolder?.split('/.harness')[0] || '')
                const linkToProvider = getExternalUrl(repoData, rootFolderData.rootFolder)
                return (
                  <Layout.Horizontal
                    key={index}
                    className={css.rootFoldersContainer}
                    flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Layout.Horizontal className={css.rootFoldersData}>
                      <Container width="20%">
                        <Text
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={folder}
                          color={Color.BLACK}
                        >
                          {folder}
                        </Text>
                      </Container>

                      <Container
                        padding={{ left: 'xsmall' }}
                        className={css.noOverflow}
                        width={rootFolderData.isDefault ? '60%' : '75%'}
                      >
                        <a href={linkToProvider} target="_blank" rel="noopener noreferrer" className={css.noShadow}>
                          <Text title={linkToProvider} className={css.link}>
                            {linkToProvider}
                          </Text>
                        </a>
                      </Container>

                      <Container width="5%" padding={{ left: 'xsmall' }}>
                        <CopyToClipboard content={linkToProvider} showFeedback={true} />
                      </Container>
                      {rootFolderData.isDefault && (
                        <Container width="15%">
                          <Tag className={css.defaultFolderTag} style={{ borderRadius: 5 }}>
                            {getString('gitsync.defaultFolder')}
                          </Tag>
                        </Container>
                      )}
                    </Layout.Horizontal>
                    <RightMenu
                      repo={repoData}
                      selectedFolderIndex={index}
                      handleRepoUpdate={handleRepoUpdate}
                      isDefault={rootFolderData.isDefault}
                    />
                  </Layout.Horizontal>
                )
              })
            : null}

          {repoState === RepoState.VIEW ? (
            <Button
              minimal
              className={css.addFolderBtn}
              intent="primary"
              text={
                <Layout.Horizontal flex={{ alignItems: 'baseline' }} spacing="xsmall">
                  <Text font={{ size: 'medium' }}>+</Text>
                  <Text>{getString('gitsync.addFolder')}</Text>
                </Layout.Horizontal>
              }
              onClick={() => {
                repoState === RepoState.VIEW && setRepoState(RepoState.EDIT)
              }}
            />
          ) : null}
        </Layout.Vertical>
      </div>
    )
  }

  const { getString } = useStrings()

  const columns: Column<GitSyncConfig>[] = useMemo(
    () => [
      {
        Header: getString('repository').toUpperCase(),
        accessor: 'repo',
        id: 'reponame',
        width: '15%',
        Cell: RenderColumnReponame
      },
      {
        Header: getString('common.path').toUpperCase(),
        accessor: 'repo',
        id: 'repo',
        width: '20%',
        Cell: RenderColumnRepo
      },
      {
        Header: getString('gitsync.defaultBranch').toUpperCase(),
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
    <Container>
      <Button
        intent="primary"
        text={getString('addRepository')}
        icon="plus"
        onClick={() => openGitSyncModal(false, false, undefined)}
        id="newRepoBtn"
        margin={{ left: 'xlarge', bottom: 'small', top: 'large' }}
      />
      <Table<GitSyncConfig> className={css.table} columns={columns} data={gitSyncRepos || []} />
    </Container>
  )
}

export default GitSyncRepoTab
