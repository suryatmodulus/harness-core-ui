import type { PipelineInfoConfig } from 'services/cd-ng'
import type { InputSetErrorResponse } from 'services/pipeline-ng'
import { getStageFromPipeline } from '../PipelineStudio/PipelineContext/helpers'

interface NgPipelineTemplate {
  pipeline: PipelineInfoConfig
}

export const mergeTemplateWithInputSetData = (
  templatePipeline: NgPipelineTemplate,
  inputSetPortion: NgPipelineTemplate
): NgPipelineTemplate => {
  // Replace all the matching stages in parsedTemplate with the stages received in input set portion
  const mergedStages = templatePipeline.pipeline.stages?.map(stage => {
    if (stage.parallel) {
      /*
      This stage is parallel. Now loop over all the children stages, and check if any of them match in input set portion
      We update all the parallel stages with the ones matching in the input set portion
      and then finally return the new 'updatedParallelStages' object
      */
      const updatedParallelStages = stage.parallel.map(parallelStage => {
        // looping over each parallel stage
        const parallelStageId = parallelStage.stage?.identifier || ''
        // if the ID of any parallel stage matches in input set portion, replace the original stage with the matched
        const matchedStageInInputSet = getStageFromPipeline(parallelStageId, inputSetPortion.pipeline)
        if (matchedStageInInputSet.stage) {
          return matchedStageInInputSet.stage
        }
        // if doesn't match in input set portion, innocently return the same stage object
        return parallelStage
      })
      // Finally setting the updatedParallelStages in the original object, so that the 'mergedStages' will have the updated values
      stage.parallel = updatedParallelStages
      return stage
    }

    /*
    This block will be executed if there are no parallel stages.
    Simply loop over the stages and keep matching and replacing
    */
    const stageIdToBeMatched = stage.stage?.identifier || ''
    const matchedStageInInputSet = getStageFromPipeline(stageIdToBeMatched, inputSetPortion.pipeline)
    if (matchedStageInInputSet.stage) {
      return matchedStageInInputSet.stage
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

  Eventually in run pipeline form -
  If input sets are selected, we will supply the variables from 'toBeUpdated' pipleine
  This is why 'toBeUpdated' pipeline should have the variables
  */

  if (inputSetPortion.pipeline.variables) {
    // If we have variables saved in input set, pick them and update
    toBeUpdated.pipeline.variables = inputSetPortion.pipeline.variables
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
