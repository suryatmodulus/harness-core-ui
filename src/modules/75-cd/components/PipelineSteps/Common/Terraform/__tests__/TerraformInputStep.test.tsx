/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { Formik, FormikForm, MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
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
        <Formik initialValues={{}} onSubmit={() => undefined} formName="wrapperComponentTestForm">
          <FormikForm>
            <TerraformInputStep
              initialValues={initialValues as any}
              stepType={StepType.TerraformDestroy}
              stepViewType={StepViewType.InputSet}
              inputSetData={{
                template
              }}
              path="test"
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]}
            />
          </FormikForm>
        </Formik>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
