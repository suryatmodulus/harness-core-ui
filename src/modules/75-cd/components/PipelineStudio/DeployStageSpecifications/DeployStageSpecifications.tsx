import React from 'react'
import { debounce } from 'lodash-es'
import { PipelineContext } from '@pipeline/exports'
import type { StageElementWrapper } from 'services/cd-ng'
import { EditStageView } from '../DeployStage/EditStageView/EditStageView'

export default function DeployStageSpecifications(props: React.PropsWithChildren<unknown>): JSX.Element {
  const {
    state: {
      pipelineView: {
        splitViewData: { selectedStageId }
      }
    },
    updateStage,
    isReadonly,
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const { stage } = getStageFromPipeline(selectedStageId || '')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleChange = React.useCallback(
    debounce((values: StageElementWrapper): void => {
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
