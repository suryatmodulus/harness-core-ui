import { useQueryParams, useUpdateQueryParams } from '@common/hooks'

export interface PipelineSelectionState {
  stageId?: string | null
  stepId?: string | null
  sectionId?: string | null
}

export function usePipelineQuestParamState() {
  const { stageId, stepId, sectionId } = useQueryParams<PipelineSelectionState>()
  const { updateQueryParams } = useUpdateQueryParams<PipelineSelectionState>()

  /**
   * Set selected stage/step.
   * Use null to clear state.
   * NOTE: Clearing 'stage' state will clear 'step' state too
   */
  const setPipelineQueryParamState = (state: PipelineSelectionState) => {
    /*if (isNull(state.stageId)) {
      state.stepId = null
    }*/

    // clear stepId when stageId is changed
    const newState = { ...state }
    if (state.stageId && state.stageId !== stageId) {
      newState.stepId = null
    }

    updateQueryParams({ stageId, stepId, sectionId, ...newState }, { skipNulls: true })
  }
  return { stageId, stepId, setPipelineQuestParamState: setPipelineQueryParamState, sectionId }
}
