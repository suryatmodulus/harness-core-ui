import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { TemplateStepWidgetWithRef } from '../TemplateStepWidget'

const getDefaultStepValues = () => {
  return {
    identifier: 'id',
    name: 'name',
    type: StepType.TemplateStep,
    'step-template': 'steptemplate',
    inputs: { test: 'test' }
  }
}

describe('<TemplateStep /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <TemplateStepWidgetWithRef initialValues={getDefaultStepValues()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
