/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import merge from 'lodash-es/merge'
import { deleteDB, IDBPDatabase, openDB } from 'idb'
import { cloneDeep, defaultTo, isEqual } from 'lodash-es'
import { Color, VisualYamlSelectedView as SelectedView } from '@wings-software/uicore'
import { parse } from 'yaml'
import SessionToken from 'framework/utils/SessionToken'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { GetPipelineQueryParams } from 'services/pipeline-ng'
import { useLocalStorage } from '@common/hooks'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import {
  EntityGitDetails,
  EntityValidityDetails,
  getTemplateListPromise,
  GetTemplateListQueryParams,
  GetTemplateQueryParams,
  NGTemplateInfoConfig,
  TemplateSummaryResponse
} from 'services/template-ng'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import type { PermissionCheck } from 'services/rbac'
import { DefaultNewTemplateId, DefaultNewVersionLabel, DefaultTemplate } from 'framework/Templates/templates'
import { ActionReturnType, TemplateContextActions } from './TemplateActions'
import { initialState, TemplateReducer, TemplateReducerState, TemplateViewData } from './TemplateReducer'

const logger = loggerFor(ModuleName.CD)

const DBInitializationFailed = 'DB Creation retry exceeded.'

let IdbTemplate: IDBPDatabase | undefined
const IdbTemplateStoreName = 'template-cache'
export const TemplateDBName = 'template-db'
const KeyPath = 'identifier'

interface TemplatePayload {
  identifier: string
  template?: NGTemplateInfoConfig
  originalTemplate?: NGTemplateInfoConfig
  isUpdated: boolean
  versions?: string[]
  stableVersion?: string
  gitDetails?: EntityGitDetails
  entityValidityDetails?: EntityValidityDetails
  templateYaml?: string
}

const getId = (
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  templateIdentifier: string,
  versionLabel: string,
  repoIdentifier = '',
  branch = ''
): string =>
  `${accountIdentifier}_${orgIdentifier}_${projectIdentifier}_${templateIdentifier}_${encodeURIComponent(
    versionLabel
  )}_${repoIdentifier}_${branch}`

export interface FetchTemplateBoundProps {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetTemplateQueryParams
  templateIdentifier: string
  versionLabel?: string
  gitDetails: EntityGitDetails
  templateType: string
}

export interface FetchTemplateUnboundProps {
  forceFetch?: boolean
  forceUpdate?: boolean
  signal?: AbortSignal
  repoIdentifier?: string
  branch?: string
}

const getTemplatesByIdentifier = (
  queryParams: GetTemplateListQueryParams,
  identifier: string,
  signal?: AbortSignal
): Promise<TemplateSummaryResponse[]> => {
  return getTemplateListPromise(
    {
      queryParams,
      body: {
        filterType: 'Template',
        templateIdentifiers: [identifier]
      }
    },
    signal
  )
    .then(response => {
      if (response.status === 'SUCCESS' && response.data?.content) {
        return response.data?.content
      }
      throw new Error()
    })
    .catch(error => {
      throw new Error(error)
    })
}

