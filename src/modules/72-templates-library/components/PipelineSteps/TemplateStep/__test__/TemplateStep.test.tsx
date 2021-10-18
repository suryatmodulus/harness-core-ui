import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import type { TemplateStepData } from '@pipeline/utils/tempates'
import { TemplateStepWidgetWithRef } from '../TemplateStepWidget/TemplateStepWidget'

const getDefaultStepValues = (): TemplateStepData => {
  return {
    identifier: 'id',
    name: 'name',
    template: {
      templateRef: 'steptemplate',
      versionLabel: 'version1',
      templateInputs: { type: StepType.HTTP, spec: {} }
    }
  }
}

jest.mock('services/template-ng', () => ({
  useGetTemplateInputSetYaml: jest.fn().mockImplementation(() => ({
    loading: false,
    data: 'type: "Http"\nspec:\n  url: "<+input>"\n  requestBody: "<+input>"\n',
    refetch: jest.fn()
  }))
}))

describe('<TemplateStep /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateStepWidgetWithRef factory={factory} initialValues={getDefaultStepValues()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
