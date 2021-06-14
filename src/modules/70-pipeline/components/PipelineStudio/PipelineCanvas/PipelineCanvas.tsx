import React from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import { useModalHook, Text, Icon, Layout, Color, Button } from '@wings-software/uicore'
import { useHistory, useParams, matchPath } from 'react-router-dom'
import { parse } from 'yaml'
import { isEmpty, isEqual, merge, omit } from 'lodash-es'
import type { NgPipeline, PipelineInfoConfig } from 'services/cd-ng'
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
  PipelineStudioQueryParams
} from '@common/interfaces/RouteInterfaces'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import routes from '@common/RouteDefinitions'
import type { EntityGitDetails } from 'services/pipeline-ng'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import GitFilters from '@common/components/GitFilters/GitFilters'
import { TagsPopover } from '@common/components'
import { PipelineVariablesContextProvider } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { PipelineContext, savePipeline } from '../PipelineContext/PipelineContext'
import CreatePipelines from '../CreateModal/PipelineCreate'
import { DefaultNewPipelineId, DrawerTypes } from '../PipelineContext/PipelineActions'
import { RightBar } from '../RightBar/RightBar'
import PipelineYamlView from '../PipelineYamlView/PipelineYamlView'
import StageBuilder from '../StageBuilder/StageBuilder'
import { PipelineStudioView } from '../PipelineUtils'
import css from './PipelineCanvas.module.scss'

interface OtherModalProps {
  onSubmit?: (values: NgPipeline) => void
  initialValues?: NgPipeline
  onClose?: () => void
}
export interface PipelineCanvasProps {
  toPipelineStudio: PathFn<PipelineType<PipelinePathProps> & PipelineStudioQueryParams>
  toPipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  toPipelineList: PathFn<PipelineType<ProjectPathProps>>
  toPipelineProject: PathFn<PipelineType<ProjectPathProps>>
  getOtherModal?: (
    onSubmit: (values: NgPipeline, gitDetails?: EntityGitDetails) => void,
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
    setSelectedStageId
  } = React.useContext(PipelineContext)
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { updateQueryParams } = useUpdateQueryParams<PipelineStudioQueryParams>()

  const {
    pipeline,
    isUpdated,
    isLoading,
    isInitialized,
    originalPipeline,
    yamlHandler,
    isBEPipelineUpdated,
    gitDetails
  } = state
  // const { stage: selectedStage } = getStageFromPipeline(pipeline, selectedStageId || '')