interface DispatchTemplateSuccessArgs {
  dispatch: React.Dispatch<ActionReturnType>
  data: TemplatePayload
  forceUpdate: boolean
  template: NGTemplateInfoConfig
  templateYamlStr: string
  versions: string[]
  templateWithGitDetails: TemplateSummaryResponse | undefined
  id: string
  stableVersion: string | undefined
}
const dispatchTemplateSuccess = async (args: DispatchTemplateSuccessArgs): Promise<void> => {
  const {
    dispatch,
    data,
    forceUpdate,
    template,
    templateYamlStr,
    versions,
    templateWithGitDetails,
    id,
    stableVersion
  } = args
  if (data && !forceUpdate) {
    dispatch(
      TemplateContextActions.success({
        error: '',
        template: data.template,
        originalTemplate: cloneDeep(template),
        isBETemplateUpdated: !isEqual(template, data.originalTemplate),
        isUpdated: !isEqual(template, data.template),
        versions: versions,
        stableVersion: data.stableVersion,
        gitDetails: templateWithGitDetails?.gitDetails?.objectId
          ? templateWithGitDetails.gitDetails
          : defaultTo(data?.gitDetails, {}),
        entityValidityDetails: defaultTo(
          templateWithGitDetails?.entityValidityDetails,
          defaultTo(data?.entityValidityDetails, {})
        ),
        templateYaml: data?.templateYaml
      })
    )
    dispatch(TemplateContextActions.initialized())
  } else if (IdbTemplate) {
    const payload: TemplatePayload = {
      [KeyPath]: id,
      template: template,
      originalTemplate: cloneDeep(template),
      isUpdated: false,
      versions: versions,
      stableVersion: stableVersion,
      gitDetails: templateWithGitDetails?.gitDetails?.objectId
        ? templateWithGitDetails.gitDetails
        : defaultTo(data?.gitDetails, {}),
      entityValidityDetails: defaultTo(
        templateWithGitDetails?.entityValidityDetails,
        defaultTo(data?.entityValidityDetails, {})
      ),
      templateYaml: templateYamlStr
    }
    await IdbTemplate.put(IdbTemplateStoreName, payload)
    dispatch(
      TemplateContextActions.success({
        error: '',
        template: template,
        originalTemplate: cloneDeep(template),
        isBETemplateUpdated: false,
        isUpdated: false,
        versions: versions,
        stableVersion: stableVersion,
        gitDetails: payload.gitDetails,
        entityValidityDetails: payload.entityValidityDetails,
        templateYaml: payload.templateYaml
      })
    )
    dispatch(TemplateContextActions.initialized())
  } else {
    dispatch(
      TemplateContextActions.success({
        error: '',
        template: template,
        originalTemplate: cloneDeep(template),
        isBETemplateUpdated: false,
        isUpdated: false,
        versions: versions,
        stableVersion: stableVersion,
        gitDetails: templateWithGitDetails?.gitDetails?.objectId ? templateWithGitDetails.gitDetails : {},
        entityValidityDetails: defaultTo(templateWithGitDetails?.entityValidityDetails, {}),
        templateYaml: templateYamlStr
      })
    )
    dispatch(TemplateContextActions.initialized())
  }
}

const _fetchTemplate = async (props: FetchTemplateBoundProps, params: FetchTemplateUnboundProps): Promise<void> => {
  const { dispatch, queryParams, templateIdentifier, versionLabel = '', gitDetails, templateType } = props
  const { forceFetch = false, forceUpdate = false, signal, repoIdentifier, branch } = params
  const id = getId(
    queryParams.accountIdentifier,
    defaultTo(queryParams.orgIdentifier, ''),
    defaultTo(queryParams.projectIdentifier, ''),
    templateIdentifier,
    versionLabel,
    defaultTo(gitDetails.repoIdentifier, ''),
    defaultTo(gitDetails.branch, '')
  )
  if (IdbTemplate) {
    dispatch(TemplateContextActions.fetching())
    const data: TemplatePayload = await IdbTemplate.get(IdbTemplateStoreName, id)
    if ((!data || forceFetch) && templateIdentifier !== DefaultNewTemplateId) {
      const templatesList: TemplateSummaryResponse[] = await getTemplatesByIdentifier(
        {
          ...queryParams,
          templateListType: TemplateListType.All,
          ...(repoIdentifier && branch ? { repoIdentifier, branch } : {})
        },
        templateIdentifier,
        signal
      )
      const versions: string[] = templatesList.map(item => defaultTo(item.versionLabel, ''))
      const defaultVersion = defaultTo(templatesList.find(item => item.stableTemplate)?.versionLabel, '')
      const selectedVersion = versions.includes(versionLabel) ? versionLabel : defaultVersion
      const stableVersion = templatesList.find(item => item.stableTemplate)?.versionLabel
      const templateWithGitDetails = templatesList.find(item => item.versionLabel === selectedVersion)
      let template: NGTemplateInfoConfig
      const templateYamlStr = defaultTo(templateWithGitDetails?.yaml, '')
      try {
        template = defaultTo(parse(templateYamlStr)?.template, {})
      } catch (e) {
        // It is assumed that execution will come here, if there are only syntatical errors in yaml string
        template = {
          name: defaultTo(templateWithGitDetails?.name, ''),
          identifier: defaultTo(templateWithGitDetails?.identifier, ''),
          type: defaultTo(templateWithGitDetails?.childType, 'Step') as 'Step' | 'Stage',
          versionLabel: defaultTo(templateWithGitDetails?.versionLabel, ''),
          spec: {}
        }
      }

      dispatchTemplateSuccess({
        dispatch,
        data,
        forceUpdate,
        id,
        stableVersion,
        template,
        templateWithGitDetails,
        templateYamlStr,
        versions
      })
    } else {
      dispatch(
        TemplateContextActions.success({
          error: '',
          template: defaultTo(data?.template, {
            ...DefaultTemplate,
            type: templateType as NGTemplateInfoConfig['type'],
            projectIdentifier: queryParams.projectIdentifier,
            orgIdentifier: queryParams.orgIdentifier
          }),
          originalTemplate: defaultTo(
            cloneDeep(data?.template),
            cloneDeep({
              ...DefaultTemplate,
              type: templateType as NGTemplateInfoConfig['type'],
              projectIdentifier: queryParams.projectIdentifier,
              orgIdentifier: queryParams.orgIdentifier
            })
          ),
          isUpdated: true,
          isBETemplateUpdated: false,
          versions: [DefaultNewVersionLabel],
          stableVersion: DefaultNewVersionLabel,
          gitDetails: defaultTo(data?.gitDetails, {}),
          entityValidityDetails: defaultTo(data?.entityValidityDetails, {}),
          templateYaml: defaultTo(data?.templateYaml, '')
        })
      )
      dispatch(TemplateContextActions.initialized())
    }
  } else {
    dispatch(TemplateContextActions.success({ error: 'DB is not initialized' }))
  }
}

