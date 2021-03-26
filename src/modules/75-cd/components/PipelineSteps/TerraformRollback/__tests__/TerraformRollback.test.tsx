import React from 'react'
import { render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TerraformRollback } from '../TerraformRollback'

const mockGetCallFunction = jest.fn()
jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))
jest.mock('services/portal', () => ({
  useGetDelegateSelectors: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))

describe('Test TerraformRollback', () => {
  beforeEach(() => {
    factory.registerStep(new TerraformRollback())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.TerraformRollback} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformRollback',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            provisionerIdentifier: 'test',
            delegateSelectors: ['test-1', 'test-2']
          }
        }}
        type={StepType.TerraformRollback}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformRollback',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            delegateSelectors: ['test-1', 'test-2']
          }
        }}
        template={{
          type: 'TerraformRollback',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            delegateSelectors: ['test-1', 'test-2']
          }
        }}
        allValues={{
          type: 'TerraformRollback',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            delegateSelectors: ['test-1', 'test-2']
          }
        }}
        type={StepType.TerraformRollback}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformRollback',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            delegateSelectors: ['test-1', 'test-2']
          }
        }}
        template={{
          type: 'TerraformRollback',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            delegateSelectors: ['test-1', 'test-2']
          }
        }}
        allValues={{
          type: 'TerraformRollback',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            delegateSelectors: ['test-1', 'test-2']
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformrollback.name',
                localName: 'step.terraformrollback.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformrollback.timeout',
                localName: 'step.terraformrollback.timeout'
              }
            },
            'step-delegateSelectors': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformrollback.delegateSelectors',
                localName: 'step.terraformrollback.delegateSelectors'
              }
            },
            'step-provisionerIdentifier': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformrollback.provisionerIdentifier',
                localName: 'step.terraformrollback.provisionerIdentifier'
              }
            }
          },
          variablesData: {
            type: 'TerraformRollback',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',

            spec: {
              provisionerIdentifier: 'step-provisionerIdentifier',

              delegateSSelectors: ['test-1', 'test-2']
            }
          }
        }}
        type={StepType.TerraformRollback}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
