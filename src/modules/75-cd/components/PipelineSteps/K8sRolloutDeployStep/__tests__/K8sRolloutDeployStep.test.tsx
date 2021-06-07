import React from 'react'
import { render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8RolloutDeployStep } from '../K8sRolloutDeployStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sRolloutDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8RolloutDeployStep())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sRollingDeploy} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sRollingDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        type={StepType.K8sRollingDeploy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sRollingDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: true, timeout: '10m' }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-skip': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rolloutDeployment.skipDryRun',
                localName: 'step.rolloutDeployment.skipDryRun'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rolloutDeployment.timeout',
                localName: 'step.rolloutDeployment.timeout'
              }
            },
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rolloutDeployment.name',
                localName: 'step.rolloutDeployment.name'
              }
            }
          },
          variablesData: {
            name: 'step-name',
            identifier: 'rolloutDeployment',
            type: 'K8sRollingDeploy',
            spec: {
              timeout: 'step-timeout',
              skipDryRun: 'step-skip'
            }
          }
        }}
        type={StepType.K8sRollingDeploy}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ identifier: 'Test_A', type: 'K8sRollingDeploy', spec: { skipDryRun: false } }}
        template={{ identifier: 'Test_A', type: 'K8sRollingDeploy', spec: { skipDryRun: RUNTIME_INPUT_VALUE } }}
        allValues={{
          type: 'K8sRollingDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        type={StepType.K8sRollingDeploy}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