interface UpdateTemplateArgs {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetTemplateQueryParams
  identifier: string
  versionLabel?: string
  originalTemplate: NGTemplateInfoConfig
  versions: string[]
  stableVersion: string
  gitDetails?: EntityGitDetails
}

const _updateTemplate = async (
  args: UpdateTemplateArgs,
  templateArg: NGTemplateInfoConfig | ((p: NGTemplateInfoConfig) => NGTemplateInfoConfig)
): Promise<void> => {
  const {
    dispatch,
    queryParams,
    identifier,
    versionLabel = '',
    originalTemplate,
    versions,
    stableVersion,
    gitDetails
  } = args
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    versionLabel,
    defaultTo(gitDetails?.repoIdentifier, ''),
    defaultTo(gitDetails?.branch, '')
  )
  if (IdbTemplate) {
    let template = templateArg

    if (typeof templateArg === 'function') {
      const dbTemplate = await IdbTemplate.get(IdbTemplateStoreName, id)
      if (dbTemplate?.template) {
        template = templateArg(dbTemplate.template)
      } else {
        template = {} as NGTemplateInfoConfig
      }
    }
    const isUpdated = !isEqual(originalTemplate, template)
    const payload: TemplatePayload = {
      [KeyPath]: id,
      template: template as NGTemplateInfoConfig,
      originalTemplate,
      versions,
      stableVersion,
      isUpdated,
      gitDetails
    }
    if (IdbTemplate) {
      await IdbTemplate.put(IdbTemplateStoreName, payload)
      dispatch(TemplateContextActions.success({ error: '', template: template as NGTemplateInfoConfig, isUpdated }))
    }
  }
}

const cleanUpDBRefs = (): void => {
  if (IdbTemplate) {
    IdbTemplate.close()
    IdbTemplate = undefined
  }
}

