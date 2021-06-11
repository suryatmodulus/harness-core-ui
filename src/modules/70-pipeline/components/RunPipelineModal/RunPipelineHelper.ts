import type { NgPipeline, StageElementWrapper } from 'services/cd-ng'
import type { InputSetErrorResponse } from 'services/pipeline-ng'

interface NgPipelineTemplate {
  pipeline: NgPipeline
}

export const mergeTemplateWithInputSetData = (
  templatePipeline: NgPipelineTemplate,
  inputSetPortion: NgPipelineTemplate
): NgPipelineTemplate => {
  // Replace all the matching stages in parsedTemplate with the stages received in input set portion
  const mergedStages = templatePipeline.pipeline.stages?.map((stage: StageElementWrapper) => {
    const stageId = stage.stage?.identifier
    const matchedStageInInputSet = inputSetPortion.pipeline.stages?.find(stg => stg.stage.identifier === stageId)
    if (matchedStageInInputSet) {
      return matchedStageInInputSet
    }
    return stage
  })
  const toBeUpdated = templatePipeline
  toBeUpdated.pipeline.stages = mergedStages
  return toBeUpdated
}

// Used in Input Set form and save as input set call in run pipeline
export const getFormattedErrors = (apiErrorMap?: { [key: string]: InputSetErrorResponse }): Record<string, any> => {
  const toReturn: Record<string, any> = {}
  if (apiErrorMap) {
    const apiErrorKeys = Object.keys(apiErrorMap)
    apiErrorKeys.forEach(apiErrorKey => {
      const errorsForKey = apiErrorMap[apiErrorKey].errors || []
      if (errorsForKey[0].fieldName) {
        toReturn[errorsForKey[0].fieldName] = `${errorsForKey[0].fieldName}: ${errorsForKey[0].message}`
      }
    })
  }
  return toReturn
}
