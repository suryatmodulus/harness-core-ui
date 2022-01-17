/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep } from 'lodash-es'
import { BasePathKeyPrefix } from './BasePath.constants'
import type { BasePathData } from './BasePath.types'

export const onBasePathChange = (selectedPath: string, index: number, basePathData: BasePathData): BasePathData => {
  // new logic
  const currentKey = BasePathKeyPrefix + index
  const nextItemKey = BasePathKeyPrefix + parseInt((index + 1).toString())
  const prvKey = BasePathKeyPrefix + index
  const path = basePathData[prvKey]?.path
  const lastItem = Object.keys(basePathData)[Object.keys(basePathData).length - 1]

  let basePathDetails = cloneDeep(basePathData)

  // delete values after index
  const lastIndex = parseInt(lastItem.split('_')[1])
  const lastItemexist = !!basePathDetails[lastItem]
  if (index < lastIndex && lastItemexist) {
    for (let idx = index + 1; idx <= lastIndex; idx++) {
      delete basePathDetails[BasePathKeyPrefix + idx]
    }
  }

  if (!basePathDetails[nextItemKey] && selectedPath) {
    // adding first time
    const nextPath = path?.length ? `${path}|${selectedPath}` : selectedPath
    basePathDetails = {
      ...basePathDetails,
      [nextItemKey]: { value: '', path: nextPath }
    }
  }

  return {
    ...basePathDetails,
    [currentKey]: { value: selectedPath, path }
  }
}
