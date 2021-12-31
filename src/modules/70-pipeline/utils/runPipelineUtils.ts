import type { SelectOption } from '@wings-software/uicore'
import { getStageFromPipeline } from '@pipeline/components/PipelineStudio/PipelineContext/helpers'
import type { AllNGVariables } from '@pipeline/utils/types'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { FeaturesProps } from 'framework/featureStore/featureStoreUtil'
import type { UseStringsReturn } from 'framework/strings'
import type { PipelineInfoConfig } from 'services/cd-ng'
import type { InputSetErrorResponse } from 'services/pipeline-ng'

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
      let updatedStageVars = []
      if (stage?.stage?.variables && matchedStageInInputSet?.stage?.stage?.variables) {
        updatedStageVars = getMergedVariables(
          stage?.stage?.variables as AllNGVariables[],
          matchedStageInInputSet.stage.stage?.variables as AllNGVariables[]
        )
        matchedStageInInputSet.stage.stage.variables = updatedStageVars
      }
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

    toBeUpdated.pipeline.variables = getMergedVariables(
      toBeUpdated.pipeline.variables as AllNGVariables[],
      inputSetPortion.pipeline.variables as AllNGVariables[]
    ) // inputSetPortion.pipeline.variables
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

export const getMergedVariables = (
  variables: AllNGVariables[],
  inputSetVariables: AllNGVariables[]
): AllNGVariables[] => {
  const finalVariables = variables?.map((variable: AllNGVariables) => {
    const variableInInputSetPortion = inputSetVariables?.find(currVar => currVar.name === variable.name)
    if (variableInInputSetPortion) {
      return {
        ...variable,
        value: variableInInputSetPortion?.value || ''
      }
    }
    return variable
  })
  return finalVariables as AllNGVariables[]
}

/*
  Get features restriction to pass to 'run' pipeline button based on the modules the pipeline supports
*/
export const getFeaturePropsForRunPipelineButton = (modules?: string[]): FeaturesProps | undefined => {
  if (!modules || !modules?.length) {
    return undefined
  }
  const featureIdentifiers: FeatureIdentifier[] = []
  if (modules.includes('cd')) {
    featureIdentifiers.push(FeatureIdentifier.DEPLOYMENTS_PER_MONTH)
  }
  if (modules.includes('ci')) {
    featureIdentifiers.push(FeatureIdentifier.BUILDS)
  }
  return {
    featuresRequest: {
      featureNames: featureIdentifiers
    }
  }
}

export interface SelectedStageData {
  stageIdentifier?: string
  stagesRequired?: string[]
  stageName?: string
  message?: string
}
export interface StageSelectionData {
  selectedStages: SelectedStageData[]
  allStagesSelected: boolean
  selectedStageItems: SelectOption[]
}

export const POLL_INTERVAL = 1 /* sec */ * 1000 /* ms */

export const ALL_STAGE_VALUE = 'all'

export const getAllStageData = (getString: UseStringsReturn['getString']): SelectedStageData => ({
  stageIdentifier: ALL_STAGE_VALUE,
  stagesRequired: [],
  stageName: getString('pipeline.allStages')
})

export const getAllStageItem = (getString: UseStringsReturn['getString']): SelectOption => ({
  label: getString('pipeline.allStages'),
  value: ALL_STAGE_VALUE
})
