import type { CIProperties, NgPipeline, StageElementWrapper } from 'services/cd-ng'
import type { InputSetErrorResponse } from 'services/pipeline-ng'

interface NgPipelineTemplate {
  pipeline: NgPipeline & { properties?: { ci?: CIProperties } }
}

export const mergeTemplateWithInputSetData = (
  templatePipeline: NgPipelineTemplate,
  inputSetPortion: NgPipelineTemplate,
  originalPipeline?: NgPipeline
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
  if (inputSetPortion.pipeline?.properties?.ci) {
    if (!toBeUpdated.pipeline.properties) {
      toBeUpdated.pipeline.properties = {}
    }
    toBeUpdated.pipeline.properties.ci = inputSetPortion.pipeline.properties.ci
  }
  /*
    Below portion adds variables to the pipeline.
    If your input sets has variables, use them.
    If none of the input sets portion have variables, use the original pipeline and update the variables with them.
    
    Eventually in run pipeline form -
    If input sets are selected, we will supply the variables from 'toBeUpdated' pipleine
    Else we will supply variables from original pipeline.

    This is why 'toBeUpdated' pipeline should have the variables

   */
  if (inputSetPortion.pipeline.variables) {
    // If we have variables saved in input set, pick them and update
    toBeUpdated.pipeline.variables = inputSetPortion.pipeline.variables
  } else if (originalPipeline?.variables) {
    // If we have variables with default values in the original pipeline, pick them
    toBeUpdated.pipeline.variables = (originalPipeline?.variables).map((variable: any) => {
      if (variable?.default) {
        return { ...variable, value: variable.default }
      }
      return variable
    })
  }
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
