import React from 'react'
import { openDB, IDBPDatabase, deleteDB } from 'idb'
import { isEqual, cloneDeep, pick, isNil, isEmpty } from 'lodash-es'
import { parse, stringify } from 'yaml'
import type { IconName } from '@wings-software/uicore'
import type {
  PipelineInfoConfig,
  ResponseNGPipelineResponse,
  StageElementConfig,
  StageElementWrapper,
  StageElementWrapperConfig
} from 'services/cd-ng'
import type { PermissionCheck } from 'services/rbac'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import SessionToken from 'framework/utils/SessionToken'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import {
  createPipelinePromise,
  getPipelinePromise,
  GetPipelineQueryParams,
  putPipelinePromise,
  PutPipelineQueryParams,
  Failure
} from 'services/pipeline-ng'
import { useGlobalEventListener, useLocalStorage } from '@common/hooks'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import {
  PipelineReducerState,
  ActionReturnType,
  PipelineContextActions,
  DefaultNewPipelineId,
  DefaultPipeline,
  initialState,
  PipelineReducer,
  PipelineViewData,
  DrawerTypes,
  SelectionState
} from './PipelineActions'
import type { AbstractStepFactory } from '../../AbstractSteps/AbstractStepFactory'
import type { PipelineStagesProps } from '../../PipelineStages/PipelineStages'
import { PipelineStudioView } from '../PipelineUtils'
import { usePipelineQuestParamState } from '../PipelineQueryParamState/usePipelineQueryParam'

const logger = loggerFor(ModuleName.CD)

