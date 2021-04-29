import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TerraformPlan } from '../TerraformPlan'

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

describe('Test TerraformPlan', () => {
  beforeEach(() => {
    factory.registerStep(new TerraformPlan())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.TerraformPlan} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              command: 'Apply'
            }
          }
        }}
        type={StepType.TerraformPlan}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.TerraformPlan} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view with command Destroy', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              command: 'Destroy'
            }
          }
        }}
        type={StepType.TerraformPlan}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              command: 'Apply',
              spec: {
                targets: RUNTIME_INPUT_VALUE,
                environmentVariables: RUNTIME_INPUT_VALUE,
                configFiles: {
                  store: {
                    spec: {
                      connectorRef: RUNTIME_INPUT_VALUE
                    }
                  }
                }
              }
            }
          }
        }}
        template={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              command: 'Apply',
              spec: {
                targets: RUNTIME_INPUT_VALUE,
                environmentVariables: RUNTIME_INPUT_VALUE,
                configFiles: {
                  store: {
                    spec: {
                      connectorRef: RUNTIME_INPUT_VALUE
                    }
                  }
                }
              }
            }
          }
        }}
        allValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              command: 'Apply',
              spec: {
                targets: RUNTIME_INPUT_VALUE,
                environmentVariables: RUNTIME_INPUT_VALUE,
                configFiles: {
                  store: {
                    spec: {
                      connectorRef: RUNTIME_INPUT_VALUE
                    }
                  }
                }
              }
            }
          }
        }}
        type={StepType.TerraformPlan}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {
                    connectorRef: 'test'
                  }
                }
              },
              backendConfig: {
                spec: {
                  content: 'test-content'
                }
              },
              targets: ['test-1'],
              environmentVariables: [{ key: 'test', value: 'abc' }],
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    spec: {
                      content: 'test'
                    }
                  }
                }
              ]
            }
          }
        }}
        template={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            backendConfig: {
              spec: {
                content: 'test-content'
              }
            },

            targets: ['test-1'],
            environmentVariables: [{ key: 'test', value: 'abc' }],
            configuration: {
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {
                    connectorRef: 'test'
                  }
                }
              },
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    spec: {
                      content: 'test'
                    }
                  }
                }
              ]
            }
          }
        }}
        allValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              command: 'Apply',
              backendConfig: {
                spec: {
                  content: 'test-content'
                }
              },

              targets: ['test-1'],
              environmentVariables: [{ key: 'test', value: 'abc' }],
              configFiles: {
                store: {
                  spec: {
                    connectorRef: 'test'
                  }
                }
              },
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    spec: {
                      content: 'test'
                    }
                  }
                }
              ]
            }
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformPlan.name',
                localName: 'step.TerraformPlan.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformPlan.timeout',
                localName: 'step.TerraformPlan.timeout'
              }
            },
            'step-delegateSelectors': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformPlan.delegateSelectors',
                localName: 'step.TerraformPlan.delegateSelectors'
              }
            },
            'step-provisionerIdentifier': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.TerraformPlan.provisionerIdentifier',
                localName: 'step.TerraformPlan.provisionerIdentifier'
              }
            }
          },
          variablesData: {
            type: 'TerraformPlan',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',

            delegateSSelectors: ['test-1', 'test-2'],
            spec: {
              provisionerIdentifier: 'step-provisionerIdentifier',
              configuration: {
                command: 'Apply',
                configFiles: {
                  store: {
                    spec: {
                      connectorRef: 'test'
                    }
                  }
                },

                targets: ['test-1'],
                environmentVariables: [{ key: 'test', value: 'abc' }],
                varFiles: [
                  {
                    varFile: {
                      type: 'Inline',
                      spec: {
                        content: 'test'
                      }
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformPlan}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('renders more than one var file', () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              command: 'Apply',
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    content: 'test'
                  }
                },
                {
                  varFile: {
                    type: 'Remote',
                    connectorRef: 'test',
                    branch: 'testBranch',
                    gitFetchType: 'Branch'
                  }
                }
              ]
            }
          }
        }}
        type={StepType.TerraformPlan}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText('pipelineSteps.terraformVarFiles'))

    expect(container).toMatchSnapshot()
  })

  test('click on add tf var file -should open the dialog', () => {
    const { container, getByText } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              command: 'Apply',
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    content: 'test'
                  }
                },
                {
                  varFile: {
                    type: 'Remote',
                    connectorRef: 'test',
                    branch: 'testBranch',
                    gitFetchType: 'Branch'
                  }
                }
              ]
            }
          }
        }}
        type={StepType.TerraformPlan}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText('pipelineSteps.terraformVarFiles'))
    fireEvent.click(getByText('pipelineSteps.addTerraformVarFile'))
    expect(container).toMatchSnapshot()
  })

  test('should render input set view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: RUNTIME_INPUT_VALUE,
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              command: 'Apply',
              workspace: RUNTIME_INPUT_VALUE,
              configFiles: {
                store: {
                  spec: {
                    branch: RUNTIME_INPUT_VALUE,
                    folderPath: RUNTIME_INPUT_VALUE,
                    connectorRef: {
                      label: 'test',
                      Scope: 'Account',
                      value: 'test',
                      connector: {
                        type: 'GIT',
                        spec: {
                          val: 'test'
                        }
                      }
                    }
                  }
                }
              }
            },
            targets: RUNTIME_INPUT_VALUE,
            environmentVariables: RUNTIME_INPUT_VALUE
          }
        }}
        template={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              workspace: RUNTIME_INPUT_VALUE,
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {
                    branch: RUNTIME_INPUT_VALUE,
                    folderPath: RUNTIME_INPUT_VALUE,
                    connectorRef: RUNTIME_INPUT_VALUE
                  }
                }
              }
            },
            targets: RUNTIME_INPUT_VALUE,
            environmentVariables: RUNTIME_INPUT_VALUE
          }
        }}
        allValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: RUNTIME_INPUT_VALUE,
            configuration: {
              command: 'Apply',
              workspace: RUNTIME_INPUT_VALUE,
              configFiles: {
                store: {
                  spec: {
                    branch: RUNTIME_INPUT_VALUE,
                    folderPath: RUNTIME_INPUT_VALUE,
                    connectorRef: RUNTIME_INPUT_VALUE
                  }
                }
              }
            },
            targets: RUNTIME_INPUT_VALUE,
            environmentVariables: RUNTIME_INPUT_VALUE
          }
        }}
        type={StepType.TerraformPlan}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'TerraformPlan',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {
                    gitFetchType: 'Branch',
                    branch: 'test-branch',
                    connectorRef: 'test'
                  }
                }
              },
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    content: 'test'
                  }
                },
                {
                  varFile: {
                    type: 'Remote',
                    connectorRef: 'test',
                    branch: 'testBranch',
                    gitFetchType: 'Branch'
                  }
                }
              ]
            }
          }
        }}
        template={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',
          delegateSelectors: ['test-1', 'test-2'],
          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {
                    gitFetchType: 'Branch',
                    branch: 'test-branch',
                    connectorRef: 'test'
                  }
                }
              },

              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    content: 'test'
                  }
                },
                {
                  varFile: {
                    type: 'Remote',
                    connectorRef: 'test',
                    branch: 'testBranch',
                    gitFetchType: 'Branch'
                  }
                }
              ]
            }
          }
        }}
        allValues={{
          type: 'TerraformDestroy',
          name: 'Test A',
          identifier: 'Test_A',
          timeout: '10m',

          spec: {
            provisionerIdentifier: 'test',
            configuration: {
              command: 'Apply',
              configFiles: {
                store: {
                  spec: {
                    gitFetchType: 'Branch',
                    branch: 'test-branch',
                    connectorRef: 'test'
                  }
                }
              },
              varFiles: [
                {
                  varFile: {
                    type: 'Inline',
                    content: 'test'
                  }
                },
                {
                  varFile: {
                    type: 'Remote',
                    connectorRef: 'test',
                    branch: 'testBranch',
                    gitFetchType: 'Branch'
                  }
                }
              ]
            }
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.name',
                localName: 'step.terraformDestroy.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.timeout',
                localName: 'step.terraformDestroy.timeout'
              }
            },
            'step-delegateSelectors': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.delegateSelectors',
                localName: 'step.terraformDestroy.delegateSelectors'
              }
            },
            'step-provisionerIdentifier': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.terraformDestroy.provisionerIdentifier',
                localName: 'step.terraformDestroy.provisionerIdentifier'
              }
            }
          },
          variablesData: {
            type: 'TerraformDestroy',
            name: 'step-name',
            identifier: 'Test_A',
            timeout: 'step-timeout',

            spec: {
              provisionerIdentifier: 'test',
              configuration: {
                command: 'Apply',
                configFiles: {
                  store: {
                    spec: {
                      gitFetchType: 'Branch',
                      branch: 'test-branch',
                      connectorRef: 'test'
                    }
                  }
                },
                varFiles: [
                  {
                    varFile: {
                      type: 'Inline',
                      content: 'test'
                    }
                  },
                  {
                    varFile: {
                      type: 'Remote',
                      connectorRef: 'test',
                      branch: 'testBranch',
                      gitFetchType: 'Branch'
                    }
                  }
                ]
              }
            }
          }
        }}
        type={StepType.TerraformApply}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
