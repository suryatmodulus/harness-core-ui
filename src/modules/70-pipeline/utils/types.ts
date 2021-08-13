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
