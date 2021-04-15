import React from 'react'
import { Classes, Dialog } from '@blueprintjs/core'
import cx from 'classnames'
import { Button, useModalHook, Text, Icon } from '@wings-software/uicore'
import { useHistory, useParams, matchPath } from 'react-router-dom'
import { parse } from 'yaml'
import { isEqual } from 'lodash-es'
import type { NgPipeline } from 'services/cd-ng'
import { useStrings } from 'framework/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useToaster } from '@common/components/Toaster/useToaster'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import { useConfirmationDialog } from '@common/modals/ConfirmDialog/useConfirmationDialog'
import { accountPathProps, pipelinePathProps, pipelineModuleParams } from '@common/utils/routeUtils'
import type { PipelinePathProps, ProjectPathProps, PathFn, PipelineType } from '@common/interfaces/RouteInterfaces'
import { RunPipelineModal } from '@pipeline/components/RunPipelineModal/RunPipelineModal'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { PipelineContext, savePipeline } from '../PipelineContext/PipelineContext'
import CreatePipelines from '../CreateModal/PipelineCreate'
import { DefaultNewPipelineId, DrawerTypes } from '../PipelineContext/PipelineActions'
import { RightBar } from '../RightBar/RightBar'
import PipelineYamlView from '../PipelineYamlView/PipelineYamlView'
import StageBuilder from '../StageBuilder/StageBuilder'
import { PipelineStudioView } from '../PipelineUtils'
import css from './PipelineCanvas.module.scss'

export interface PipelineCanvasProps {
  toPipelineStudio: PathFn<PipelineType<PipelinePathProps>>
  toPipelineDetail: PathFn<PipelineType<PipelinePathProps>>
  toPipelineList: PathFn<PipelineType<ProjectPathProps>>
  toPipelineProject: PathFn<PipelineType<ProjectPathProps>>
}

