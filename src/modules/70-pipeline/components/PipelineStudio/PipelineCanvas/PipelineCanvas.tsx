import React from 'react'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import cx from 'classnames'
import { useModalHook, Text, Icon, Layout, Button, SelectOption, Container } from '@wings-software/uicore'
import { useHistory, useParams, matchPath } from 'react-router-dom'
import { parse } from 'yaml'
import { isEmpty, isEqual, merge, omit } from 'lodash-es'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useToaster } from '@common/components/Toaster/useToaster'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { accountPathProps, pipelinePathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import type {
  PipelinePathProps,
  ProjectPathProps,
  PathFn,
  PipelineType,
  GitQueryParams,
  PipelineStudioQueryParams,
  RunPipelineQueryParams
} from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import routes from '@common/RouteDefinitions'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { TagsPopover } from '@common/components'
import VisualYamlToggle, { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { validateJSONWithSchema } from '@common/utils/YamlUtils'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { getRepoDetailsByIndentifier } from '@common/utils/gitSyncUtils'
import { RunPipelineForm } from '@pipeline/components/RunPipelineModal/RunPipelineForm'
import { InputSetSummaryResponse, useGetInputsetYaml } from 'services/pipeline-ng'
import { PipelineContext, savePipeline } from '../PipelineContext/PipelineContext'
import CreatePipelines from '../CreateModal/PipelineCreate'
import { DefaultNewPipelineId, DrawerTypes } from '../PipelineContext/PipelineActions'
import PipelineYamlView from '../PipelineYamlView/PipelineYamlView'
import { RightBar } from '../RightBar/RightBar'
import StageBuilder from '../StageBuilder/StageBuilder'
import { usePipelineSchema } from '../PipelineSchema/PipelineSchemaContext'
import css from './PipelineCanvas.module.scss'

interface OtherModalProps {
  onSubmit?: (values: PipelineInfoConfig) => void
  initialValues?: PipelineInfoConfig
  onClose?: () => void
}

interface SavePipelineObj {
  pipeline: PipelineInfoConfig | PipelineInfoConfig
}

interface PipelineWithGitContextFormProps extends PipelineInfoConfig {
  repo?: string
  branch?: string
}

interface InputSetValue extends SelectOption {
  type: InputSetSummaryResponse['inputSetType']
  gitDetails?: EntityGitDetails
}

const runModalProps: IDialogProps = {
  isOpen: true,
  // usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: false,
  enforceFocus: false,
  className: css.runPipelineDialog,
  style: { width: 872, height: 'fit-content', overflow: 'auto' },
  isCloseButtonShown: false
}

export interface PipelineCanvasProps {
  toPipelineStudio: PathFn<PipelineType<PipelinePathProps> & PipelineStudioQueryParams>
  toPipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  toPipelineList: PathFn<PipelineType<ProjectPathProps>>
  toPipelineProject: PathFn<PipelineType<ProjectPathProps>>
  getOtherModal?: (
    onSubmit: (values: PipelineInfoConfig, gitDetails?: EntityGitDetails) => void,
    onClose: () => void
  ) => React.ReactElement<OtherModalProps>
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({
  toPipelineList,
  toPipelineStudio,
  getOtherModal
}): JSX.Element => {
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const {
    state,
    updatePipeline,
    updateGitDetails,
    deletePipelineCache,
    fetchPipeline,
    view,
    setSchemaErrorView,
    setView,
    isReadonly,
    updatePipelineView,
    setSelectedStageId,
    setSelectedSectionId
  } = React.useContext(PipelineContext)
  const {
    repoIdentifier,
    branch,
    runPipeline,
    executionId,
    inputSetType,
    inputSetValue,
    inputSetLabel,
    inputSetRepoIdentifier,
    inputSetBranch
  } = useQueryParams<GitQueryParams & RunPipelineQueryParams>()
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<PipelineStudioQueryParams>()

  const {
    pipeline,
    isUpdated,
    pipelineView: { isYamlEditable },
    pipelineView,
    isLoading,
    isInitialized,
    originalPipeline,
    yamlHandler,
    isBEPipelineUpdated,
    gitDetails
  } = state
  // const { stage: selectedStage } = getStageFromPipeline(pipeline, selectedStageId || '')

  const { getString } = useStrings()
  const { pipelineSchema } = usePipelineSchema()
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }> &
      GitQueryParams
  >()

  const { showSuccess, showError, clear } = useToaster()

  const [discardBEUpdateDialog, setDiscardBEUpdate] = React.useState(false)
  const { openDialog: openConfirmBEUpdateError } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('pipelines-studio.pipelineUpdatedError'),
    titleText: getString('pipelines-studio.pipelineUpdated'),
    confirmButtonText: getString('update'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        fetchPipeline({ forceFetch: true, forceUpdate: true })
      } else {
        setDiscardBEUpdate(true)
      }
    }
  })

  const history = useHistory()
  const isYaml = view === SelectedView.YAML
  const [isYamlError, setYamlError] = React.useState(false)
  const [blockNavigation, setBlockNavigation] = React.useState(false)
  const [selectedBranch, setSelectedBranch] = React.useState(branch || '')

  const { openDialog: openUnsavedChangesDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: isYamlError ? getString('navigationYamlError') : getString('navigationCheckText'),
    titleText: isYamlError ? getString('navigationYamlErrorTitle') : getString('navigationCheckTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        deletePipelineCache().then(() => {
          history.push(
            routes.toPipelineStudio({
              projectIdentifier,
              orgIdentifier,
              pipelineIdentifier: pipeline?.identifier || '-1',
              accountId,
              module,
              branch: selectedBranch,
              repoIdentifier: repoIdentifier
            })
          )
          location.reload()
        })
      } else {
        setSelectedBranch(branch || '')
      }
      setBlockNavigation(false)
    }
  })

  const isValidYaml = function () {
    if (yamlHandler) {
      try {
        const parsedYaml = parse(yamlHandler.getLatestYaml())
        if (!parsedYaml) {
          clear()
          showError(getString('invalidYamlText'))
          return false
        }
        if (yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
          clear()
          setYamlError(true)
          showError(getString('invalidYamlText'))
          return false
        }
        updatePipeline(parsedYaml.pipeline)
      } catch (e) {
        clear()
        setYamlError(true)
        showError(e.message || getString('invalidYamlText'))
        return false
      }
    }
    return true
  }

  const navigateToLocation = (newPipelineId: string, updatedGitDetails?: SaveToGitFormInterface) => {
    history.replace(
      toPipelineStudio({
        projectIdentifier,
        orgIdentifier,
        pipelineIdentifier: newPipelineId,
        accountId,
        module,
        repoIdentifier: updatedGitDetails?.repoIdentifier,
        branch: updatedGitDetails?.branch
      })
    )
  }

  const saveAndPublishPipeline = async (
    latestPipeline: PipelineInfoConfig,
    updatedGitDetails?: SaveToGitFormInterface,
    lastObject?: { lastObjectId?: string }
  ): Promise<UseSaveSuccessResponse> => {
    setSchemaErrorView(false)
    const response = await savePipeline(
      {
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier,
        ...(updatedGitDetails ?? {}),
        ...(lastObject ?? {}),
        ...(updatedGitDetails && updatedGitDetails.isNewBranch ? { baseBranch: branch } : {})
      },
      omit(latestPipeline, 'repo', 'branch'),
      pipelineIdentifier !== DefaultNewPipelineId
    )
    const newPipelineId = latestPipeline?.identifier

    if (response && response.status === 'SUCCESS') {
      if (pipelineIdentifier === DefaultNewPipelineId) {
        await deletePipelineCache()

        showSuccess(getString('pipelines-studio.publishPipeline'))

        navigateToLocation(newPipelineId, updatedGitDetails)
        // note: without setTimeout does not redirect properly after save
        await fetchPipeline({ forceFetch: true, forceUpdate: true, newPipelineId })
      } else {
        await fetchPipeline({ forceFetch: true, forceUpdate: true })
      }
      if (updatedGitDetails?.isNewBranch) {
        navigateToLocation(newPipelineId, updatedGitDetails)
        location.reload()
      }
    } else {
      clear()
      setSchemaErrorView(true)
      // This is done because when git sync is enabled, errors are displayed in a modal
      if (!isGitSyncEnabled) {
        showError(response?.message || getString('errorWhileSaving'), undefined, 'pipeline.save.pipeline.error')
      }
      throw response
    }
    return { status: response?.status }
  }

  const saveAngPublishWithGitInfo = async (
    updatedGitDetails: SaveToGitFormInterface,
    payload?: SavePipelineObj,
    objectId?: string
  ): Promise<UseSaveSuccessResponse> => {
    let latestPipeline: PipelineInfoConfig = payload?.pipeline || pipeline

    if (isYaml && yamlHandler) {
      try {
        latestPipeline = payload?.pipeline || (parse(yamlHandler.getLatestYaml()).pipeline as PipelineInfoConfig)
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err, undefined, 'pipeline.save.gitinfo.error')
      }
    }

    const response = await saveAndPublishPipeline(
      latestPipeline,
      omit(updatedGitDetails, 'name', 'identifier'),
      pipelineIdentifier !== DefaultNewPipelineId ? { lastObjectId: objectId } : {}
    )

    return {
      status: response?.status
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SavePipelineObj>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: SavePipelineObj,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> =>
      saveAngPublishWithGitInfo(gitData, payload, objectId || gitDetails?.objectId || '')
  })

  const saveAndPublish = React.useCallback(async () => {
    let latestPipeline: PipelineInfoConfig = pipeline

    if (isYaml && yamlHandler) {
      if (!parse(yamlHandler.getLatestYaml())) {
        clear()
        showError(getString('invalidYamlText'))
        return
      }
      try {
        latestPipeline = parse(yamlHandler.getLatestYaml()).pipeline as PipelineInfoConfig
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err, undefined, 'pipeline.save.pipeline.error')
      }
    }

    // if Git sync enabled then display modal
    if (isGitSyncEnabled) {
      if (isEmpty(gitDetails.repoIdentifier) || isEmpty(gitDetails.branch)) {
        clear()
        showError(getString('pipeline.gitExperience.selectRepoBranch'))
        return
      }
      // When git sync enabled, do not irritate user by taking all git info then at the end showing BE errors related to schema
      const error = await validateJSONWithSchema({ pipeline: latestPipeline }, pipelineSchema?.data as any)
      if (error.size > 0) {
        clear()
        showError(error)
        return
      }
      if (isYaml && yamlHandler && !isValidYaml()) {
        return
      }

      openSaveToGitDialog({
        isEditing: pipelineIdentifier !== DefaultNewPipelineId,
        resource: {
          type: 'Pipelines',
          name: latestPipeline.name,
          identifier: latestPipeline.identifier,
          gitDetails: gitDetails ?? {}
        },
        payload: { pipeline: omit(latestPipeline, 'repo', 'branch') }
      })
    } else {
      await saveAndPublishPipeline(latestPipeline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    deletePipelineCache,
    accountId,
    history,
    toPipelineStudio,
    projectIdentifier,
    orgIdentifier,
    pipeline,
    fetchPipeline,
    showError,
    pipelineIdentifier,
    isYaml,
    yamlHandler
  ])

  const [showModal, hideModal] = useModalHook(() => {
    if (getOtherModal) {
      pipeline.identifier = ''
      updatePipeline(pipeline)
      return (
        <PipelineVariablesContextProvider pipeline={pipeline}>
          {getOtherModal(onSubmit, onCloseCreate)}
        </PipelineVariablesContextProvider>
      )
    } else {
      return (
        <PipelineVariablesContextProvider pipeline={pipeline}>
          <Dialog
            style={{
              width: isGitSyncEnabled ? '614px' : '385px',
              background: 'var(--form-bg)'
            }}
            enforceFocus={false}
            isOpen={true}
            className={'padded-dialog'}
            onClose={onCloseCreate}
            title={
              pipelineIdentifier === DefaultNewPipelineId
                ? getString('moduleRenderer.newPipeLine')
                : getString('editPipeline')
            }
          >
            <CreatePipelines
              afterSave={onSubmit}
              initialValues={merge(pipeline, {
                repo: gitDetails.repoIdentifier || '',
                branch: gitDetails.branch || ''
              })}
              closeModal={onCloseCreate}
              gitDetails={gitDetails as IGitContextFormProps}
            />
          </Dialog>
        </PipelineVariablesContextProvider>
      )
    }
  }, [pipeline?.identifier, pipeline])

  React.useEffect(() => {
    // for new pipeline always use UI as default view
    if (pipelineIdentifier === DefaultNewPipelineId) {
      setView(SelectedView.VISUAL)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipelineIdentifier])

  React.useEffect(() => {
    if (isInitialized) {
      if (pipeline?.identifier === DefaultNewPipelineId) {
        showModal()
      }
      if (isBEPipelineUpdated && !discardBEUpdateDialog) {
        openConfirmBEUpdateError()
      }
      if (blockNavigation && isUpdated) {
        openUnsavedChangesDialog()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pipeline?.identifier,
    showModal,
    isInitialized,
    isBEPipelineUpdated,
    openConfirmBEUpdateError,
    discardBEUpdateDialog,
    blockNavigation
  ])

  React.useEffect(() => {
    if (pipeline?.name) {
      window.dispatchEvent(new CustomEvent('RENAME_PIPELINE', { detail: pipeline?.name }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pipeline?.name])

  const onCloseCreate = React.useCallback(() => {
    if (pipelineIdentifier === DefaultNewPipelineId || getOtherModal) {
      if (getOtherModal) {
        deletePipelineCache()
      }
      history.push(toPipelineList({ orgIdentifier, projectIdentifier, accountId, module }))
    }
    hideModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accountId,
    hideModal,
    history,
    module,
    orgIdentifier,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    pipeline?.identifier,
    projectIdentifier,
    toPipelineList,
    getOtherModal,
    deletePipelineCache
  ])

  const onSubmit = React.useCallback(
    (data: PipelineInfoConfig, updatedGitDetails?: EntityGitDetails) => {
      pipeline.name = data.name
      pipeline.description = data.description
      pipeline.timeout = data.timeout
      pipeline.identifier = data.identifier
      pipeline.tags = data.tags ?? {}
      delete (pipeline as PipelineWithGitContextFormProps).repo
      delete (pipeline as PipelineWithGitContextFormProps).branch
      updatePipeline(pipeline)
      if (updatedGitDetails) {
        if (gitDetails?.objectId) {
          updatedGitDetails = { ...gitDetails, ...updatedGitDetails }
        }
        updateGitDetails(updatedGitDetails).then(() => {
          if (updatedGitDetails) {
            updateQueryParams(
              { repoIdentifier: updatedGitDetails.repoIdentifier, branch: updatedGitDetails.branch },
              { skipNulls: true }
            )
          }
        })
      }
      hideModal()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hideModal, pipeline, updatePipeline]
  )

  function handleViewChange(newView: SelectedView): boolean {
    if (newView === view) return false
    if (newView === SelectedView.VISUAL && yamlHandler && isYamlEditable) {
      if (!isValidYaml()) return false
    }
    setView(newView)
    updatePipelineView({
      splitViewData: {},
      isDrawerOpened: false,
      isYamlEditable: false,
      isSplitViewOpen: false,
      drawerData: { type: DrawerTypes.AddStep }
    })
    setSelectedStageId(undefined)
    setSelectedSectionId(undefined)
    return true
  }

  const [inputSetYaml, setInputSetYaml] = React.useState('')

  const { data, refetch, loading } = useGetInputsetYaml({
    planExecutionId: executionId ?? '',
    queryParams: {
      orgIdentifier,
      projectIdentifier,
      accountIdentifier: accountId
    },
    lazy: true,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const getInputSetSelected = (): InputSetValue[] => {
    if (inputSetType) {
      const inputSetSelected: InputSetValue[] = [
        {
          type: inputSetType as InputSetSummaryResponse['inputSetType'],
          value: inputSetValue ?? '',
          label: inputSetLabel ?? '',
          gitDetails: {
            repoIdentifier: inputSetRepoIdentifier,
            branch: inputSetBranch
          }
        }
      ]
      return inputSetSelected
    }
    return []
  }

  React.useEffect(() => {
    if (data) {
      ;(data as unknown as Response).text().then(str => {
        setInputSetYaml(str)
      })
    }
  }, [data])

  React.useEffect(() => {
    if (executionId && executionId !== null) {
      refetch()
    }
  }, [executionId])

  function onCloseRunPipelineModal(): void {
    closeRunPipelineModal()
    setInputSetYaml('')
    replaceQueryParams({ repoIdentifier: repoIdentifier, branch: branch }, { skipNulls: true }, true)
  }

  React.useEffect(() => {
    if (runPipeline) {
      openRunPipelineModal()
    }
  }, [runPipeline])

  const [openRunPipelineModal, closeRunPipelineModal] = useModalHook(
    () =>
      loading ? (
        <PageSpinner />
      ) : (
        <Dialog {...runModalProps}>
          <Layout.Vertical className={css.modalCard}>
            <RunPipelineForm
              pipelineIdentifier={pipelineIdentifier}
              orgIdentifier={orgIdentifier}
              projectIdentifier={projectIdentifier}
              accountId={accountId}
              module={module}
              inputSetYAML={inputSetYaml || ''}
              inputSetSelected={getInputSetSelected()}
              repoIdentifier={repoIdentifier}
              branch={branch}
              inputSetRepoIdentifier={inputSetRepoIdentifier}
              inputSetBranch={inputSetBranch}
              onClose={() => {
                onCloseRunPipelineModal()
              }}
            />
            <Button
              aria-label="close modal"
              minimal
              icon="cross"
              iconProps={{ size: 18 }}
              onClick={() => {
                onCloseRunPipelineModal()
              }}
              className={css.crossIcon}
            />
          </Layout.Vertical>
        </Dialog>
      ),
    [
      loading,
      inputSetYaml,
      inputSetRepoIdentifier,
      inputSetBranch,
      branch,
      repoIdentifier,
      inputSetType,
      inputSetValue,
      inputSetLabel,
      pipelineIdentifier
    ]
  )

  const onGitBranchChange = React.useMemo(
    () => (selectedFilter: GitFilterScope) => {
      setSelectedBranch(selectedFilter.branch as string)
      if (isUpdated && branch !== selectedFilter.branch) {
        setBlockNavigation(true)
      } else if (branch !== selectedFilter.branch) {
        history.push(
          routes.toPipelineStudio({
            projectIdentifier,
            orgIdentifier,
            pipelineIdentifier: pipelineIdentifier || '-1',
            accountId,
            module,
            branch: selectedFilter.branch,
            repoIdentifier: selectedFilter.repo
          })
        )
        location.reload()
      }
    },
    [repoIdentifier, branch, isUpdated, pipelineIdentifier]
  )

  const RenderGitDetails: React.FC = React.useCallback(() => {
    if (gitDetails?.objectId || (pipelineIdentifier === DefaultNewPipelineId && gitDetails.repoIdentifier)) {
      const repoName: string = getRepoDetailsByIndentifier(gitDetails?.repoIdentifier, gitSyncRepos)?.name || ''
      const folderName = `${gitDetails?.rootFolder || ''}${gitDetails?.filePath || ''}`
      return (
        <Layout.Horizontal spacing="medium" className={css.gitDetails}>
          <Layout.Horizontal spacing="small" className={css.repoDetails}>
            <Icon name="repository" margin={{ left: 'medium' }}></Icon>
            {pipelineIdentifier === DefaultNewPipelineId && !loadingRepos ? (
              <Text
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '145px'
                }}
                tooltip={repoName}
              >
                {repoName}
              </Text>
            ) : (
              <Text
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '190px'
                }}
                tooltip={folderName}
              >
                {folderName}
              </Text>
            )}
          </Layout.Horizontal>

          <Layout.Horizontal spacing="small" className={css.branchDetails}>
            {pipelineIdentifier === DefaultNewPipelineId || isReadonly ? (
              <>
                <Icon name="git-new-branch" margin={{ left: 'medium' }}></Icon>
                <Text
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '145px'
                  }}
                  tooltip={gitDetails?.branch}
                >
                  {gitDetails?.branch}
                </Text>
              </>
            ) : (
              <GitFilters
                onChange={onGitBranchChange}
                showRepoSelector={false}
                defaultValue={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                branchSelectClassName={css.branchSelector}
              />
            )}
          </Layout.Horizontal>
        </Layout.Horizontal>
      )
    } else {
      return <></>
    }
  }, [gitDetails, pipelineIdentifier, repoIdentifier, branch, onGitBranchChange, selectedBranch])

  if (isLoading) {
    return (
      <React.Fragment>
        <PageSpinner fixed />
        <div /> {/* this empty div is required for rendering layout correctly */}
      </React.Fragment>
    )
  }

  const getPipelineNameTextContainerWidth = (): number | undefined => {
    if (isGitSyncEnabled) {
      if (pipelineIdentifier === DefaultNewPipelineId) {
        if (!isEmpty(pipeline?.tags)) {
          return 150
        }
        return 175
      }
      if (!isEmpty(pipeline?.tags)) {
        return 125
      }
      return 155
    }
    return 400
  }

  return (
    <PipelineVariablesContextProvider pipeline={pipeline}>
      <div
        className={cx(Classes.POPOVER_DISMISS, css.content)}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <NavigationCheck
          when={getOtherModal && pipeline.identifier !== ''}
          shouldBlockNavigation={nextLocation => {
            let localUpdated = isUpdated
            const matchDefault = matchPath(nextLocation.pathname, {
              path: toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
              exact: true
            })

            // This is special handler when user update yaml and immediately click on run
            if (isYaml && yamlHandler && isYamlEditable && !localUpdated) {
              try {
                const parsedYaml = parse(yamlHandler.getLatestYaml())
                if (!parsedYaml) {
                  clear()
                  showError(getString('invalidYamlText'), undefined, 'pipeline.parse.yaml.error')
                  return true
                }
                if (yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
                  setYamlError(true)
                  return true
                }
                localUpdated = !isEqual(omit(originalPipeline, 'repo', 'branch'), parsedYaml.pipeline)
                updatePipeline(parsedYaml.pipeline)
              } catch (e) {
                setYamlError(true)
                return true
              }
            }
            setYamlError(false)
            return !matchDefault?.isExact && localUpdated && !isReadonly
          }}
          textProps={{
            contentText: isYamlError ? getString('navigationYamlError') : getString('navigationCheckText'),
            titleText: isYamlError ? getString('navigationYamlErrorTitle') : getString('navigationCheckTitle')
          }}
          navigate={newPath => {
            const isPipeline = matchPath(newPath, {
              path: toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
              exact: true
            })
            !isPipeline?.isExact && deletePipelineCache()
            history.push(newPath)
          }}
        />
        <div className={css.titleBar}>
          <div className={css.breadcrumbsMenu}>
            <div className={css.pipelineMetadataContainer}>
              <Layout.Horizontal className={css.pipelineNameContainer}>
                <Icon className={css.pipelineIcon} padding={{ right: 'small' }} name="pipeline" size={32} />
                <Text
                  className={css.pipelineName}
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: getPipelineNameTextContainerWidth()
                  }}
                  tooltip={pipeline?.name}
                >
                  {pipeline?.name}
                </Text>
                {!isEmpty(pipeline?.tags) && pipeline.tags && (
                  <Container className={css.tagsContainer}>
                    <TagsPopover tags={pipeline.tags} />
                  </Container>
                )}
                {isYaml || isReadonly ? null : (
                  <Button
                    className={css.pipelineEditBtn}
                    minimal
                    icon="Edit"
                    withoutBoxShadow
                    iconProps={{ size: 16 }}
                    onClick={showModal}
                    withoutCurrentColor={true}
                  />
                )}
              </Layout.Horizontal>

              {isGitSyncEnabled && <RenderGitDetails />}
            </div>
          </div>
          <VisualYamlToggle
            className={css.visualYamlToggle}
            initialSelectedView={isYaml ? SelectedView.YAML : SelectedView.VISUAL}
            beforeOnChange={(nextMode, callback) => {
              const shoudSwitchcMode = handleViewChange(nextMode)
              shoudSwitchcMode && callback(nextMode)
            }}
          />
          <div>
            <div className={css.savePublishContainer}>
              {isReadonly && (
                <div className={css.readonlyAccessTag}>
                  <Icon name="eye-open" size={16} />
                  <div className={css.readonlyAccessText}>{getString('common.readonlyPermissions')}</div>
                </div>
              )}
              {isUpdated && !isReadonly && <div className={css.tagRender}>{getString('unsavedChanges')}</div>}
              <div>
                {!isReadonly && (
                  <Button
                    intent="primary"
                    text={getString('save')}
                    onClick={saveAndPublish}
                    icon="send-data"
                    className={css.saveButton}
                  />
                )}
                {pipelineIdentifier !== DefaultNewPipelineId && !isReadonly && (
                  <Button
                    disabled={!isUpdated}
                    onClick={() => {
                      updatePipelineView({ ...pipelineView, isYamlEditable: false })
                      fetchPipeline({ forceFetch: true, forceUpdate: true })
                    }}
                    className={css.discardBtn}
                    text={getString('pipeline.discard')}
                  />
                )}
                <RbacButton
                  data-testid="card-run-pipeline"
                  intent="primary"
                  icon="run-pipeline"
                  disabled={isUpdated}
                  className={css.runPipelineBtn}
                  text={getString('runPipelineText')}
                  tooltip={isUpdated ? 'Please click Save and then run the pipeline.' : ''}
                  onClick={e => {
                    e.stopPropagation()
                    updateQueryParams({ runPipeline: true }, { skipNulls: true }, true)
                  }}
                  permission={{
                    resourceScope: {
                      accountIdentifier: accountId,
                      orgIdentifier,
                      projectIdentifier
                    },
                    resource: {
                      resourceType: ResourceType.PIPELINE,
                      resourceIdentifier: pipeline?.identifier as string
                    },
                    permission: PermissionIdentifier.EXECUTE_PIPELINE
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {isYaml ? <PipelineYamlView /> : <StageBuilder />}
      </div>
      <RightBar />
    </PipelineVariablesContextProvider>
  )
}
