/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { openDB, IDBPDatabase, deleteDB } from 'idb'
import { isEqual, cloneDeep, pick, isNil, isEmpty, omit, defaultTo, set } from 'lodash-es'
import { parse } from 'yaml'
import { IconName, MultiTypeInputType, VisualYamlSelectedView as SelectedView } from '@wings-software/uicore'
import merge from 'lodash-es/merge'
import type { PipelineInfoConfig, StageElementConfig, StageElementWrapperConfig } from 'services/cd-ng'
import type { PermissionCheck } from 'services/rbac'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import SessionToken from 'framework/utils/SessionToken'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import {
  createPipelinePromise,
  createPipelineV2Promise,
  getPipelinePromise,
  GetPipelineQueryParams,
  putPipelinePromise,
  putPipelineV2Promise,
  Failure,
  EntityGitDetails,
  ResponsePMSPipelineResponseDTO,
  CreatePipelineQueryParams,
  PutPipelineQueryParams,
  EntityValidityDetails
} from 'services/pipeline-ng'
import { useGlobalEventListener, useLocalStorage, useQueryParams } from '@common/hooks'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { PipelineStageWrapper } from '@pipeline/utils/pipelineTypes'
import {
  getTemplateListPromise,
  GetTemplateListQueryParams,
  ResponsePageTemplateSummaryResponse
} from 'services/template-ng'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
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
  SelectionState,
  TemplateViewData
} from './PipelineActions'
import type { AbstractStepFactory } from '../../AbstractSteps/AbstractStepFactory'
import type { PipelineStagesProps } from '../../PipelineStages/PipelineStages'
import { PipelineSelectionState, usePipelineQuestParamState } from '../PipelineQueryParamState/usePipelineQueryParam'
import {
  getStagePathFromPipeline as _getStagePathFromPipeline,
  getStageFromPipeline as _getStageFromPipeline
} from './helpers'

interface PipelineInfoConfigWithGitDetails extends PipelineInfoConfig {
  gitDetails?: EntityGitDetails
  entityValidityDetails?: EntityValidityDetails
}

const logger = loggerFor(ModuleName.CD)

export const getTemplateTypesByRef = (params: GetTemplateListQueryParams, templateRefs: string[]) => {
  const scopedTemplates = templateRefs.reduce((a: { [key: string]: string[] }, b) => {
    const identifier = getIdentifierFromValue(b)
    const scope = getScopeFromValue(b)
    if (a[scope]) {
      a[scope].push(identifier)
    } else {
      a[scope] = [identifier]
    }
    return a
  }, {})
  const promises: Promise<ResponsePageTemplateSummaryResponse>[] = []
  Object.keys(scopedTemplates).forEach(scope => {
    promises.push(
      getTemplateListPromise({
        body: {
          filterType: 'Template',
          templateIdentifiers: scopedTemplates[scope]
        },
        queryParams: {
          ...params,
          projectIdentifier: scope === Scope.PROJECT ? params.projectIdentifier : undefined,
          orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? params.orgIdentifier : undefined
        }
      })
    )
  })
  return Promise.all(promises)
    .then(responses => {
      const templateTypes = {}
      responses.forEach(response => {
        response.data?.content?.forEach(item => {
          set(templateTypes, item.identifier || '', parse(item.yaml || '').template.spec.type)
        })
      })
      return templateTypes
    })
    .catch(_error => {
      return {}
    })
}

export const getPipelineByIdentifier = (
  params: GetPipelineQueryParams,
  identifier: string,
  signal?: AbortSignal
): Promise<PipelineInfoConfigWithGitDetails> => {
  return getPipelinePromise(
    {
      pipelineIdentifier: identifier,
      queryParams: {
        accountIdentifier: params.accountIdentifier,
        orgIdentifier: params.orgIdentifier,
        projectIdentifier: params.projectIdentifier,
        ...(params.repoIdentifier ? { repoIdentifier: params.repoIdentifier, branch: params.branch } : {})
      },
      requestOptions: {
        headers: {
          'content-type': 'application/yaml'
        }
      }
    },
    signal
  ).then(response => {
    let obj = {} as ResponsePMSPipelineResponseDTO
    if ((typeof response as unknown) === 'string') {
      obj = parse(response as string).data?.yamlPipeline || {}
    } else if (response.data?.yamlPipeline) {
      obj = response
    }
    if (obj.status === 'SUCCESS' && obj.data?.yamlPipeline) {
      return {
        ...parse(obj.data.yamlPipeline).pipeline,
        gitDetails: obj.data.gitDetails ?? {},
        entityValidityDetails: obj.data.entityValidityDetails ?? {}
      }
    }
    return obj
  })
}

