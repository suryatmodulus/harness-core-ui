/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { parse } from 'yaml'
import { useParams } from 'react-router-dom'

import { debounce, defaultTo, get, isPlainObject } from 'lodash-es'
import type { PipelineInfoConfig } from 'services/cd-ng'
import type { VariableMergeServiceResponse, Failure } from 'services/pipeline-ng'
import { useMutateAsGet } from '@common/hooks'
import type { UseMutateAsGetReturn } from '@common/hooks/useMutateAsGet'
import { useCreateVariables } from 'services/pipeline-ng'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { getRegexForSearch } from '../LogsContent/LogsState/utils'
export interface KVPair {
  [key: string]: string
}
export interface SearchResult {
  value: string
  type: 'key' | 'value'
  metaKeyId: string
  path?: string
}
export interface PipelineVariablesData {
  variablesPipeline: PipelineInfoConfig
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  error?: UseMutateAsGetReturn<Failure | Error>['error'] | null
  initLoading: boolean
  loading: boolean
  onSearchInputChange?: (value: string) => void
  goToPrevSearchResult?: (value: string) => void
  goToNextSearchResult?: (value: string) => void
  metaKeyToPathMap?: KVPair[]
  searchText?: string
  searchIndex?: number | null
  searchResults?: SearchResult[]
}
export interface SearchMeta {
  searchText?: string
  pipelineMetaKeys?: PipelineMeta[]
  pipelineFqns?: PipelineMeta[]
  pipelineValues?: PipelineMeta[]
  searchResults?: SearchResult[]
  searchIndex?: number | null
}

export interface GetPathToMetaKeyMapParams {
  path?: string
  pipelineMetaKeys?: PipelineMeta[]
  pipelineFqns?: PipelineMeta[]
  pipelineValues?: PipelineMeta[]
  data: KVPair
  metaDataMap: any
  pipeline: PipelineInfoConfig
}

export interface PipelineMeta {
  value: string
  metaKeyId: string
}
export const PipelineVariablesContext = React.createContext<PipelineVariablesData>({
  variablesPipeline: { name: '', identifier: '' },
  metadataMap: {},
  error: null,
  initLoading: true,
  loading: false
})

export function usePipelineVariables(): PipelineVariablesData {
  return React.useContext(PipelineVariablesContext)
}