const _initializeDb = async (dispatch: React.Dispatch<ActionReturnType>, version: number, trial = 0): Promise<void> => {
  if (!IdbTemplate) {
    try {
      dispatch(TemplateContextActions.updating())
      IdbTemplate = await openDB(TemplateDBName, version, {
        upgrade(db) {
          try {
            db.deleteObjectStore(IdbTemplateStoreName)
          } catch (_) {
            // logger.error('There was no DB found')
            dispatch(TemplateContextActions.error({ error: 'There was no DB found' }))
          }
          const objectStore = db.createObjectStore(IdbTemplateStoreName, { keyPath: KeyPath, autoIncrement: false })
          objectStore.createIndex(KeyPath, KeyPath, { unique: true })
        },
        async blocked() {
          cleanUpDBRefs()
        },
        async blocking() {
          cleanUpDBRefs()
        }
      })
      dispatch(TemplateContextActions.dbInitialized())
    } catch (e) {
      logger.info('DB downgraded, deleting and re creating the DB')

      await deleteDB(TemplateDBName)
      IdbTemplate = undefined

      ++trial

      if (trial < 5) {
        await _initializeDb(dispatch, version, trial)
      } else {
        logger.error(DBInitializationFailed)
        dispatch(TemplateContextActions.error({ error: DBInitializationFailed }))
      }
    }
  } else {
    dispatch(TemplateContextActions.dbInitialized())
  }
}

export interface TemplateAttributes {
  type: string
  primaryColor: Color
  secondaryColor: Color
}
export interface TemplatesMap {
  [key: string]: TemplateAttributes
}

export interface TemplateContextInterface {
  state: TemplateReducerState
  view: string
  isReadonly: boolean
  setView: (view: SelectedView) => void
  fetchTemplate: (args: FetchTemplateUnboundProps) => Promise<void>
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
  updateTemplate: (template: NGTemplateInfoConfig) => Promise<void>
  updateTemplateView: (data: TemplateViewData) => void
  deleteTemplateCache: (gitDetails?: EntityGitDetails) => Promise<void>
  setLoading: (loading: boolean) => void
  updateGitDetails: (gitDetails: EntityGitDetails) => Promise<void>
}

const _deleteTemplateCache = async (
  queryParams: GetTemplateQueryParams,
  identifier: string,
  versionLabel?: string,
  gitDetails?: EntityGitDetails
): Promise<void> => {
  if (IdbTemplate) {
    const id = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      identifier,
      versionLabel || '',
      defaultTo(gitDetails?.repoIdentifier, ''),
      defaultTo(gitDetails?.branch, '')
    )
    await IdbTemplate.delete(IdbTemplateStoreName, id)
  }

  // due to async operation, IdbPipeline may be undefined
  if (IdbTemplate) {
    const defaultId = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      DefaultNewTemplateId,
      DefaultNewVersionLabel,
      defaultTo(gitDetails?.repoIdentifier, ''),
      defaultTo(gitDetails?.branch, '')
    )
    await IdbTemplate.delete(IdbTemplateStoreName, defaultId)
  }
}
interface UpdateGitDetailsArgs {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetTemplateQueryParams
  identifier: string
  versionLabel?: string
  originalTemplate: NGTemplateInfoConfig
  template: NGTemplateInfoConfig
  versions: string[]
  stableVersion: string
}

const _updateGitDetails = async (args: UpdateGitDetailsArgs, gitDetails: EntityGitDetails): Promise<void> => {
  const { dispatch, queryParams, identifier, originalTemplate, template, versionLabel } = args
  await _deleteTemplateCache(queryParams, identifier, versionLabel, {})

  const id = getId(
    queryParams.accountIdentifier,
    defaultTo(queryParams.orgIdentifier, ''),
    defaultTo(queryParams.projectIdentifier, ''),
    identifier,
    defaultTo(versionLabel, ''),
    defaultTo(gitDetails.repoIdentifier, ''),
    defaultTo(gitDetails.branch, '')
  )

  const isUpdated = !isEqual(originalTemplate, template)
  if (IdbTemplate) {
    const payload: TemplatePayload = {
      [KeyPath]: id,
      template,
      originalTemplate,
      isUpdated,
      gitDetails
    }
    await IdbTemplate.put(IdbTemplateStoreName, payload)
  }
  dispatch(TemplateContextActions.success({ error: '', template, isUpdated, gitDetails }))
}

