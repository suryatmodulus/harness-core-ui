import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { PubSubAction } from './PubSubAction'
import type { PipelineActions } from './types'

interface PipelineActionArgs {
  pipeline: PipelineInfoConfig
  template: PipelineInfoConfig
  accountPathProps: AccountPathProps
  values?: PipelineInfoConfig
}

export const PubSubPipelineActions = new PubSubAction<PipelineActions, PipelineActionArgs, PipelineInfoConfig>()
