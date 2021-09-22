import type { AllNGVariables } from '@pipeline/utils/types'
import { mergeTemplateWithInputSetData } from '../RunPipelineHelper'
import pipelineTemplate from './mockJson/pipelineTemplate.json'
import pipelineInputSetPortion from './mockJson/pipelineInputSetPortion.json'
describe('RunPipelineHelper', () => {
  test('mergeTemplateWithInputSetData works as expected', () => {
    const templatePipeline = {
      pipeline: {
        identifier: 'P1',
        stages: [
          {
            stage: {
              identifier: 'Stage1',
              type: 'CI',
              spec: {
                execution: {
                  steps: [
                    {
                      step: {
                        identifier: 'Step1',
                        type: 'Run',
                        description: '<+input>'
                      }
                    }
                  ]
                }
              }
            }
          }
        ],
        properties: {
          ci: {
            codebase: {
              build: '<+input>'
            }
          }
        }
      }
    }
    const inputSetPortion = {
      pipeline: {
        identifier: 'P1',
        stages: [
          {
            stage: {
              identifier: 'Stage1',
              type: 'CI',
              spec: {
                execution: {
                  steps: [
                    {
                      step: {
                        identifier: 'Step1',
                        type: 'Run',
                        description: 'test Desc'
                      }
                    }
                  ]
                }
              }
            }
          }
        ],
        properties: {
          ci: {
            codebase: {
              build: {
                type: 'branch',
                spec: {
                  branch: 'master'
                }
              }
            }
          }
        }
      }
    }
    const output = mergeTemplateWithInputSetData(templatePipeline as any, inputSetPortion as any)
    expect(output.pipeline.properties?.ci?.codebase?.build.type).toEqual('branch')
    expect(output.pipeline.stages?.length).toEqual(1)
  })
  test('mergeTemplateWithInputSetData works as expected', () => {
    const output = mergeTemplateWithInputSetData(pipelineTemplate as any, pipelineInputSetPortion as any)
    expect((output.pipeline.variables?.[0] as AllNGVariables)?.value).toEqual('D2')
    expect((output.pipeline.variables?.[1] as AllNGVariables)?.value).toEqual('http')
    expect((output.pipeline.stages?.[0].stage?.variables?.[0] as AllNGVariables)?.value).toEqual('<+input>')
    expect((output.pipeline.stages?.[0].stage?.variables?.[1] as AllNGVariables)?.value).toEqual('v2_test')
    expect(output.pipeline.stages?.length).toEqual(1)
  })
})