export const savePipeline = (
  params: CreatePipelineQueryParams & PutPipelineQueryParams,
  pipeline: PipelineInfoConfig,
  isEdit = false,
  useAPIV2 = false
): Promise<Failure | undefined> => {
  const createPipeline = useAPIV2 ? createPipelineV2Promise : createPipelinePromise
  const updatePipeline = useAPIV2 ? putPipelineV2Promise : putPipelinePromise

  // we need to do this due to https://github.com/eemeli/yaml/issues/239
  // can remove it once fixed
  const body = yamlStringify(
    JSON.parse(
      JSON.stringify({
        pipeline: { ...pipeline, ...pick(params, 'projectIdentifier', 'orgIdentifier') }
      })
    ),
    { version: '1.1' }
  )
  return isEdit
    ? updatePipeline({
        pipelineIdentifier: pipeline.identifier,
        queryParams: {
          ...params
        },
        body: body as any,
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      }).then((response: any) => {
        if ((typeof response as unknown) === 'string') {
          return JSON.parse(response as string) as Failure
        } else {
          return response
        }
      })
    : createPipeline({
        body: body as any,
        queryParams: {
          ...params
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      }).then(async (response: unknown) => {
        if (typeof response === 'string') {
          return JSON.parse(response as unknown as string) as Failure
        } else {
          return response as unknown as Failure
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
  contextType: string
  allowableTypes: MultiTypeInputType[]
  isReadonly: boolean
  setSchemaErrorView: (flag: boolean) => void
  setView: (view: SelectedView) => void
  renderPipelineStage: (args: Omit<PipelineStagesProps, 'children'>) => React.ReactElement<PipelineStagesProps>
  fetchPipeline: (args: FetchPipelineUnboundProps) => Promise<void>
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
  setTemplateTypes: (data: { [key: string]: string }) => void
  updatePipeline: (pipeline: PipelineInfoConfig) => Promise<void>
  updateGitDetails: (gitDetails: EntityGitDetails) => Promise<void>
  updateEntityValidityDetails: (entityValidityDetails: EntityValidityDetails) => Promise<void>
  updatePipelineView: (data: PipelineViewData) => void
  updateTemplateView: (data: TemplateViewData) => void
  deletePipelineCache: (gitDetails?: EntityGitDetails) => Promise<void>
  getStageFromPipeline<T extends StageElementConfig = StageElementConfig>(
    stageId: string,
    pipeline?: PipelineInfoConfig | StageElementWrapperConfig
  ): PipelineStageWrapper<T>
  runPipeline: (identifier: string) => void
  pipelineSaved: (pipeline: PipelineInfoConfig) => void
  updateStage: (stage: StageElementConfig, existingStage?: StageElementConfig) => Promise<void>
  /** @deprecated use `setSelection` */
  setSelectedStageId: (selectedStageId: string | undefined) => void
  /** @deprecated use `setSelection` */
  setSelectedStepId: (selectedStepId: string | undefined) => void
  /** @deprecated use `setSelection` */
  setSelectedSectionId: (selectedSectionId: string | undefined) => void
  setSelection: (selectionState: PipelineSelectionState) => void
  getStagePathFromPipeline(stageId: string, prefix?: string, pipeline?: PipelineInfoConfig): string
}

interface PipelinePayload {
  identifier: string
  pipeline: PipelineInfoConfig | undefined
  originalPipeline?: PipelineInfoConfig
  isUpdated: boolean
  gitDetails: EntityGitDetails
  entityValidityDetails?: EntityValidityDetails
}

const getId = (
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  pipelineIdentifier: string,
  repoIdentifier = '',
  branch = ''
): string =>
  `${accountIdentifier}_${orgIdentifier}_${projectIdentifier}_${pipelineIdentifier}_${repoIdentifier}_${branch}`

export interface FetchPipelineBoundProps {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  pipelineIdentifier: string
  gitDetails: EntityGitDetails
}

export interface FetchPipelineUnboundProps {
  forceFetch?: boolean
  forceUpdate?: boolean
  newPipelineId?: string
  signal?: AbortSignal
  repoIdentifier?: string
  branch?: string
}

export const findAllByKey = (keyToFind: string, obj?: PipelineInfoConfig): string[] => {
  return obj
    ? Object.entries(obj).reduce(
        (acc: string[], [key, value]) =>
          key === keyToFind
            ? acc.concat(value as string)
            : typeof value === 'object'
            ? acc.concat(findAllByKey(keyToFind, value))
            : acc,
        []
      )
    : []
}

const getTemplateType = async (pipeline: PipelineInfoConfig, queryParams: GetPipelineQueryParams) => {
  const templateRefs = findAllByKey('templateRef', pipeline)
  return await getTemplateTypesByRef(
    {
      accountIdentifier: queryParams.accountIdentifier,
      orgIdentifier: queryParams.orgIdentifier,
      projectIdentifier: queryParams.projectIdentifier,
      templateListType: 'Stable'
    },
    templateRefs
  )
}

const _fetchPipeline = async (props: FetchPipelineBoundProps, params: FetchPipelineUnboundProps): Promise<void> => {
  const { dispatch, queryParams, pipelineIdentifier: identifier, gitDetails } = props
  const { forceFetch = false, forceUpdate = false, newPipelineId, signal, repoIdentifier, branch } = params
  const pipelineId = newPipelineId || identifier
  const id = getId(
    queryParams.accountIdentifier,
    defaultTo(queryParams.orgIdentifier, ''),
    defaultTo(queryParams.projectIdentifier, ''),
    pipelineId,
    defaultTo(gitDetails.repoIdentifier, ''),
    defaultTo(gitDetails.branch, '')
  )
  dispatch(PipelineContextActions.fetching())
  const data: PipelinePayload = await IdbPipeline?.get(IdbPipelineStoreName, id)
  if ((!data || forceFetch) && pipelineId !== DefaultNewPipelineId) {
    const pipelineWithGitDetails: PipelineInfoConfigWithGitDetails = await getPipelineByIdentifier(
      { ...queryParams, ...(repoIdentifier && branch ? { repoIdentifier, branch } : {}) },
      pipelineId,
      signal
    )
    const pipeline: PipelineInfoConfig = omit(
      pipelineWithGitDetails,
      'gitDetails',
      'entityValidityDetails',
      'repo',
      'branch'
    )
    const payload: PipelinePayload = {
      [KeyPath]: id,
      pipeline,
      originalPipeline: cloneDeep(pipeline),
      isUpdated: false,
      gitDetails: pipelineWithGitDetails?.gitDetails?.objectId
        ? pipelineWithGitDetails.gitDetails
        : data?.gitDetails ?? {},
      entityValidityDetails: defaultTo(
        pipelineWithGitDetails?.entityValidityDetails,
        defaultTo(data?.entityValidityDetails, {})
      )
    }
    if (data && !forceUpdate) {
      const templateTypes = data.pipeline ? await getTemplateType(data.pipeline, queryParams) : {}
      dispatch(
        PipelineContextActions.success({
          error: '',
          pipeline: data.pipeline,
          originalPipeline: cloneDeep(pipeline),
          isBEPipelineUpdated: !isEqual(pipeline, data.originalPipeline),
          isUpdated: !isEqual(pipeline, data.pipeline),
          gitDetails: pipelineWithGitDetails?.gitDetails?.objectId
            ? pipelineWithGitDetails.gitDetails
            : defaultTo(data?.gitDetails, {}),
          templateTypes,
          entityValidityDetails: defaultTo(
            pipelineWithGitDetails?.entityValidityDetails,
            defaultTo(data?.entityValidityDetails, {})
          )
        })
      )
    } else if (IdbPipeline) {
      await IdbPipeline.put(IdbPipelineStoreName, payload)
      const templateTypes = await getTemplateType(pipeline, queryParams)
      dispatch(
        PipelineContextActions.success({
          error: '',
          pipeline,
          originalPipeline: cloneDeep(pipeline),
          isBEPipelineUpdated: false,
          isUpdated: false,
          gitDetails: payload.gitDetails,
          entityValidityDetails: payload.entityValidityDetails,
          templateTypes
        })
      )
    } else {
      const templateTypes = await getTemplateType(pipeline, queryParams)
      dispatch(
        PipelineContextActions.success({
          error: '',
          pipeline,
          originalPipeline: cloneDeep(pipeline),
          isBEPipelineUpdated: false,
          isUpdated: false,
          gitDetails: pipelineWithGitDetails?.gitDetails?.objectId ? pipelineWithGitDetails.gitDetails : {},
          entityValidityDetails: defaultTo(pipelineWithGitDetails?.entityValidityDetails, {}),
          templateTypes
        })
      )
    }
    dispatch(PipelineContextActions.initialized())
  } else {
    dispatch(
      PipelineContextActions.success({
        error: '',
        pipeline: defaultTo(data?.pipeline, {
          ...DefaultPipeline,
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        }),
        originalPipeline: defaultTo(
          cloneDeep(data?.pipeline),
          cloneDeep({
            ...DefaultPipeline,
            projectIdentifier: queryParams.projectIdentifier,
            orgIdentifier: queryParams.orgIdentifier
          })
        ),
        isUpdated: true,
        isBEPipelineUpdated: false,
        gitDetails: defaultTo(data?.gitDetails, {}),
        entityValidityDetails: defaultTo(data?.entityValidityDetails, {})
      })
    )
    dispatch(PipelineContextActions.initialized())
  }
}

const _softFetchPipeline = async (
  dispatch: React.Dispatch<ActionReturnType>,
  queryParams: GetPipelineQueryParams,
  pipelineId: string,
  originalPipeline: PipelineInfoConfig,
  pipeline: PipelineInfoConfig,
  pipelineView: PipelineReducerState['pipelineView'],
  selectionState: PipelineReducerState['selectionState'],
  gitDetails: EntityGitDetails
): Promise<void> => {
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    pipelineId,
    gitDetails.repoIdentifier || '',
    gitDetails.branch || ''
  )
  if (IdbPipeline) {
    try {
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
    } catch (err) {
      dispatch(PipelineContextActions.success({ error: 'DB is not initialized' }))
    }
  } else {
    dispatch(PipelineContextActions.success({ error: 'DB is not initialized' }))
  }
}

interface UpdateGitDetailsArgs {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  identifier: string
  originalPipeline: PipelineInfoConfig
  pipeline: PipelineInfoConfig
}
const _updateGitDetails = async (args: UpdateGitDetailsArgs, gitDetails: EntityGitDetails): Promise<void> => {
  const { dispatch, queryParams, identifier, originalPipeline, pipeline } = args
  await _deletePipelineCache(queryParams, identifier, {})
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    gitDetails.repoIdentifier || '',
    gitDetails.branch || ''
  )
  const isUpdated = !isEqual(originalPipeline, pipeline)
  if (IdbPipeline) {
    const payload: PipelinePayload = {
      [KeyPath]: id,
      pipeline,
      originalPipeline,
      isUpdated,
      gitDetails
    }
    await IdbPipeline.put(IdbPipelineStoreName, payload)
  }
  dispatch(PipelineContextActions.success({ error: '', pipeline, isUpdated, gitDetails }))
}

interface UpdateEntityValidityDetailsArgs {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  identifier: string
  originalPipeline: PipelineInfoConfig
  pipeline: PipelineInfoConfig
  gitDetails: EntityGitDetails
}

const _updateEntityValidityDetails = async (
  args: UpdateEntityValidityDetailsArgs,
  entityValidityDetails: EntityValidityDetails
): Promise<void> => {
  const { dispatch, queryParams, identifier, originalPipeline, pipeline, gitDetails } = args
  await _deletePipelineCache(queryParams, identifier, {})
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    gitDetails.repoIdentifier || '',
    gitDetails.branch || ''
  )
  if (IdbPipeline) {
    const payload: PipelinePayload = {
      [KeyPath]: id,
      pipeline,
      originalPipeline,
      isUpdated: false,
      gitDetails,
      entityValidityDetails
    }
    await IdbPipeline.put(IdbPipelineStoreName, payload)
  }
  dispatch(PipelineContextActions.success({ error: '', pipeline, entityValidityDetails }))
}

interface UpdatePipelineArgs {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  identifier: string
  originalPipeline: PipelineInfoConfig
  pipeline: PipelineInfoConfig
  gitDetails: EntityGitDetails
}

const _updatePipeline = async (
  args: UpdatePipelineArgs,
  pipelineArg: PipelineInfoConfig | ((p: PipelineInfoConfig) => PipelineInfoConfig)
): Promise<void> => {
  const { dispatch, queryParams, identifier, originalPipeline, pipeline: latestPipeline, gitDetails } = args
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    gitDetails.repoIdentifier || '',
    gitDetails.branch || ''
  )

  let pipeline = pipelineArg
  if (typeof pipelineArg === 'function') {
    if (IdbPipeline) {
      const dbPipeline = await IdbPipeline.get(IdbPipelineStoreName, id)
      if (dbPipeline?.pipeline) {
        pipeline = pipelineArg(dbPipeline.pipeline)
      } else {
        pipeline = {} as PipelineInfoConfig
      }
    } else if (latestPipeline) {
      pipeline = pipelineArg(latestPipeline)
    } else {
      pipeline = {} as PipelineInfoConfig
    }
  }
  const isUpdated = !isEqual(omit(originalPipeline, 'repo', 'branch'), pipeline)
  const payload: PipelinePayload = {
    [KeyPath]: id,
    pipeline: pipeline as PipelineInfoConfig,
    originalPipeline,
    isUpdated,
    gitDetails
  }
  if (IdbPipeline) {
    await IdbPipeline.put(IdbPipelineStoreName, payload)
  }
  dispatch(PipelineContextActions.success({ error: '', pipeline: pipeline as PipelineInfoConfig, isUpdated }))
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
            // logger.error('There was no DB found')
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
        await _initializeDb(dispatch, version, trial)
      } else {
        logger.error(DBInitializationFailed)
        dispatch(PipelineContextActions.error({ error: DBInitializationFailed }))
      }
    }
  } else {
    dispatch(PipelineContextActions.dbInitialized())
  }
}