export const getPipelineByIdentifier = (
  params: GetPipelineQueryParams,
  identifier: string
): Promise<PipelineInfoConfig | undefined> => {
  return getPipelinePromise({
    pipelineIdentifier: identifier,
    queryParams: {
      accountIdentifier: params.accountIdentifier,
      orgIdentifier: params.orgIdentifier,
      projectIdentifier: params.projectIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  }).then(response => {
    let obj = {} as ResponseNGPipelineResponse
    if (typeof response === 'string') {
      obj = parse(response as string).data.yamlPipeline
    } else if (response.data?.yamlPipeline) {
      obj = response
    }
    if (obj.status === 'SUCCESS' && obj.data?.yamlPipeline) {
      return parse(obj.data.yamlPipeline).pipeline as PipelineInfoConfig
    }
  })
}

export const savePipeline = (
  params: PutPipelineQueryParams,
  pipeline: PipelineInfoConfig,
  isEdit = false
): Promise<Failure | undefined> => {
  // we need to do this due to https://github.com/eemeli/yaml/issues/239
  // can remove it once fixed
  const body = stringify(
    JSON.parse(
      JSON.stringify({
        pipeline: { ...pipeline, ...pick(params, 'projectIdentifier', 'orgIdentifier') }
      })
    )
  )
  return isEdit
    ? putPipelinePromise({
        pipelineIdentifier: pipeline.identifier,
        queryParams: {
          accountIdentifier: params.accountIdentifier,
          projectIdentifier: params.projectIdentifier,
          orgIdentifier: params.orgIdentifier
        },
        body: body as any,
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      }).then(response => {
        if (typeof response === 'string') {
          return JSON.parse(response as string) as Failure
        } else {
          return response
        }
      })
    : createPipelinePromise({
        body: body as any,
        queryParams: {
          accountIdentifier: params.accountIdentifier,
          projectIdentifier: params.projectIdentifier,
          orgIdentifier: params.orgIdentifier
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      }).then(async (response: unknown) => {
        if (typeof response === 'string') {
          return JSON.parse((response as unknown) as string) as Failure
        } else {
          return (response as unknown) as Failure
        }
      })
}

const DBInitializationFailed = 'DB Creation retry exceeded.'

let IdbPipeline: IDBPDatabase | undefined
const IdbPipelineStoreName = 'pipeline-cache'
export const PipelineDBName = 'pipeline-db'
const KeyPath = 'identifier'

export interface StageAttributes {
  name: string
  type: string
  icon: IconName
  iconColor: string
  isApproval: boolean
  openExecutionStrategy: boolean
}
export interface StagesMap {
  [key: string]: StageAttributes
}

export interface PipelineContextInterface {
  state: PipelineReducerState
  stagesMap: StagesMap
  stepsFactory: AbstractStepFactory
  view: string
  isReadonly: boolean
  setView: (view: PipelineStudioView) => void
  renderPipelineStage: (args: Omit<PipelineStagesProps, 'children'>) => React.ReactElement<PipelineStagesProps>
  fetchPipeline: (forceFetch?: boolean, forceUpdate?: boolean, newPipelineId?: string) => Promise<void>
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
  updatePipeline: (pipeline: PipelineInfoConfig) => Promise<void>
  updatePipelineView: (data: PipelineViewData) => void
  deletePipelineCache: () => Promise<void>
  getStageFromPipeline: (
    stageId: string,
    pipeline?: PipelineInfoConfig
  ) => { stage: StageElementWrapper | undefined; parent: StageElementWrapper | undefined }
  runPipeline: (identifier: string) => void
  pipelineSaved: (pipeline: PipelineInfoConfig) => void
  updateStage: (stage: StageElementConfig) => Promise<void>
  setSelectedStageId: (selectedStageId: string | undefined) => void
  setSelectedStepId: (selectedStepId: string | undefined) => void
}

interface PipelinePayload {
  identifier: string
  pipeline: PipelineInfoConfig | undefined
  originalPipeline?: PipelineInfoConfig
  isUpdated: boolean
}

const getId = (
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  pipelineIdentifier: string
): string => `${accountIdentifier}_${orgIdentifier}_${projectIdentifier}_${pipelineIdentifier}`

const _fetchPipeline = async (
  dispatch: React.Dispatch<ActionReturnType>,
  queryParams: GetPipelineQueryParams,
  identifier: string,
  forceFetch = false,
  forceUpdate = false,
  newPipelineId?: string
): Promise<void> => {
  const pipelineId = newPipelineId || identifier
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    pipelineId
  )
  if (IdbPipeline) {
    dispatch(PipelineContextActions.fetching())
    const data: PipelinePayload = await IdbPipeline.get(IdbPipelineStoreName, id)
    if ((!data || forceFetch) && pipelineId !== DefaultNewPipelineId) {
      const pipeline = await getPipelineByIdentifier(queryParams, pipelineId)
      const payload: PipelinePayload = {
        [KeyPath]: id,
        pipeline,
        originalPipeline: cloneDeep(pipeline),
        isUpdated: false
      }
      if (data && !forceUpdate) {
        dispatch(
          PipelineContextActions.success({
            error: '',
            pipeline: data.pipeline,
            originalPipeline: cloneDeep(pipeline),
            isBEPipelineUpdated: !isEqual(pipeline, data.originalPipeline),
            isUpdated: !isEqual(pipeline, data.pipeline)
          })
        )
        dispatch(PipelineContextActions.initialized())
      } else {
        await IdbPipeline.put(IdbPipelineStoreName, payload)
        dispatch(
          PipelineContextActions.success({
            error: '',
            pipeline,
            originalPipeline: cloneDeep(pipeline),
            isBEPipelineUpdated: false,
            isUpdated: false
          })
        )
        dispatch(PipelineContextActions.initialized())
      }
    } else {
      dispatch(
        PipelineContextActions.success({
          error: '',
          pipeline: data?.pipeline || {
            ...DefaultPipeline,
            projectIdentifier: queryParams.projectIdentifier,
            orgIdentifier: queryParams.orgIdentifier
          },
          originalPipeline:
            cloneDeep(data?.pipeline) ||
            cloneDeep({
              ...DefaultPipeline,
              projectIdentifier: queryParams.projectIdentifier,
              orgIdentifier: queryParams.orgIdentifier
            }),
          isUpdated: true,
          isBEPipelineUpdated: false
        })
      )
      dispatch(PipelineContextActions.initialized())
    }
  } else {
    dispatch(PipelineContextActions.success({ error: 'DB is not initialized' }))
  }
}

const _getStageFromPipeline = (
  stageId: string,
  localPipeline: PipelineInfoConfig
): { stage: StageElementWrapper | undefined; parent: StageElementWrapper | undefined } => {
  let stage: StageElementWrapper | undefined = undefined
  let parent: StageElementWrapper | undefined = undefined
  if (localPipeline?.stages) {
    localPipeline.stages?.some?.(item => {
      if (item?.stage && item.stage.identifier === stageId) {
        stage = item
        return true
      } else if (item?.parallel) {
        stage = _getStageFromPipeline(stageId, ({ stages: item.parallel } as unknown) as PipelineInfoConfig).stage
        if (stage) {
          parent = item
          return true
        }
      }
    })
  }
  return { stage, parent }
}

const _softFetchPipeline = async (
  dispatch: React.Dispatch<ActionReturnType>,
  queryParams: GetPipelineQueryParams,
  pipelineId: string,
  originalPipeline: PipelineInfoConfig,
  pipeline: PipelineInfoConfig,
  pipelineView: PipelineReducerState['pipelineView'],
  selectionState: PipelineReducerState['selectionState']
): Promise<void> => {
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    pipelineId
  )
  if (IdbPipeline) {
    const data: PipelinePayload = await IdbPipeline.get(IdbPipelineStoreName, id)
    if (data?.pipeline && !isEqual(data.pipeline, pipeline)) {
      const isUpdated = !isEqual(originalPipeline, data.pipeline)
      if (!isEmpty(selectionState.selectedStageId) && selectionState.selectedStageId) {
        const stage = _getStageFromPipeline(selectionState.selectedStageId, data.pipeline).stage
        if (isNil(stage)) {
          dispatch(
            PipelineContextActions.success({
              error: '',
              pipeline: data.pipeline,
              isUpdated,
              pipelineView: {
                ...pipelineView,
                isSplitViewOpen: false,
                isDrawerOpened: false,
                drawerData: { type: DrawerTypes.StepConfig },
                splitViewData: {}
              }
            })
          )
        } else {
          dispatch(PipelineContextActions.success({ error: '', pipeline: data.pipeline, isUpdated }))
        }
      } else {
        dispatch(PipelineContextActions.success({ error: '', pipeline: data.pipeline, isUpdated }))
      }
    }
  } else {
    dispatch(PipelineContextActions.success({ error: 'DB is not initialized' }))
  }
}

