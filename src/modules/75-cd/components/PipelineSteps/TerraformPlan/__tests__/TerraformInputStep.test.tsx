import React from 'react'
import { render } from '@testing-library/react'

import { Formik, FormikForm, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import TerraformInputStep from '../TerraformInputStep'
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const initialValues = {
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
}

const template: any = {
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
}

describe('Test terraform input set', () => {
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={() => undefined}>
          <FormikForm>
            <TerraformInputStep
              initialValues={initialValues as any}
              stepType={StepType.TerraformPlan}
              stepViewType={StepViewType.InputSet}
              inputSetData={{
                template
              }}
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
