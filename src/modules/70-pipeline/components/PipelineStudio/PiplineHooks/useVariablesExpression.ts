/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useEffect, useState } from 'react'
import { identity, isEmpty, map, sortBy, sortedUniq } from 'lodash-es'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { usePipelineVariables } from '../../PipelineVariablesContext/PipelineVariablesContext'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
/**
 * Traverse over stage and find out all local fqn
 */
function traverseStageObject(
  jsonObj: Record<string, any>,
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
): string[] {
  const keys: string[] = []
  if (jsonObj !== null && typeof jsonObj == 'object') {
    Object.entries(jsonObj).forEach(([_key, value]) => {
      keys.push(...traverseStageObject(value, metadataMap))
    })
  } else if (metadataMap[jsonObj]) {
    keys.push(jsonObj)
  }
  return keys
}

/**
 * Hook to integrate and get expression for local stage and other stage
 */
export function useVariablesExpression(): { expressions: string[] } {
  const { variablesPipeline, metadataMap, initLoading } = usePipelineVariables()
  const [expressions, setExpressions] = useState<string[]>([])
  const [localStageKeys, setLocalStageKeys] = useState<string[]>([])
  const {
    state: { selectionState: { selectedStageId } = { selectedStageId: '' } },
    getStageFromPipeline
  } = usePipelineContext()

  useEffect(() => {
    if (!initLoading && selectedStageId && !isEmpty(selectedStageId)) {
      const stage = getStageFromPipeline(selectedStageId, variablesPipeline).stage
      if (stage) {
        const keys = traverseStageObject(stage, metadataMap)
        setLocalStageKeys(keys)
      }
    }
  }, [variablesPipeline, initLoading, selectedStageId, metadataMap, getStageFromPipeline])

  useEffect(() => {
    if (!initLoading && metadataMap) {
      const expression = sortedUniq(
        sortBy(
          map(metadataMap, (item, index) =>
            localStageKeys.indexOf(index) > -1 ? item.yamlProperties?.localName || '' : item.yamlProperties?.fqn || ''
          ).filter(p => p),
          identity
        )
      )
      const outputExpression = sortedUniq(
        sortBy(
          map(metadataMap, (item, index) =>
            localStageKeys.indexOf(index) > -1
              ? item.yamlOutputProperties?.localName || ''
              : item.yamlOutputProperties?.fqn || ''
          ).filter(p => p),
          identity
        )
      )
      setExpressions([...expression, ...outputExpression])
    }
  }, [initLoading, metadataMap, localStageKeys])

  return { expressions }
}
