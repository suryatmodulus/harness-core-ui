/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllNGVariables } from '@pipeline/utils/types'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { getFeaturePropsForRunPipelineButton, mergeTemplateWithInputSetData } from '../runPipelineUtils'
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

describe('getFeaturePropsForRunPipelineButton tests', () => {
  test('if no modules supplied, returns undefined', () => {
    const result = getFeaturePropsForRunPipelineButton()
    expect(result).toBeUndefined()
  })

  test('if empty modules supplied, returns undefined', () => {
    const result = getFeaturePropsForRunPipelineButton([])
    expect(result).toBeUndefined()
  })

  test('if only cd module supplied', () => {
    const result = getFeaturePropsForRunPipelineButton(['cd'])
    expect(result).toStrictEqual({
      featuresRequest: {
        featureNames: [FeatureIdentifier.DEPLOYMENTS_PER_MONTH]
      }
    })
  })

  test('if only ci module supplied', () => {
    const result = getFeaturePropsForRunPipelineButton(['ci'])
    expect(result).toStrictEqual({
      featuresRequest: {
        featureNames: [FeatureIdentifier.BUILDS]
      }
    })
  })

  test('if cd and ci modules supplied', () => {
    const result = getFeaturePropsForRunPipelineButton(['cd', 'ci'])
    expect(result).toStrictEqual({
      featuresRequest: {
        featureNames: [FeatureIdentifier.DEPLOYMENTS_PER_MONTH, FeatureIdentifier.BUILDS]
      }
    })
  })

  test('if a random module supplied', () => {
    const result = getFeaturePropsForRunPipelineButton(['random'])
    expect(result).toStrictEqual({
      featuresRequest: {
        featureNames: []
      }
    })
  })
})
