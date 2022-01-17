/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { InfraProvisioning } from './InfraProvisioning'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('InfraProvisioning', () => {
  beforeAll(() => {
    factory.registerStep(new InfraProvisioning())
  })

  describe('Edit View', () => {
    test('should render properly - not enabled case', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={{
            provisioner: {},
            provisionerEnabled: false,
            provisionerSnippetLoading: false
          }}
          type={StepType.InfraProvisioning}
          stepViewType={StepViewType.Edit}
        />
      )
      expect(container).toMatchSnapshot()
    })

    test('should render properly - loading case', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={{
            provisioner: {},
            provisionerEnabled: true,
            provisionerSnippetLoading: true
          }}
          type={StepType.InfraProvisioning}
          stepViewType={StepViewType.Edit}
        />
      )
      expect(container).toMatchSnapshot()
    })

    // eslint-disable-next-line jest/no-disabled-tests
    xtest('should render properly - enabled case', () => {
      const { container } = render(
        <TestStepWidget
          initialValues={{
            provisioner: { steps: [], rollbackSteps: [] },
            provisionerEnabled: true,
            provisionerSnippetLoading: false
          }}
          type={StepType.InfraProvisioning}
          stepViewType={StepViewType.Edit}
        />
      )
      expect(container).toMatchSnapshot()
    })
  })
})
