import React from 'react'
import { debounce } from 'lodash-es'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { StageElementConfig } from 'services/cd-ng'
import type { DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { EditStageView } from '../DeployStage/EditStageView/EditStageView'

export default function DeployStageSpecifications(props: React.PropsWithChildren<unknown>): JSX.Element {
  const {
    state: {
      selectionState: { selectedStageId = '' }
    },
    updateStage,
    isReadonly,
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const { stage } = getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleChange = React.useCallback(
    debounce((values: StageElementConfig): void => {
      updateStage({ ...stage?.stage, ...values })
    }, 300),
    [stage?.stage, updateStage]
  )

  return (
    <EditStageView isReadonly={isReadonly} data={stage} context={'setup'} onChange={handleChange}>
      {props.children}
    </EditStageView>
  )
}
