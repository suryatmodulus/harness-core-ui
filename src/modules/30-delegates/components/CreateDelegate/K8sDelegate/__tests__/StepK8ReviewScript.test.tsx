import React from 'react'
import { fireEvent, render, wait } from '@testing-library/react'
import type { UseMutateReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as portalService from 'services/portal'
import Stepk8ReviewScript from '../StepReviewScript/Stepk8sReviewScript'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => {
  const ComponentToMock = () => <div>yamlDiv</div>
  return ComponentToMock
})
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
        <Stepk8ReviewScript />
      </TestWrapper>
    )
    const stepReviewScriptContinueButton = container?.querySelector('#stepReviewScriptContinueButton')
    fireEvent.click(stepReviewScriptContinueButton!)
    await wait()
    expect(container).toMatchSnapshot()
  })
  test('Click back button', async () => {
    const { container } = render(
      <TestWrapper>
        <Stepk8ReviewScript />
      </TestWrapper>
    )
    const stepReviewScriptBackButton = container?.querySelector('#stepReviewScriptBackButton')
    fireEvent.click(stepReviewScriptBackButton!)
    await wait()
    expect(container).toMatchSnapshot()
  })
})
