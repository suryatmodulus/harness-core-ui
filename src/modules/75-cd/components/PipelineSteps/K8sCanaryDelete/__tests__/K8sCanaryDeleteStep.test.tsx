import React from 'react'
import { render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8sCanaryDeleteStep } from '../K8sCanaryDeleteStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sCanaryDeleteStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8sCanaryDeleteStep())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sCanaryDelete} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sCanaryDelete',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE
        }}
        type={StepType.K8sCanaryDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view for inputset', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ type: 'K8sCanaryDelete', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        template={{ type: 'K8sCanaryDelete', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        allValues={{
          type: 'K8sCanaryDelete',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE
        }}
        type={StepType.K8sCanaryDelete}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sCanaryDelete',
          name: 'Test_A',
          timeout: '10m'
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sCanaryDelete.name',
                localName: 'step.k8sCanaryDelete.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sCanaryDelete.timeout',
                localName: 'step.k8sCanaryDelete.timeout'
              }
            }
          },
          variablesData: {
            name: 'step-name',
            identifier: 'k8sCanaryDelete',
            type: 'K8sCanaryDelete',
            timeout: 'step-timeout'
          }
        }}
        type={StepType.K8sCanaryDelete}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