const _deletePipelineCache = async (
  queryParams: GetPipelineQueryParams,
  identifier: string,
  gitDetails?: EntityGitDetails
): Promise<void> => {
  if (IdbPipeline) {
    const id = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      identifier,
      gitDetails?.repoIdentifier || '',
      gitDetails?.branch || ''
    )
    await IdbPipeline.delete(IdbPipelineStoreName, id)
  }

  // due to async operation, IdbPipeline may be undefined
  if (IdbPipeline) {
    const defaultId = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      DefaultNewPipelineId,
      gitDetails?.repoIdentifier || '',
      gitDetails?.branch || ''
    )
    await IdbPipeline.delete(IdbPipelineStoreName, defaultId)
  }
}

export enum PipelineContextType {
  Pipeline = 'Pipeline',
  Template = 'Template'
}

export const PipelineContext = React.createContext<PipelineContextInterface>({
  state: initialState,
  stepsFactory: {} as AbstractStepFactory,
  stagesMap: {},
  setSchemaErrorView: () => undefined,
  isReadonly: false,
  view: SelectedView.VISUAL,
  contextType: PipelineContextType.Pipeline,
  allowableTypes: [],
  updateGitDetails: () => new Promise<void>(() => undefined),
  updateEntityValidityDetails: () => new Promise<void>(() => undefined),
  setView: () => void 0,
  runPipeline: () => undefined,
  // eslint-disable-next-line react/display-name
  renderPipelineStage: () => <div />,
  fetchPipeline: () => new Promise<void>(() => undefined),
  updatePipelineView: () => undefined,
  updateTemplateView: () => undefined,
  updateStage: () => new Promise<void>(() => undefined),
  getStageFromPipeline: () => ({ stage: undefined, parent: undefined }),
  setYamlHandler: () => undefined,
  setTemplateTypes: () => undefined,
  updatePipeline: () => new Promise<void>(() => undefined),
  pipelineSaved: () => undefined,
  deletePipelineCache: () => new Promise<void>(() => undefined),
  setSelectedStageId: (_selectedStageId: string | undefined) => undefined,
  setSelectedStepId: (_selectedStepId: string | undefined) => undefined,
  setSelectedSectionId: (_selectedSectionId: string | undefined) => undefined,
  setSelection: (_selectedState: PipelineSelectionState | undefined) => undefined,
  getStagePathFromPipeline: () => ''
})