export const PipelineCanvas: React.FC<PipelineCanvasProps> = ({ toPipelineList, toPipelineStudio }): JSX.Element => {
  const {
    state,
    updatePipeline,
    deletePipelineCache,
    fetchPipeline,
    view,
    setView,
    isReadonly,
    updatePipelineView
  } = React.useContext(PipelineContext)

  const { pipeline, isUpdated, isLoading, isInitialized, originalPipeline, yamlHandler, isBEPipelineUpdated } = state
  // const { stage: selectedStage } = getStageFromPipeline(pipeline, selectedStageId || '')

  const { getString } = useStrings()

  const { accountId, projectIdentifier, orgIdentifier, pipelineIdentifier, module } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
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
        fetchPipeline(true, true)
      } else {
        setDiscardBEUpdate(true)
      }
    }
  })

  const history = useHistory()
  const isYaml = view === 'yaml'
  const [isYamlError, setYamlError] = React.useState(false)

  const saveAndPublish = React.useCallback(async () => {
    let latestPipeline: NgPipeline = pipeline

    if (isYaml && yamlHandler) {
      latestPipeline = parse(yamlHandler.getLatestYaml()).pipeline as NgPipeline
    }

    const response = await savePipeline(
      { accountIdentifier: accountId, projectIdentifier, orgIdentifier },
      latestPipeline,
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
            module
          })
        )
        // note: without setTimeout does not redirect properly after save
        fetchPipeline(true, true, newPipelineId)
      } else {
        fetchPipeline(true, true)
      }
    } else {
      clear()
      showError(response?.message || getString('errorWhileSaving'))
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

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog style={{ width: '385px', paddingBottom: 0 }} isOpen={true} className={cx(css.dialog, Classes.DIALOG)}>
        <CreatePipelines afterSave={onSubmit} initialValues={pipeline} closeModal={onCloseCreate} />
      </Dialog>
    ),
    [pipeline?.identifier, pipeline]
  )

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
    }
  }, [
    pipeline?.identifier,
    showModal,
    isInitialized,
    isBEPipelineUpdated,
    openConfirmBEUpdateError,
    discardBEUpdateDialog
  ])

  React.useEffect(() => {
    if (pipeline?.name) {
      window.dispatchEvent(new CustomEvent('RENAME_PIPELINE', { detail: pipeline?.name }))
    }
  }, [pipeline?.name])

  const onCloseCreate = React.useCallback(() => {
    if (pipeline?.identifier === DefaultNewPipelineId) {
      history.push(toPipelineList({ orgIdentifier, projectIdentifier, accountId, module }))
    }
    hideModal()
  }, [accountId, hideModal, history, module, orgIdentifier, pipeline?.identifier, projectIdentifier, toPipelineList])

  const onSubmit = React.useCallback(
    (data: NgPipeline) => {
      pipeline.name = data.name
      pipeline.description = data.description
      pipeline.identifier = data.identifier
      pipeline.tags = data.tags ?? {}
      updatePipeline(pipeline)
      hideModal()
    },
    [hideModal, pipeline, updatePipeline]
  )

  function handleViewChange(newView: PipelineStudioView): void {
    if (newView === PipelineStudioView.ui && yamlHandler) {
      try {
        const parsedYaml = parse(yamlHandler.getLatestYaml())
        if (!parsedYaml) {
          clear()
          showError(getString('invalidYamlText'))
          return
        }
        // TODO: only apply for CI as its schema is implemented
        if (module === 'ci') {
          if (yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
            setYamlError(true)
            return
          }
        }
        updatePipeline(parsedYaml.pipeline)
      } catch (e) {
        setYamlError(true)
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
    <div
      className={cx(Classes.POPOVER_DISMISS, css.content)}
      onClick={e => {
        e.stopPropagation()
      }}
    >
      <NavigationCheck
        when={true}
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
              localUpdated = !isEqual(originalPipeline, parsedYaml.pipeline)
              updatePipeline(parsedYaml.pipeline)
            } catch (e) {
              setYamlError(true)
              return true
            }
          }
          setYamlError(false)
          return !matchDefault?.isExact && localUpdated
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
              <Text className={css.pipelineName}>{pipeline?.name}</Text>
              {isYaml ? null : (
                <RbacButton
                  minimal
                  icon="Edit"
                  iconProps={{ size: 12 }}
                  onClick={showModal}
                  permission={{
                    resourceScope: {
                      accountIdentifier: accountId,
                      orgIdentifier,
                      projectIdentifier
                    },
                    resource: {
                      resourceType: ResourceType.PIPELINE,
                      resourceIdentifier: pipeline.identifier
                    },
                    permission: PermissionIdentifier.EDIT_PIPELINE
                  }}
                />
              )}
            </div>
          </div>
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
        <div>
          <div className={css.savePublishContainer}>
            {isUpdated && <div className={css.tagRender}>{getString('unsavedChanges')}</div>}
            <div>
              <Button
                minimal
                intent="primary"
                text={getString('save')}
                onClick={saveAndPublish}
                className={css.savePublishBtn}
                icon="send-data"
                disabled={isReadonly}
              />
              <RunPipelineModal pipelineIdentifier={pipeline?.identifier || /* istanbul ignore next */ ''}>
                <RbacButton
                  data-testid="card-run-pipeline"
                  intent="primary"
                  icon="run-pipeline"
                  disabled={isUpdated}
                  className={css.runPipelineBtn}
                  text={getString('runPipelineText')}
                  tooltip={isUpdated ? 'Please click Save and then run the pipeline.' : ''}
                  permission={{
                    resourceScope: {
                      accountIdentifier: accountId,
                      orgIdentifier,
                      projectIdentifier
                    },
                    resource: {
                      resourceType: ResourceType.PIPELINE,
                      resourceIdentifier: pipeline.identifier as string
                    },
                    permission: PermissionIdentifier.EXECUTE_PIPELINE
                  }}
                />
              </RunPipelineModal>
            </div>
          </div>
        </div>
      </div>
      {isYaml ? <PipelineYamlView /> : <StageBuilder />}
      <RightBar />
    </div>
  )
}
