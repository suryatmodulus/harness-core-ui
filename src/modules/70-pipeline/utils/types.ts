/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringNGVariable, NumberNGVariable, SecretNGVariable } from 'services/cd-ng'
import type { NodeRunInfo, ExpressionBlock } from 'services/pipeline-ng'

export type AllNGVariables = StringNGVariable | NumberNGVariable | SecretNGVariable

export interface ExecutionPageQueryParams {
  view?: 'log' | 'graph'
  stage?: string
  step?: string
  retryStep?: string
}

export interface ConditionalExecutionNodeRunInfo extends NodeRunInfo {
  expressions?: ExpressionBlock[]
}
