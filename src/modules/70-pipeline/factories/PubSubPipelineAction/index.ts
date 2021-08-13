import type { PipelineInfoConfig } from 'services/cd-ng'
import { PubSubAction } from './PubSubAction'
import type { PipelineActions } from './types'

interface PipelineActionArgs {
  pipeline: PipelineInfoConfig
  template?: PipelineInfoConfig
  values?: PipelineInfoConfig
}

export const PubSubPipelineActions = new PubSubAction<
  PipelineActions,
  PipelineActionArgs,
  Promise<PipelineInfoConfig | undefined>
>()