const _updatePipeline = async (
  dispatch: React.Dispatch<ActionReturnType>,
  queryParams: GetPipelineQueryParams,
  identifier: string,
  originalPipeline: PipelineInfoConfig,
  pipeline: PipelineInfoConfig
): Promise<void> => {
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier
  )
  if (IdbPipeline) {
    const isUpdated = !isEqual(originalPipeline, pipeline)
    const payload: PipelinePayload = {
      [KeyPath]: id,
      pipeline,
      originalPipeline,
      isUpdated
    }
    await IdbPipeline.put(IdbPipelineStoreName, payload)
    dispatch(PipelineContextActions.success({ error: '', pipeline, isUpdated }))
  }
}

const cleanUpDBRefs = (): void => {
  if (IdbPipeline) {
    IdbPipeline.close()
    IdbPipeline = undefined
  }
}

const _initializeDb = async (dispatch: React.Dispatch<ActionReturnType>, version: number, trial = 0): Promise<void> => {
  if (!IdbPipeline) {
    try {
      dispatch(PipelineContextActions.updating())
      IdbPipeline = await openDB(PipelineDBName, version, {
        upgrade(db) {
          try {
            db.deleteObjectStore(IdbPipelineStoreName)
          } catch (_) {
            logger.error('There was no DB found')
            dispatch(PipelineContextActions.error({ error: 'There was no DB found' }))
          }
          const objectStore = db.createObjectStore(IdbPipelineStoreName, { keyPath: KeyPath, autoIncrement: false })
          objectStore.createIndex(KeyPath, KeyPath, { unique: true })
        },
        async blocked() {
          cleanUpDBRefs()
        },
        async blocking() {
          cleanUpDBRefs()
        }
      })
      dispatch(PipelineContextActions.dbInitialized())
    } catch (e) {
      logger.info('DB downgraded, deleting and re creating the DB')

      await deleteDB(PipelineDBName)
      IdbPipeline = undefined

      ++trial

      if (trial < 5) {
        _initializeDb(dispatch, version, trial)
      } else {
        logger.error(DBInitializationFailed)
        dispatch(PipelineContextActions.error({ error: DBInitializationFailed }))
      }
    }
  } else {
    dispatch(PipelineContextActions.dbInitialized())
  }
}

const _deletePipelineCache = async (queryParams: GetPipelineQueryParams, identifier: string): Promise<void> => {
  if (IdbPipeline) {
    const id = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      identifier
    )
    await IdbPipeline.delete(IdbPipelineStoreName, id)
    const defaultId = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      DefaultNewPipelineId
    )
    await IdbPipeline.delete(IdbPipelineStoreName, defaultId)
  }
}

export const PipelineContext = React.createContext<PipelineContextInterface>({
  state: initialState,
  stepsFactory: {} as AbstractStepFactory,
  stagesMap: {},
  isReadonly: false,
  view: PipelineStudioView.ui,
  setView: () => void 0,
  runPipeline: () => undefined,
  // eslint-disable-next-line react/display-name
  renderPipelineStage: () => <div />,
  fetchPipeline: () => new Promise<void>(() => undefined),
  updatePipelineView: () => undefined,
  updateStage: () => new Promise<void>(() => undefined),
  getStageFromPipeline: () => ({ stage: undefined, parent: undefined }),
  setYamlHandler: () => undefined,
  updatePipeline: () => new Promise<void>(() => undefined),
  pipelineSaved: () => undefined,
  deletePipelineCache: () => new Promise<void>(() => undefined),
  setSelectedStageId: (_selectedStageId: string | undefined) => undefined,
  setSelectedStepId: (_selectedStepId: string | undefined) => undefined
})

