import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Stepk8ReviewScript from '../StepReviewScript/Stepk8sReviewScript'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
const nextStep = jest.fn()
const previousStep = jest.fn()
const generateYamlMock = jest.fn()

jest.mock('services/portal', () => ({
  useGenerateKubernetesYaml: jest.fn().mockImplementation(() => {
    generateYamlMock()
    return {
      mutate: jest.fn().mockImplementation(() => {
        return new Promise(() => new Promise(() => null))
      })
    }
  })
}))

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
  test('Click download button', async () => {
    const { container } = render(
      <TestWrapper>
        <Stepk8ReviewScript previousStep={previousStep} />
      </TestWrapper>
    )
    const stepReviewScriptDownloadYAMLButton = container?.querySelector('#stepReviewScriptDownloadYAMLButton')
    act(() => {
      fireEvent.click(stepReviewScriptDownloadYAMLButton!)
    })

    await waitFor(() => {
      expect(generateYamlMock).toBeCalled()
    })
  })
})
