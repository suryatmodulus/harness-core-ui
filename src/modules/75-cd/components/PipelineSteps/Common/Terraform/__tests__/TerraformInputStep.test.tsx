import React from 'react'
import { render } from '@testing-library/react'

import { Formik, FormikForm, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import TerraformInputStep from '../TerraformInputStep'
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const initialValues = {
  timeout: '10m',
  spec: {
    provisionerIdentifier: 'test',
    configuration: {
      type: 'Inline',
      spec: {
        workspace: 'test',
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: 'Branch',
              branch: 'test',
              folderPath: 'folder',
              connectorRef: 'test'
            }
          }
        }
      }
    },

    targets: ['target-1', 'target-2']
  }
}

const template: any = {
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    provisionerIdentifier: RUNTIME_INPUT_VALUE,
    configuration: {
      type: 'Inline',
      spec: {
        workspace: RUNTIME_INPUT_VALUE,
        configFiles: {
          store: {
            type: 'Git',
            spec: {
              gitFetchType: RUNTIME_INPUT_VALUE,
              branch: RUNTIME_INPUT_VALUE,
              folderPath: RUNTIME_INPUT_VALUE,
              connectorRef: 'test'
            }
          }
        }
      }
    },

    targets: RUNTIME_INPUT_VALUE
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
              stepType={StepType.TerraformDestroy}
              stepViewType={StepViewType.InputSet}
              inputSetData={{
                template
              }}
              path="test"
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
