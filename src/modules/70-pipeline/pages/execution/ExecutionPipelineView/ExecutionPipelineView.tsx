/*
 * Copyright 2020 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useLocation } from 'react-router-dom'

import ExecutionGraphView from './ExecutionGraphView/ExecutionGraphView'
import ExecutionLogView from './ExecutionLogView/ExecutionLogView'

export default function ExecutionPipelineView(): React.ReactElement {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)

  const view = queryParams.get('view')
  const isLogView = view === 'log'

  if (isLogView) {
    return <ExecutionLogView />
  }

  return <ExecutionGraphView />
}
