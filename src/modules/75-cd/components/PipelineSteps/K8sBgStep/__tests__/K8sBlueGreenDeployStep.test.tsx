import React from 'react'
import { render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8sBlueGreenDeployStep } from '../K8sBlueGreenDeployStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sBlueGreenDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8sBlueGreenDeployStep())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sBlueGreenDeploy} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sBlueGreenDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        type={StepType.K8sBlueGreenDeploy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ identifier: 'Test_A', type: 'K8sBlueGreenDeploy', spec: { skipDryRun: false } }}
        template={{ identifier: 'Test_A', type: 'K8sBlueGreenDeploy', spec: { skipDryRun: RUNTIME_INPUT_VALUE } }}
        allValues={{
          type: 'K8sBlueGreenDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        type={StepType.K8sBlueGreenDeploy}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sBlueGreenDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sBlueGreenDeploy.name',
                localName: 'step.k8sBlueGreenDeploy.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sBlueGreenDeploy.timeout',
                localName: 'step.k8sBlueGreenDeploy.timeout'
              }
            },
            'step-skip': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.k8sBlueGreenDeploy.skipDryRun',
                localName: 'step.k8sBlueGreenDeploy.skipDryRun'
              }
            }
          },
          variablesData: {
            name: 'step-name',
            identifier: 'k8sBlueGreenDeploy',
            type: 'K8sBlueGreenDeploy',
            spec: {
              timeout: 'step-timeout',
              skipDryRun: 'step-skip'
            }
          }
        }}
        type={StepType.K8sBlueGreenDeploy}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
