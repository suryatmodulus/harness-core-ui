import produce from 'immer'
import { cloneDeep, defaultTo, isNil, set } from 'lodash-es'
import { parse } from 'yaml'
import type {
  ExecutionGraphAddStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes, TemplateDrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { StepElementConfig } from 'services/cd-ng'
import {
  addStepOrGroup,
  generateRandomString
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import type { TemplateStepNode } from 'services/pipeline-ng'
import { getScopeBasedTemplateRef } from '@pipeline/utils/templateUtils'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

interface AddStepTemplateReturnType {
  addTemplate: (event: ExecutionGraphAddStepEvent) => void
}

interface AddStepTemplate {
  executionRef: ExecutionGraphRefObj | null
}

export function useAddStepTemplate(props: AddStepTemplate): AddStepTemplateReturnType {
  const { executionRef } = props
  const pipelineContext = usePipelineContext()
  const {
    state: {
      pipelineView,
      selectionState: { selectedStageId },
      templateTypes
    },
    updateStage,
    getStageFromPipeline,
    updatePipelineView,
    updateTemplateView,
    setTemplateTypes
  } = pipelineContext

  const addTemplate = (event: ExecutionGraphAddStepEvent) => {
    updateTemplateView({
      isTemplateDrawerOpened: true,
      templateDrawerData: {
        type: TemplateDrawerTypes.UseTemplate,
        data: {
          selectorData: {
            templateType: 'Step',
            onUseTemplate: async (template: TemplateSummaryResponse, isCopied = false) => {
              const processNode = (isCopied
                ? produce(defaultTo(parse(template?.yaml || '').template.spec, {}) as StepElementConfig, draft => {
                    draft.name = defaultTo(template?.name, '')
                    draft.identifier = generateRandomString(defaultTo(template?.name, ''))
                  })
                : produce({} as TemplateStepNode, draft => {
                    draft.name = defaultTo(template?.name, '')
                    draft.identifier = generateRandomString(defaultTo(template?.name, ''))
                    set(draft, 'template.templateRef', getScopeBasedTemplateRef(template))
                    if (template.versionLabel) {
                      set(draft, 'template.versionLabel', template.versionLabel)
                    }
                  })) as unknown as StepElementConfig
              const newStepData = { step: processNode }
              const { stage: pipelineStage } = cloneDeep(getStageFromPipeline(selectedStageId || ''))
              if (pipelineStage && !pipelineStage.stage?.spec) {
                set(pipelineStage, 'stage.spec', {})
              }
              if (pipelineStage && isNil(pipelineStage.stage?.spec?.execution)) {
                if (event.isRollback) {
                  set(pipelineStage, 'stage.spec.execution', { rollbackSteps: [] })
                } else {
                  set(pipelineStage, 'stage.spec.execution', { steps: [] })
                }
              }
              executionRef?.stepGroupUpdated?.(newStepData.step)
              addStepOrGroup(
                event.entity,
                pipelineStage?.stage?.spec?.execution as any,
                newStepData,
                event.isParallel,
                event.isRollback
              )
              if (pipelineStage?.stage) {
                await updateStage(pipelineStage?.stage)
              }
              if (!isCopied && template?.identifier && template?.childType) {
                templateTypes[template.identifier] = template.childType
                setTemplateTypes(templateTypes)
              }
              updateTemplateView({
                isTemplateDrawerOpened: false,
                templateDrawerData: {
                  type: TemplateDrawerTypes.UseTemplate
                }
              })
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: true,
                drawerData: {
                  type: DrawerTypes.StepConfig,
                  data: {
                    stepConfig: {
                      node: newStepData.step,
                      stepsMap: event.stepsMap,
                      onUpdate: executionRef?.stepGroupUpdated,
                      isStepGroup: false,
                      addOrEdit: 'edit',
                      hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                    }
                  }
                }
              })
            }
          }
        }
      }
    })
  }

  return { addTemplate }
}
