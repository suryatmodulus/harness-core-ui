import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { K8sRollingRollback } from '../K8sRollingRollback.stories'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sRollingRollback Step', () => {
  test('should render edit view', () => {
    const { container } = render(
      <K8sRollingRollback
        type={StepType.K8sRollingRollback}
        initialValues={{ identifier: 'Test_A', type: StepType.K8sRollingRollback }}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render inputSet view', () => {
    const { container } = render(
      <K8sRollingRollback
        type={StepType.K8sRollingRollback}
        initialValues={{ identifier: 'Test_A', type: StepType.K8sRollingRollback }}
        stepViewType={StepViewType.InputSet}
        path=""
        template={{
          identifier: 'Test_A',
          type: StepType.K8sRollingRollback,
          spec: { timeout: RUNTIME_INPUT_VALUE }
        }}
        allValues={{
          type: StepType.K8sRollingRollback,
          name: 'Test A',
          identifier: 'Test_A',
          spec: { timeout: RUNTIME_INPUT_VALUE }
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render inputSet view and test validation', async () => {
    const { container, getByText } = render(
      <K8sRollingRollback
        type={StepType.K8sRollingRollback}
        initialValues={{ identifier: 'Test_A', type: StepType.K8sRollingRollback }}
        stepViewType={StepViewType.InputSet}
        path=""
        template={{
          identifier: 'Test_A',
          type: StepType.K8sRollingRollback,
          spec: { timeout: RUNTIME_INPUT_VALUE }
        }}
        allValues={{
          type: StepType.K8sRollingRollback,
          name: 'Test A',
          identifier: 'Test_A',
          spec: { timeout: RUNTIME_INPUT_VALUE }
        }}
      />
    )
    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <K8sRollingRollback
        initialValues={{
          identifier: 'Test_A',
          type: StepType.K8sRollingRollback,
          spec: {
            timeout: '10m',
            skipDryRun: false
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rollingRollback.name',
                localName: 'step.rollingRollback.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rollingRollback.timeout',
                localName: 'step.rollingRollback.timeout'
              }
            },
            'step-skip': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rollingRollback.skipDryRun',
                localName: 'step.rollingRollback.skipDryRun'
              }
            }
          },
          variablesData: {
            name: 'Test_A',
            identifier: 'rollingDeploy',
            type: 'K8sRollingRollback',
            spec: {
              timeout: 'step-timeout',
              skipDryRun: 'step-skip'
            }
          }
        }}
        type={StepType.K8sRollingRollback}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
