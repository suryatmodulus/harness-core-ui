import { parse } from 'yaml'
import { get } from 'immer/dist/internal'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { loggerFor } from 'framework/logging/logging'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { ModuleName } from 'framework/types/ModuleName'
import { getConnectorSuggestions } from '../PipelineSteps/EditorSuggestionUtils'

const logger = loggerFor(ModuleName.CI)

/* istanbul ignore next */
export const getConnectorList = async (
  connectorTypes: string[] | undefined,
  path: string,
  yaml: string,
  params: Record<string, unknown>
): Promise<CompletionItemInterface[]> => {
  if (connectorTypes?.length) {
    return getConnectorSuggestions(params, connectorTypes)
  }
  let pipelineObj
  try {
    pipelineObj = parse(yaml)
  } catch (err) {
    logger.error('Error while parsing the yaml', err)
  }
  if (pipelineObj) {
    const obj = get(pipelineObj, path.replace('.spec.connectorRef', ''))
    if (obj.type === StepType.Dependency) {
      return getConnectorSuggestions(params, ['Gcp', 'Aws', 'DockerRegistry'])
    }
  }
  return []
}
