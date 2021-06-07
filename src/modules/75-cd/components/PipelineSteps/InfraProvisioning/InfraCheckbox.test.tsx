import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { InfraProvisioning } from './InfraProvisioning'

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothi
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

describe('InfraProvisioning', () => {
  beforeAll(() => {
    factory.registerStep(new InfraProvisioning())
  })

  test(' click on checkbox- should open up prov popup', async () => {
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

    await act(async () => {
      const provCheckbox = container.querySelector('input[name="provisionerEnabled"]')

      fireEvent.click(provCheckbox!)
      expect(container).toMatchSnapshot()
    })
  })
})