export const PipelineProvider: React.FC<{
  queryParams: GetPipelineQueryParams
  pipelineIdentifier: string
  stepsFactory: AbstractStepFactory
  stagesMap: StagesMap
  runPipeline: (identifier: string) => void
  renderPipelineStage: PipelineContextInterface['renderPipelineStage']
}> = ({ queryParams, pipelineIdentifier, children, renderPipelineStage, stepsFactory, stagesMap, runPipeline }) => {
  const contextType = PipelineContextType.Pipeline
  const allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const abortControllerRef = React.useRef<AbortController | null>(null)
  const isMounted = React.useRef(false)
  const [state, dispatch] = React.useReducer(
    PipelineReducer,
    merge(
      {
        pipeline: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        },
        originalPipeline: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        }
      },
      initialState
    )
  )
  const [view, setView] = useLocalStorage<SelectedView>(
    'pipeline_studio_view',
    state.entityValidityDetails.valid === false ? SelectedView.YAML : SelectedView.VISUAL
  )
  state.pipelineIdentifier = pipelineIdentifier
  const fetchPipeline = _fetchPipeline.bind(null, {
    dispatch,
    queryParams,
    pipelineIdentifier,
    gitDetails: {
      repoIdentifier,
      branch
    }
  })
  const updateGitDetails = _updateGitDetails.bind(null, {
    dispatch,
    queryParams,
    identifier: pipelineIdentifier,
    originalPipeline: state.originalPipeline,
    pipeline: state.pipeline
  })
  const updateEntityValidityDetails = _updateEntityValidityDetails.bind(null, {
    dispatch,
    queryParams,
    identifier: pipelineIdentifier,
    originalPipeline: state.originalPipeline,
    pipeline: state.pipeline,
    gitDetails: state.gitDetails
  })
  const updatePipeline = _updatePipeline.bind(null, {
    dispatch,
    queryParams,
    identifier: pipelineIdentifier,
    originalPipeline: state.originalPipeline,
    pipeline: state.pipeline,
    gitDetails: state.gitDetails
  })

  const [isEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: queryParams.accountIdentifier,
        orgIdentifier: queryParams.orgIdentifier,
        projectIdentifier: queryParams.projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true,
        skipCondition: (permissionCheck: PermissionCheck) => {
          return permissionCheck.resourceIdentifier === '-1'
        }
      }
    },
    [queryParams.accountIdentifier, queryParams.orgIdentifier, queryParams.projectIdentifier, pipelineIdentifier]
  )
  const isReadonly = !isEdit
  const deletePipelineCache = _deletePipelineCache.bind(null, queryParams, pipelineIdentifier)
  const pipelineSaved = React.useCallback(
    async (pipeline: PipelineInfoConfig) => {
      await deletePipelineCache(state.gitDetails)
      dispatch(PipelineContextActions.pipelineSavedAction({ pipeline, originalPipeline: cloneDeep(pipeline) }))
    },
    [deletePipelineCache, state.gitDetails]
  )
  const setYamlHandler = React.useCallback((yamlHandler: YamlBuilderHandlerBinding) => {
    dispatch(PipelineContextActions.setYamlHandler({ yamlHandler }))
  }, [])

  const updatePipelineView = React.useCallback((data: PipelineViewData) => {
    dispatch(PipelineContextActions.updatePipelineView({ pipelineView: data }))
  }, [])

  const updateTemplateView = React.useCallback((data: TemplateViewData) => {
    dispatch(PipelineContextActions.updateTemplateView({ templateView: data }))
  }, [])

  // stage/step selection
  const queryParamStateSelection = usePipelineQuestParamState()
  const setSelection = (selectedState: PipelineSelectionState) => {
    queryParamStateSelection.setPipelineQuestParamState(selectedState)
  }
  /** @deprecated use `setSelection` */
  const setSelectedStageId = (selectedStageId: string | undefined): void => {
    queryParamStateSelection.setPipelineQuestParamState({ stageId: selectedStageId })
  }
  /** @deprecated use `setSelection` */
  const setSelectedStepId = (selectedStepId: string | undefined): void => {
    queryParamStateSelection.setPipelineQuestParamState({ stepId: selectedStepId })
  }
  /** @deprecated use `setSelection` */
  const setSelectedSectionId = (selectedSectionId: string | undefined): void => {
    queryParamStateSelection.setPipelineQuestParamState({ sectionId: selectedSectionId })
  }

  const updateSelectionState = React.useCallback((data: SelectionState) => {
    dispatch(PipelineContextActions.updateSelectionState({ selectionState: data }))
  }, [])

  React.useEffect(() => {
    updateSelectionState({
      selectedStageId: queryParamStateSelection.stageId as string,
      selectedStepId: queryParamStateSelection.stepId as string,
      selectedSectionId: queryParamStateSelection.sectionId as string
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParamStateSelection.stepId, queryParamStateSelection.stageId])

  const getStageFromPipeline = React.useCallback(
    <T extends StageElementConfig = StageElementConfig>(
      stageId: string,
      pipeline?: PipelineInfoConfig
    ): PipelineStageWrapper<T> => {
      const localPipeline = pipeline || state.pipeline
      return _getStageFromPipeline(stageId, localPipeline)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pipeline, state.pipeline?.stages]
  )

  const getStagePathFromPipeline = React.useCallback(
    (stageId: string, prefix = '', pipeline?: PipelineInfoConfig) => {
      const localPipeline = pipeline || state.pipeline
      return _getStagePathFromPipeline(stageId, prefix, localPipeline)
    },
    [state.pipeline, state.pipeline?.stages]
  )

  const setTemplateTypes = React.useCallback(templateTypes => {
    dispatch(PipelineContextActions.setTemplateTypes({ templateTypes }))
  }, [])

  const setSchemaErrorView = React.useCallback(flag => {
    dispatch(PipelineContextActions.updateSchemaErrorsFlag({ schemaErrors: flag }))
  }, [])

  const updateStage = React.useCallback(
    async (newStage: StageElementConfig) => {
      function _updateStages(stages: StageElementWrapperConfig[]): StageElementWrapperConfig[] {
        return stages.map(node => {
          if (node.stage?.identifier === newStage.identifier) {
            return { stage: newStage }
          } else if (node.parallel) {
            return {
              parallel: _updateStages(node.parallel)
            }
          }

          return node
        })
      }

      return updatePipeline(originalPipeline => ({
        ...originalPipeline,
        stages: _updateStages(originalPipeline.stages || [])
      }))
    },
    [updatePipeline]
  )

  useGlobalEventListener('focus', () => {
    _softFetchPipeline(
      dispatch,
      queryParams,
      pipelineIdentifier,
      state.originalPipeline,
      state.pipeline,
      state.pipelineView,
      state.selectionState,
      state.gitDetails
    )
  })

  React.useEffect(() => {
    if (state.isDBInitialized) {
      abortControllerRef.current = new AbortController()
      fetchPipeline({ forceFetch: true, signal: abortControllerRef.current?.signal })

      return () => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isDBInitialized])

  React.useEffect(() => {
    isMounted.current = true
    const time = SessionToken.getLastTokenSetTime()
    _initializeDb(dispatch, time || +new Date())

    return () => {
      isMounted.current = false
      cleanUpDBRefs()
    }
  }, [])

  return (
    <PipelineContext.Provider
      value={{
        state,
        view,
        contextType,
        allowableTypes,
        setView,
        runPipeline,
        stepsFactory,
        setSchemaErrorView,
        stagesMap,
        getStageFromPipeline,
        renderPipelineStage,
        fetchPipeline,
        updateGitDetails,
        updateEntityValidityDetails,
        updatePipeline,
        updateStage,
        updatePipelineView,
        updateTemplateView,
        pipelineSaved,
        deletePipelineCache,
        isReadonly,
        setYamlHandler,
        setSelectedStageId,
        setSelectedStepId,
        setSelectedSectionId,
        setSelection,
        getStagePathFromPipeline,
        setTemplateTypes
      }}
    >
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipelineContext(): PipelineContextInterface {
  // disabling this because this the definition of usePipelineContext
  // eslint-disable-next-line no-restricted-syntax
  return React.useContext(PipelineContext)
}
