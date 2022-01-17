/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import BasePathDropdown from './Components/BasePathDropdown/BasePathDropdown'
import type { BasePathInterface } from './BasePath.types'
import { onBasePathChange } from './BasePath.utils'
import { MetricPathInitValue } from '../MetricPath/MetricPath.constants'

export default function BasePath({
  connectorIdentifier,
  appName,
  basePathValue,
  onChange
}: BasePathInterface): JSX.Element {
  return (
    <div>
      {Object.entries(basePathValue).map((item, index) => {
        const data = {
          key: item[0],
          value: item[1]
        }
        return (
          <BasePathDropdown
            onChange={selectedPathMetric => {
              const updatedMetric = onBasePathChange(selectedPathMetric, index, basePathValue)
              onChange('basePath', updatedMetric)
              onChange('metricPath', MetricPathInitValue)
            }}
            key={`${item}_${index}`}
            name={`basePath`}
            appName={appName}
            path={data.value.path}
            selectedValue={data.value.value}
            connectorIdentifier={connectorIdentifier}
          />
        )
      })}
    </div>
  )
}