export function PipelineVariablesContextProvider(
  props: React.PropsWithChildren<{ pipeline: PipelineInfoConfig }>
): React.ReactElement {
  const { pipeline: originalPipeline } = props
  const [{ variablesPipeline, metadataMap }, setPipelineVariablesData] = React.useState<
    Pick<PipelineVariablesData, 'metadataMap' | 'variablesPipeline'>
  >({
    variablesPipeline: { name: '', identifier: '' },
    metadataMap: {}
  })
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelinePathProps>()
  const [{ searchText, searchResults, searchIndex, pipelineValues, pipelineFqns, pipelineMetaKeys }, setSearchMeta] =
    React.useState<SearchMeta>({
      searchText: '',
      pipelineMetaKeys: [],
      pipelineFqns: [],
      searchResults: [],
      pipelineValues: [],
      searchIndex: 0
    })

  const updateSearchMeta = (newState: SearchMeta): void => {
    setSearchMeta(oldState => ({
      ...oldState,
      ...newState
    }))
  }
  const { data, error, initLoading, loading } = useMutateAsGet(useCreateVariables, {
    body: yamlStringify({ pipeline: originalPipeline }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    },
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    debounce: 800
  })

  React.useEffect(() => {
    const {
      pipelineFqns: updatedPipelineFqns,
      pipelineMetaKeys: updatedPipelineMetaKeys,
      pipelineValues: updatedPipelineValues
    } = getPathToMetaKeyMap({
      data: variablesPipeline as any,
      metaDataMap: metadataMap,
      pipeline: originalPipeline
    })

    updateSearchMeta({
      pipelineMetaKeys: updatedPipelineMetaKeys,
      pipelineFqns: updatedPipelineFqns,
      pipelineValues: updatedPipelineValues
    })
  }, [variablesPipeline, metadataMap, originalPipeline])

  React.useEffect(() => {
    setPipelineVariablesData({
      metadataMap: defaultTo(data?.data?.metadataMap, {}),
      variablesPipeline: defaultTo(parse(defaultTo(data?.data?.yaml, ''))?.pipeline, {})
    })
  }, [data?.data?.metadataMap, data?.data?.yaml])

  const onSearchInputChange = debounce((searchKey: string) => {
    if (searchKey !== searchText) {
      const finalFound = findMatchedResultsInPipeline(pipelineFqns, pipelineValues, pipelineMetaKeys, searchKey)
      updateSearchMeta({
        searchText: searchKey,
        searchResults: finalFound,
        searchIndex: searchKey.length > 0 ? 0 : null
      })
    }
  }, 300)

  const goToPrevSearchResult = (): false | void =>
    (searchIndex as number) > 0 && updateSearchMeta({ searchIndex: (searchIndex as number) - 1 })

  const goToNextSearchResult = (): false | void =>
    (searchIndex as number) < (searchResults as [])?.length - 1 &&
    updateSearchMeta({ searchIndex: (searchIndex as number) + 1 })

  return (
    <PipelineVariablesContext.Provider
      value={{
        variablesPipeline,
        metadataMap,
        error,
        initLoading,
        loading,
        onSearchInputChange,
        searchResults,
        searchText,
        searchIndex,
        goToPrevSearchResult,
        goToNextSearchResult
      }}
    >
      {props.children}
    </PipelineVariablesContext.Provider>
  )
}
export const findMatchedResultsInPipeline = (
  pipelineFqns: PipelineMeta[] = [],
  pipelineValues: PipelineMeta[] = [],
  pipelineMetaKeys: PipelineMeta[] = [],
  needle: string
): SearchResult[] => {
  const finalFound: SearchResult[] = []
  pipelineFqns.forEach(({ value: fqn, metaKeyId }, index) => {
    const fqnParts = fqn ? defaultTo(fqn?.split('.'), '') : ''
    const path = defaultTo(pipelineMetaKeys?.[index]?.value, '')
    //removes pipeline tags from search as we are showing them in popover

    if (fqnParts.length && fqnParts[fqnParts.length - 1]?.toLowerCase()?.includes(needle.toLocaleLowerCase())) {
      finalFound.push({ value: fqnParts[fqnParts.length - 1], type: 'key', metaKeyId, path })
    }
    let valueString = defaultTo(pipelineValues?.[index]?.value, '')

    if (Array.isArray(valueString)) {
      valueString = valueString.map(item => (isPlainObject(item) ? JSON.stringify(item, null, 2) : item)).join(', ')
    }
    if (typeof valueString !== 'string') {
      valueString = `${valueString}`
    }
    if (valueString.length && valueString?.toLowerCase()?.includes(needle.toLocaleLowerCase())) {
      finalFound.push({ value: valueString, type: 'value', metaKeyId, path })
    }
  })

  return finalFound
}