  const { getString } = useStrings()

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
  const isYaml = view === 'yaml'
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
      }
      setBlockNavigation(false)
    }
  })

  const saveAndPublishPipeline = async (
    latestPipeline: NgPipeline,
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
        // note: without setTimeout does not redirect properly after save
        await fetchPipeline({ forceFetch: true, forceUpdate: true, newPipelineId })
      } else {
        await fetchPipeline({ forceFetch: true, forceUpdate: true })
      }
      if (updatedGitDetails?.isNewBranch) {
        location.reload()
      }
    } else {
      clear()
      setSchemaErrorView(true)
      showError(response?.message || getString('errorWhileSaving'))
    }
    return { status: response?.status }
  }

  const saveAngPublishWithGitInfo = async (
    updatedGitDetails: SaveToGitFormInterface,
    payload?: PipelineInfoConfig,
    objectId?: string
  ): Promise<UseSaveSuccessResponse> => {
    let latestPipeline: PipelineInfoConfig = pipeline || payload

    if (isYaml && yamlHandler) {
      try {
        latestPipeline = parse(yamlHandler.getLatestYaml()).pipeline as NgPipeline
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err)
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

  const { openSaveToGitDialog } = useSaveToGitDialog<PipelineInfoConfig>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: PipelineInfoConfig,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> =>
      Promise.resolve(saveAngPublishWithGitInfo(gitData, payload, objectId || gitDetails?.objectId || ''))
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
        latestPipeline = parse(yamlHandler.getLatestYaml()).pipeline as NgPipeline
      } /* istanbul ignore next */ catch (err) {
        showError(err.message || err)
      }
    }

    // if Git sync enabled then display modal
    if (isGitSyncEnabled) {
      openSaveToGitDialog({
        isEditing: pipelineIdentifier !== DefaultNewPipelineId,
        resource: {
          type: 'Pipelines',
          name: latestPipeline.name,
          identifier: latestPipeline.identifier,
          gitDetails: gitDetails ?? {}
        },
        payload: latestPipeline
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
      return getOtherModal(onSubmit, onCloseCreate)
    } else {
      return (
        <Dialog
          style={{
            width: isGitSyncEnabled ? '614px' : '385px',
            background: 'var(--form-bg)'
          }}
          isOpen={true}
          className={'padded-dialog'}
          onClose={onCloseCreate}
          title={
            pipeline.identifier === DefaultNewPipelineId
              ? getString('moduleRenderer.newPipeLine')
              : getString('editPipeline')
          }
        >
          <CreatePipelines
            afterSave={onSubmit}
            initialValues={merge(pipeline, { repo: gitDetails.repoIdentifier || '', branch: gitDetails.branch || '' })}
            closeModal={onCloseCreate}
          />
        </Dialog>
      )
    }
  }, [pipeline?.identifier, pipeline])

  React.useEffect(() => {
    // for new pipeline always use UI as default view
    if (pipelineIdentifier === DefaultNewPipelineId) {
      setView(PipelineStudioView.ui)
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
    if (pipeline?.identifier === DefaultNewPipelineId || getOtherModal) {
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
    (data: NgPipeline, updatedGitDetails?: EntityGitDetails) => {
      pipeline.name = data.name
      pipeline.description = data.description
      pipeline.identifier = data.identifier
      pipeline.tags = data.tags ?? {}
      updatePipeline(omit(pipeline, 'repo', 'branch'))
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

  function handleViewChange(newView: PipelineStudioView): void {
    if (newView === view) return
    if (newView === PipelineStudioView.ui && yamlHandler) {
      try {
        const parsedYaml = parse(yamlHandler.getLatestYaml())
        if (!parsedYaml) {
          clear()
          showError(getString('invalidYamlText'))
          return
        }
        if (yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
          setYamlError(true)
          showError(getString('invalidYamlText'))
          return
        }
        updatePipeline(parsedYaml.pipeline)
      } catch (e) {
        setYamlError(true)
        showError(e.message || getString('invalidYamlText'))
        return
      }
    }
    setView(newView)
    updatePipelineView({
      splitViewData: {},
      isDrawerOpened: false,
      isSplitViewOpen: false,
      drawerData: { type: DrawerTypes.AddStep }
    })
    setSelectedStageId(undefined)
  }

  const runPipeline = useRunPipelineModal({
    pipelineIdentifier: (pipeline?.identifier || '') as string,
    repoIdentifier,
    branch
  })

  const RenderGitDetails: React.FC = () => {
    if (gitDetails?.objectId || (pipelineIdentifier === DefaultNewPipelineId && gitDetails.repoIdentifier)) {
      return (
        <Layout.Horizontal border={{ left: true, color: Color.GREY_300 }} spacing="medium" className={css.gitDetails}>
          <Layout.Horizontal spacing="small" className={css.repoDetails}>
            <Icon name="repository" margin={{ left: 'medium' }}></Icon>
            {pipelineIdentifier === DefaultNewPipelineId ? (
              <Text>{`${gitDetails?.repoIdentifier}`}</Text>
            ) : (
              <Text lineClamp={1} width="200px">{`${gitDetails?.rootFolder}${gitDetails?.filePath}`}</Text>
            )}
          </Layout.Horizontal>

          <Layout.Horizontal
            border={{ left: true, color: Color.GREY_300 }}
            spacing="small"
            className={css.branchDetails}
          >
            {pipelineIdentifier === DefaultNewPipelineId || isReadonly ? (
              <>
                <Icon name="git-new-branch" margin={{ left: 'medium' }}></Icon>
                <Text>{gitDetails?.branch}</Text>
              </>
            ) : (
              <GitFilters
                onChange={filter => {
                  setSelectedBranch(filter.branch as string)
                  if (isUpdated && branch !== filter.branch) {
                    setBlockNavigation(true)
                  } else if (branch !== filter.branch) {
                    history.push(
                      routes.toPipelineStudio({
                        projectIdentifier,
                        orgIdentifier,
                        pipelineIdentifier: pipeline?.identifier || '-1',
                        accountId,
                        module,
                        branch: filter.branch,
                        repoIdentifier: filter.repo
                      })
                    )
                    location.reload()
                  }
                }}
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
  }

  if (isLoading) {
    return (
      <React.Fragment>
        <PageSpinner fixed />
        <div /> {/* this empty div is required for rendering layout correctly */}
      </React.Fragment>
    )
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
            const matchDefault = matchPath(nextLocation.pathname, {
              path: toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams }),
              exact: true
            })
            let localUpdated = isUpdated
            if (isYaml && yamlHandler) {
              try {
                const parsedYaml = parse(yamlHandler.getLatestYaml())
                if (!parsedYaml) {
                  clear()
                  showError(getString('invalidYamlText'))
                  return true
                }
                // TODO: only apply for CI as its schema is implemented
                if (module === 'ci') {
                  if (yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
                    setYamlError(true)
                    return true
                  }
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
            <div className={css.pipelineNameContainer}>
              <div>
                <Icon className={css.pipelineIcon} padding={{ right: 'small' }} name="pipeline" size={32} />
                <Text className={css.pipelineName} max-width="100%" lineClamp={1}>
                  {pipeline?.name}
                </Text>
                {!isEmpty(pipeline?.tags) && pipeline.tags && <TagsPopover tags={pipeline.tags} />}
                {isYaml ? null : (
                  <RbacButton
                    minimal
                    icon="Edit"
                    withoutBoxShadow
                    iconProps={{ size: 12 }}
                    onClick={showModal}
                    permission={{
                      resource: {
                        resourceType: ResourceType.PIPELINE,
                        resourceIdentifier: pipeline?.identifier
                      },
                      permission: PermissionIdentifier.EDIT_PIPELINE
                    }}
                  />
                )}
              </div>

              {isGitSyncEnabled && <RenderGitDetails />}
            </div>

            <div className={css.pipelineStudioTitleContainer}>
              <div className={css.optionBtns}>
                <div
                  className={cx(css.item, { [css.selected]: !isYaml })}
                  onClick={() => handleViewChange(PipelineStudioView.ui)}
                >
                  {getString('visual')}
                </div>
                <div
                  className={cx(css.item, { [css.selected]: isYaml })}
                  onClick={() => handleViewChange(PipelineStudioView.yaml)}
                >
                  {getString('yaml')}
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className={css.savePublishContainer}>
              {isUpdated && <div className={css.tagRender}>{getString('unsavedChanges')}</div>}
              <div>
                <RbacButton
                  intent="primary"
                  text={getString('save')}
                  onClick={saveAndPublish}
                  icon="send-data"
                  disabled={isReadonly}
                  permission={{
                    resource: {
                      resourceType: ResourceType.PIPELINE,
                      resourceIdentifier: pipeline?.identifier
                    },
                    permission: PermissionIdentifier.EDIT_PIPELINE
                  }}
                />
                {pipelineIdentifier !== DefaultNewPipelineId && (
                  <Button
                    disabled={!isUpdated}
                    onClick={() => fetchPipeline({ forceFetch: true, forceUpdate: true })}
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
                    runPipeline()
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
        <RightBar />
      </div>
    </PipelineVariablesContextProvider>
  )
}