export const PipelineProvider: React.FC<{
  queryParams: GetPipelineQueryParams
  pipelineIdentifier: string
  stepsFactory: AbstractStepFactory
  stagesMap: StagesMap
  runPipeline: (identifier: string) => void
  renderPipelineStage: PipelineContextInterface['renderPipelineStage']
}> = ({ queryParams, pipelineIdentifier, children, renderPipelineStage, stepsFactory, stagesMap, runPipeline }) => {
  const [state, dispatch] = React.useReducer(PipelineReducer, initialState)
  const [view, setView] = useLocalStorage<PipelineStudioView>('pipeline_studio_view', PipelineStudioView.ui)
  state.pipelineIdentifier = pipelineIdentifier

  const fetchPipeline = _fetchPipeline.bind(null, dispatch, queryParams, pipelineIdentifier)
  const updatePipeline = _updatePipeline.bind(null, dispatch, queryParams, pipelineIdentifier, state.originalPipeline)

  const [isEdit] = usePermission(
    {
      resourceScope: {
        ...queryParams
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true,
        skipCondition: (permissionCheck: PermissionCheck) => permissionCheck.resourceIdentifier !== '-1'
      }
    },
    [queryParams, pipelineIdentifier]
  )
  const isReadonly = !isEdit
  const deletePipelineCache = _deletePipelineCache.bind(null, queryParams, pipelineIdentifier)
  const pipelineSaved = React.useCallback(
    async (pipeline: PipelineInfoConfig) => {
      await deletePipelineCache()
      dispatch(PipelineContextActions.pipelineSavedAction({ pipeline, originalPipeline: cloneDeep(pipeline) }))
    },
    [deletePipelineCache]
  )
  const setYamlHandler = React.useCallback((yamlHandler: YamlBuilderHandlerBinding) => {
    dispatch(PipelineContextActions.setYamlHandler({ yamlHandler }))
  }, [])

  const updatePipelineView = React.useCallback((data: PipelineViewData) => {
    dispatch(PipelineContextActions.updatePipelineView({ pipelineView: data }))
  }, [])

  // stage/step selection
  const queryParamStateSelection = usePipelineQuestParamState()
  const setSelectedStageId = (selectedStageId: string | undefined) => {
    queryParamStateSelection.setPipelineQuestParamState({ stageId: selectedStageId })
  }
  const setSelectedStepId = (selectedStepId: string | undefined) => {
    queryParamStateSelection.setPipelineQuestParamState({ stepId: selectedStepId })
  }

  const updateSelectionState = React.useCallback((data: SelectionState) => {
    dispatch(PipelineContextActions.updateSelectionState({ selectionState: data }))
  }, [])

  React.useEffect(() => {
    updateSelectionState({
      selectedStageId: queryParamStateSelection.stageId as string,
      selectedStepId: queryParamStateSelection.stepId as string
    })
  }, [queryParamStateSelection.stepId, queryParamStateSelection.stageId])

  const getStageFromPipeline = React.useCallback(
    (stageId: string, pipeline?: PipelineInfoConfig) => {
      const localPipeline = pipeline || state.pipeline
      return _getStageFromPipeline(stageId, localPipeline)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pipeline, state.pipeline?.stages]
  )

  const updateStage = React.useCallback(
    async (newStage: StageElementConfig) => {
      function _updateStages(stages: StageElementWrapperConfig[]): StageElementWrapperConfig[] {
        return stages.map(node => {
          if (node.stage?.identifier === newStage.identifier) {
            return { stage: newStage }
          } else if (node.parallel) {
            return {
              parallel: _updateStages((node.parallel as unknown) as StageElementWrapperConfig[])
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          }

          return node
        })
      }

      return updatePipeline({
        ...state.pipeline,
        stages: _updateStages(state.pipeline.stages || [])
      })
    },
    [state.pipeline, updatePipeline]
  )

  useGlobalEventListener('focus', () => {
    _softFetchPipeline(
      dispatch,
      queryParams,
      pipelineIdentifier,
      state.originalPipeline,
      state.pipeline,
      state.pipelineView,
      state.selectionState
    )
  })

  React.useEffect(() => {
    if (state.isDBInitialized) {
      fetchPipeline(true)
    }
  }, [state.isDBInitialized])

  React.useEffect(() => {
    const time = SessionToken.getLastTokenSetTime()
    _initializeDb(dispatch, time || +new Date())
  }, [])

  return (
    <PipelineContext.Provider
      value={{
        state,
        view,
        setView,
        runPipeline,
        stepsFactory,
        stagesMap,
        getStageFromPipeline,
        renderPipelineStage,
        fetchPipeline,
        updatePipeline,
        updateStage,
        updatePipelineView,
        pipelineSaved,
        deletePipelineCache,
        isReadonly,
        setYamlHandler,
        setSelectedStageId,
        setSelectedStepId
      }}
    >
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipelineContext(): PipelineContextInterface {
  return React.useContext(PipelineContext)
}