export const TemplateContext = React.createContext<TemplateContextInterface>({
  state: initialState,
  isReadonly: false,
  view: SelectedView.VISUAL,
  setView: () => void 0,
  fetchTemplate: () => new Promise<void>(() => undefined),
  updateTemplateView: () => undefined,
  setYamlHandler: () => undefined,
  updateTemplate: () => new Promise<void>(() => undefined),
  deleteTemplateCache: () => new Promise<void>(() => undefined),
  setLoading: () => void 0,
  updateGitDetails: () => new Promise<void>(() => undefined)
})

export const TemplateProvider: React.FC<{
  queryParams: GetPipelineQueryParams
  templateIdentifier: string
  versionLabel?: string
  templateType: string
}> = ({ queryParams, templateIdentifier, versionLabel, templateType, children }) => {
  const { repoIdentifier, branch } = queryParams
  const abortControllerRef = React.useRef<AbortController | null>(null)
  const isMounted = React.useRef(false)
  const [state, dispatch] = React.useReducer(
    TemplateReducer,
    merge(
      {
        template: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        },
        originalTemplate: {
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
  state.templateIdentifier = templateIdentifier
  const fetchTemplate = _fetchTemplate.bind(null, {
    dispatch,
    queryParams,
    templateIdentifier,
    versionLabel,
    gitDetails: {
      repoIdentifier,
      branch
    },
    templateType
  })

  const updateTemplate = _updateTemplate.bind(null, {
    dispatch,
    queryParams,
    identifier: templateIdentifier,
    versionLabel: versionLabel,
    originalTemplate: state.originalTemplate,
    versions: state.versions,
    stableVersion: state.stableVersion,
    gitDetails: state.gitDetails
  })

  const updateGitDetails = _updateGitDetails.bind(null, {
    dispatch,
    queryParams,
    identifier: templateIdentifier,
    versionLabel: versionLabel,
    originalTemplate: state.originalTemplate,
    template: state.template,
    versions: state.versions,
    stableVersion: state.stableVersion
  })

  const setLoading = (isLoading: boolean) => {
    dispatch(TemplateContextActions.loading({ isLoading }))
  }

  const [isEdit] = usePermission(
    {
      resourceScope: {
        accountIdentifier: queryParams.accountIdentifier,
        orgIdentifier: queryParams.orgIdentifier,
        projectIdentifier: queryParams.projectIdentifier
      },
      resource: {
        resourceType: ResourceType.TEMPLATE,
        resourceIdentifier: templateIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_TEMPLATE],
      options: {
        skipCache: true,
        skipCondition: (permissionCheck: PermissionCheck) => {
          return permissionCheck.resourceIdentifier === '-1'
        }
      }
    },
    [queryParams.accountIdentifier, queryParams.orgIdentifier, queryParams.projectIdentifier, templateIdentifier]
  )

  const isReadonly = !isEdit
  const deleteTemplateCache = _deleteTemplateCache.bind(
    null,
    queryParams,
    templateIdentifier,
    versionLabel,
    state.gitDetails
  )
  const setYamlHandler = React.useCallback((yamlHandler: YamlBuilderHandlerBinding) => {
    dispatch(TemplateContextActions.setYamlHandler({ yamlHandler }))
  }, [])
  const updateTemplateView = React.useCallback((data: TemplateViewData) => {
    dispatch(TemplateContextActions.updateTemplateView({ templateView: data }))
  }, [])

  React.useEffect(() => {
    fetchTemplate({ forceFetch: true, forceUpdate: true })
  }, [templateIdentifier, versionLabel, repoIdentifier, branch])

  React.useEffect(() => {
    if (state.isDBInitialized) {
      abortControllerRef.current = new AbortController()

      fetchTemplate({ forceFetch: true, signal: abortControllerRef.current?.signal })
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
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
    <TemplateContext.Provider
      value={{
        state,
        view,
        setView,
        isReadonly,
        fetchTemplate,
        updateTemplate,
        updateTemplateView,
        deleteTemplateCache,
        setYamlHandler,
        setLoading,
        updateGitDetails
      }}
    >
      {children}
    </TemplateContext.Provider>
  )
}