export function getPathToMetaKeyMap({
  path = '',
  pipelineMetaKeys = [],
  data,
  metaDataMap,
  pipelineFqns = [],
  pipelineValues = [],
  pipeline
}: GetPathToMetaKeyMapParams): {
  pipelineMetaKeys: PipelineMeta[]
  pipelineFqns: PipelineMeta[]
  pipelineValues: PipelineMeta[]
} {
  if (!data) {
    return {
      pipelineMetaKeys,
      pipelineFqns,
      pipelineValues
    }
  }
  if (Array.isArray(data)) {
    if (path.includes('variables')) {
      for (let index = data.length - 1; index >= 0; index--) {
        if (Array.isArray(data[index]) || typeof data[index] === 'object') {
          getPathToMetaKeyMap({
            path: `${path}[${index}]`,
            pipelineFqns,
            pipelineMetaKeys,
            data: data[index],
            metaDataMap,
            pipeline,
            pipelineValues
          })
        }
      }
    } else {
      data?.forEach((item, index) => {
        if (Array.isArray(item) || typeof item === 'object') {
          getPathToMetaKeyMap({
            path: `${path}[${index}]`,
            pipelineFqns,
            pipelineMetaKeys,
            data: item,
            metaDataMap,
            pipeline,
            pipelineValues
          })
        }
      })
    }
  } else if (typeof data === 'object') {
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === 'string' && metaDataMap[value]) {
        const metaKeyId = value
        const { yamlProperties, yamlOutputProperties } = metaDataMap[value]
        const yamlProps = defaultTo(yamlProperties, yamlOutputProperties)
        const updatedPath = `${path.trim().length === 0 ? '' : `${path}.`}${key}`

        if (updatedPath.includes('__uuid')) {
          return
        }
        if (path.includes('variables')) {
          //
        } else {
          pipelineFqns.push({ value: yamlProps?.fqn, metaKeyId })
          pipelineMetaKeys.push({ metaKeyId, value: updatedPath })
          const valueAtPath = get(pipeline, updatedPath)

          pipelineValues.push({ value: valueAtPath, metaKeyId })
        }
      } else if (typeof value === 'object') {
        const updatedPath = `${path.trim().length === 0 ? '' : `${path}.`}${key}`
        return getPathToMetaKeyMap({
          path: updatedPath,
          pipelineFqns,
          pipelineMetaKeys,
          data: value as KVPair,
          metaDataMap,
          pipeline,
          pipelineValues
        })
      }

      if (typeof value === 'string' && metaDataMap[value] && path.includes('variables')) {
        updateSpecialFields({ value, path, metaDataMap, pipelineFqns, pipelineMetaKeys, pipelineValues, pipeline, key })
      }
    })
  }

  return {
    pipelineMetaKeys,
    pipelineFqns,
    pipelineValues
  }
}
export interface UpdateSpecialFieldParams {
  value: string
  path: string
  metaDataMap: unknown
  pipelineFqns: PipelineMeta[]
  pipelineMetaKeys: PipelineMeta[]
  pipelineValues: PipelineMeta[]
  pipeline: PipelineInfoConfig
  key: string
}
const updateSpecialFields = ({
  value,
  path,
  metaDataMap,
  pipelineFqns,
  pipelineMetaKeys,
  pipelineValues,
  pipeline,
  key
}: UpdateSpecialFieldParams): void => {
  const metaKeyId = value
  const { yamlProperties, yamlOutputProperties } = (metaDataMap as any)?.[value]

  const yamlProps = defaultTo(yamlProperties, yamlOutputProperties)
  const updatedPath = `${path.trim().length === 0 ? '' : `${path}.`}${key}`
  pipelineFqns.unshift({ value: yamlProps?.fqn, metaKeyId })
  pipelineMetaKeys.unshift({ metaKeyId, value: updatedPath })
  const valueAtPath = get(pipeline, updatedPath)
  pipelineValues.unshift({ value: valueAtPath, metaKeyId })
}
export interface GetTextWithSearchMarkersProps {
  txt?: string
  searchText?: string
  searchIndices?: number[]
  className?: string
}

export function getTextWithSearchMarkers(props: GetTextWithSearchMarkersProps): string {
  const { searchText, txt, className } = props
  if (!searchText) {
    return defaultTo(txt, '')
  }

  if (!txt) {
    return ''
  }

  const searchRegex = getRegexForSearch(searchText)
  let match: RegExpExecArray | null
  const chunks: Array<{ start: number; end: number }> = []

  while ((match = searchRegex.exec(txt)) !== null) {
    if (searchRegex.lastIndex > match.index) {
      chunks.push({
        start: match.index,
        end: searchRegex.lastIndex
      })

      if (match.index === searchRegex.lastIndex) {
        searchRegex.lastIndex++
      }
    }
  }

  let highlightedString = txt

  chunks.forEach(chunk => {
    const startShift = highlightedString.length - txt.length

    const openMarkTags = `${highlightedString.slice(
      0,
      chunk.start + startShift
    )}<mark  class="${className}"  ${'data-current-search-result="true"'}>${highlightedString.slice(
      chunk.start + startShift
    )}`

    const endShift = openMarkTags.length - txt.length
    const closeMarkTags = `${openMarkTags.slice(0, chunk.end + endShift)}</mark>${openMarkTags.slice(
      chunk.end + endShift
    )}`

    highlightedString = closeMarkTags
  })

  return highlightedString
}
