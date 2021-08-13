import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'

import type { InputSetSelectorProps } from '@pipeline/components/InputSetSelector/InputSetSelector'
import type { GitQueryParams, PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export interface RunPipelineModalParams {
  pipelineIdentifier: string
  inputSetSelected?: InputSetSelectorProps['value']
}

export const useRunPipelineModal = (runPipelineModaParams: RunPipelineModalParams & GitQueryParams) => {
  const { inputSetSelected, pipelineIdentifier, branch, repoIdentifier } = runPipelineModaParams
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<PipelineType<ProjectPathProps>>()

  const history = useHistory()

  return (): void => {
    if (!inputSetSelected) {
      history.push(
        routes.toPipelineStudio({
          accountId,
          orgIdentifier,
          projectIdentifier,
          pipelineIdentifier,
          module,
          repoIdentifier,
          branch,
          runPipeline: true
        })
      )
    } else {
      history.push(
        routes.toPipelineStudio({
          accountId,
          orgIdentifier,
          projectIdentifier,
          pipelineIdentifier,
          module,
          inputSetType: inputSetSelected[0].type,
          inputSetLabel: inputSetSelected[0].label,
          inputSetValue: inputSetSelected[0].value as string,
          inputSetBranch: inputSetSelected[0].gitDetails?.branch,
          inputSetRepoIdentifier: inputSetSelected[0].gitDetails?.repoIdentifier,
          repoIdentifier,
          branch,
          runPipeline: true
        })
      )
    }
  }
}
