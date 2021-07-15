import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'

import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8sDeleteStep } from '../K8sDeleteStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sDeleteStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8sDeleteStep())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sDelete} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view -with ManifestPaths selected', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ManifestPath',

              spec: {
                manifestPaths: ['testA', 'testB']
              }
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view -with ReleaseName selected', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ReleaseName',

              spec: {
                deleteNamespace: true
              }
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
    const warningMessage = container.querySelector('#warning-deletenamespace')
    expect(warningMessage).toBeTruthy()
  })

  test('should render edit view -with ResourceName selected', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ResourceName',
              spec: {
                resourceNames: ['testABC', 'test123']
              }
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('validate input set in deployment form - only timeout is runtime', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '',
          spec: {}
        }}
        template={{
          timeout: '<+input>'
        }}
        inputSetData={{
          path: '/abc',
          template: {
            timeout: '<+input>',
            spec: {}
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.DeploymentForm}
      />
    )
    fireEvent.click(getByText('Submit'))
    await waitFor(() => getByText('Errors'))
    expect(container).toMatchSnapshot('K8 delete step error in deploymentform if timeout not present')
  })

  test('form produces correct data for fixed inputs', async () => {
    const onUpdate = jest.fn()
    // (JSX attribute) RefAttributes<Pick<FormikProps<unknown>, "errors" | "submitForm">>.ref?: ((instance: Pick<FormikProps<unknown>, "errors" | "submitForm"> | null) => void) | React.RefObject<Pick<FormikProps<unknown>, "errors" | "submitForm">> | null | undefined
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ReleaseName'
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )
    await act(() => ref.current?.submitForm())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Test_A',
      name: 'Test A',
      timeout: '12m',
      type: 'K8sDelete',
      spec: {
        deleteResources: {
          type: 'ReleaseName',
          spec: {
            deleteNamespace: false
          }
        }
      }
    })
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sDelete',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '12m',
          spec: {
            deleteResources: {
              type: 'ResourceName',
              spec: {
                resourceNames: ['testABC', 'test123']
              }
            }
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.K8sDelete.name',
                localName: 'step.K8sDelete.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.K8sDelete.timeout',
                localName: 'step.K8sDelete.timeout'
              }
            }
          },
          variablesData: {
            type: 'K8sDelete',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',
            spec: {
              deleteResources: {
                type: 'ResourceName',
                spec: {
                  resourceNames: ['testABC', 'test123']
                }
              }
            }
          }
        }}
        type={StepType.K8sDelete}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
