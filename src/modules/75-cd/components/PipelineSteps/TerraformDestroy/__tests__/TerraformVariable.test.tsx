import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TerraformDestroy } from '../TerraformDestroy'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

jest.mock('react-monaco-editor', () => ({ value, onChange, name }: any) => {
  return <textarea value={value} onChange={e => onChange(e.target.value)} name={name || 'spec.source.spec.script'} />
})
describe('Test TerraformDestroy', () => {
  beforeEach(() => {
    factory.registerStep(new TerraformDestroy())
  })
  test('with inline var file and expand the varfiles sections', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                workspace: 'testworkspace',
                varFiles: [
                  {
                    varFile: {
                      type: 'Inline',
                      store: {
                        type: 'Git',
                        spec: {
                          content: 'Test Content'
                        }
                      }
                    }
                  },
                  {
                    varFile: {
                      type: 'Remote',
                      store: {
                        type: 'Git',
                        spec: {
                          gitFetchType: 'Branch',
                          branch: 'main',
                          paths: ['varFiles/may-vars/var1.tfvars', 'varFiles/may-vars/var2.tfvars'],
                          connectorRef: 'myTfConnector1'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText('pipelineSteps.addTerraformVarFile'))

    expect(container).toMatchSnapshot()
  })
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should successfully remove varfiles', async () => {
    const { container, getByText, findByTestId } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              type: 'Inline',
              spec: {
                workspace: 'testworkspace',
                varFiles: [
                  {
                    varFile: {
                      type: 'Inline',
                      store: {
                        type: 'Git',
                        spec: {
                          content: 'Test Content'
                        }
                      }
                    }
                  },
                  {
                    varFile: {
                      type: 'Remote',
                      store: {
                        type: 'Git',
                        spec: {
                          gitFetchType: 'Branch',
                          branch: 'main',
                          paths: ['varFiles/may-vars/var1.tfvars', 'varFiles/may-vars/var2.tfvars'],
                          connectorRef: 'myTfConnector1'
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformDestroy}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText('pipelineSteps.terraformVarFiles'))

    await act(async () => {
      const trashIcon = await findByTestId('remove-tfvar-file-0')
      fireEvent.click(trashIcon!)
    })
    expect(container).toMatchSnapshot()
  })
})
