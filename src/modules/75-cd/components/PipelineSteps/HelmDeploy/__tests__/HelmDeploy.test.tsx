import React from 'react'
import { render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { HelmDeploy } from '../HelmDeploy'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sBlueGreenDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new HelmDeploy())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.HelmDeploy} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view ', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'HelmDeploy',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.HelmDeploy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view for inputset', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ type: 'HelmDeploy', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        template={{ type: 'HelmDeploy', name: 'Test A', timeout: RUNTIME_INPUT_VALUE }}
        allValues={{
          type: 'HelmDeploy',
          name: 'Test A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            skipDryRun: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.HelmDeploy}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render Variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ type: 'HelmDeploy', name: 'Test A', timeout: '10m' }}
        template={{ type: 'HelmDeploy', name: 'Test A', timeout: '10m' }}
        allValues={{
          type: 'HelmDeploy',
          name: 'Test A',
          timeout: '10m',
          spec: {
            skipDryRun: true
          }
        }}
        type={StepType.HelmDeploy}
        stepViewType={StepViewType.InputVariable}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            name: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.HelmDeploy.name',
                localName: 'step.HelmDeploy.name'
              }
            }
          },
          variablesData: {
            name: 'Test A',
            identifier: 'HelmDeploy',
            type: 'HelmDeploy',
            timeout: '10m'
          }
        }}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
