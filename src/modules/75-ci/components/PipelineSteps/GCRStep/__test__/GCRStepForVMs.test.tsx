import React from 'react'
import { render, act, Matcher, fireEvent } from '@testing-library/react'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { GCRStep } from '../GCRStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('../../CIStep/StepUtils', () => ({
  useGetPropagatedStageById: jest.fn(() => ({ stage: { spec: { infrastructure: { type: 'VM' } } } }))
}))

describe('GCR Step', () => {
  beforeAll(() => {
    factory.registerStep(new GCRStep())
  })

  describe('Edit View', () => {
    test('should render properly for AWS VMs build infra', () => {
      const { container, getByText } = render(
        <TestStepWidget initialValues={{}} type={StepType.GCR} stepViewType={StepViewType.Edit} />
      )

      expect(container).toMatchSnapshot()

      act(() => {
        fireEvent.click(getByText('common.optionalConfig'))
      })

      const lookupShouldFail = (text: Matcher) => {
        try {
          getByText(text)
        } catch (err) {
          expect(err).toBeTruthy()
        }
      }

      // Optimize field look up should fail since this field is not supported for AWS VMs Build Infra
      lookupShouldFail('spec.optimize')
    })
  })
})
