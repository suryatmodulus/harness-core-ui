import React from 'react'
import { render } from '@testing-library/react'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { FlagConfigurationStep } from '../FlagConfigurationStep'

jest.mock('services/cf', () => ({
  useGetAllFeatures: jest.fn().mockReturnValue({ data: [], loading: false }),
  useGetTargetsAndSegmentsInfo: jest.fn().mockReturnValue({ data: [], loading: false })
}))

jest.mock('@cf/hooks/useEnvironmentSelectV2', () => ({
  useEnvironmentSelectV2: jest.fn().mockReturnValue({ data: [], loading: false })
}))

describe('FlagConfigurationStep', () => {
  beforeEach(() => factory.registerStep(new FlagConfigurationStep()))

  test('it should render', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'test123',
          name: 'Test 123',
          type: 'type',
          spec: { featureFlag: 'testFlag', environment: 'dev', state: 'on' }
        }}
        type={StepType.FlagConfiguration}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
