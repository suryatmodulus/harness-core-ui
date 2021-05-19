import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import type { UseMutateReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as portalService from 'services/portal'
import Stepk8ReviewScript from '../StepReviewScript/Stepk8sReviewScript'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => {
  const ComponentToMock = () => <div>yamlDiv</div>
  return ComponentToMock
})
const nextStep = jest.fn()
const previousStep = jest.fn()
const mockMutateFn = jest.fn().mockReturnValue(Promise.resolve()) as unknown
const useDeleteKubernetesSourceSpy = jest.spyOn(portalService, 'useGenerateKubernetesYaml') as any
useDeleteKubernetesSourceSpy.mockReturnValue({ mutate: mockMutateFn } as UseMutateReturn<any, any, any, any, any>)
describe('Create Step Review Script Delegate', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <Stepk8ReviewScript />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Click continue button', async () => {
    const { container } = render(
      <TestWrapper>
        <Stepk8ReviewScript nextStep={nextStep} />
      </TestWrapper>
    )
    const stepReviewScriptContinueButton = container?.querySelector('#stepReviewScriptContinueButton')
    act(() => {
      fireEvent.click(stepReviewScriptContinueButton!)
    })
    await waitFor(() => {
      expect(nextStep).toBeCalled()
    })
  })
  test('Click back button', async () => {
    const { container } = render(
      <TestWrapper>
        <Stepk8ReviewScript previousStep={previousStep} />
      </TestWrapper>
    )
    const stepReviewScriptBackButton = container?.querySelector('#stepReviewScriptBackButton')
    act(() => {
      fireEvent.click(stepReviewScriptBackButton!)
    })
    await waitFor(() => {
      expect(previousStep).toBeCalled()
    })
  })
})
