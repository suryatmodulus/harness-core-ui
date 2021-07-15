import React from 'react'
import { waitFor, fireEvent } from '@testing-library/dom'
import type { UseGetReturn } from 'restful-react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { ExecutionVerificationSummary } from '../ExecutionVerificationSummary'
import { SampleResponse } from './ExecutionVerificationSummary.mock'

describe('Unit tests for VerifyExection', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      } as any
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('Ensure content is rendered correctly based on api response', async () => {
    jest.spyOn(cvService, 'useGetDeploymentActivitySummary').mockReturnValue({
      data: SampleResponse
    } as UseGetReturn<any, any, any, any>)
    const { container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('pipeline.verification.metricsInViolation')).not.toBeNull())

    const nodeHealths = container.querySelectorAll('[class~="nodeHealth"]')
    expect(nodeHealths.length).toBe(
      SampleResponse.resource.deploymentVerificationJobInstanceSummary.additionalInfo.primary.length +
        SampleResponse.resource.deploymentVerificationJobInstanceSummary.additionalInfo.canary.length
    )
    let redCount = 0,
      greenCount = 0,
      greyCount = 0

    nodeHealths.forEach(item => {
      const colorVal = item.getAttribute('data-node-health-color')
      if (colorVal?.includes('var(--red-500)')) {
        redCount++
      } else if (colorVal?.includes('var(--green-500)')) {
        greenCount++
      } else if (colorVal?.includes('var(--grey-300)')) {
        greyCount++
      }
    })

    expect(greyCount).toBe(4)
    expect(redCount).toBe(1)
    expect(greenCount).toBe(2)
  })

  test('Ensure that loading indicator is displayed when api is loading', async () => {
    jest.spyOn(cvService, 'useGetDeploymentActivitySummary').mockReturnValue({
      loading: true
    } as UseGetReturn<any, any, any, any>)
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="loading"]')).not.toBeNull())
  })

  test('Ensure that error is displayed when api errors out', async () => {
    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetDeploymentActivitySummary').mockReturnValue({
      error: { data: { message: 'mockError' } },
      refetch: refetchFn as unknown
    } as UseGetReturn<any, any, any, any>)
    const { container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{ progressData: { activityId: 'asadasd_' as any } }} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('mockError')).not.toBeNull())
    fireEvent.click(container.querySelector('button')!)
    await waitFor(() => expect(refetchFn).toHaveBeenCalledTimes(1))
  })

  test('Ensure that when activity id is not there empty statee is rendered', async () => {
    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetDeploymentActivitySummary').mockReturnValue({
      error: { data: { message: 'mockError' } },
      refetch: refetchFn as unknown
    } as UseGetReturn<any, any, any, any>)
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('button')).toBeNull())
    expect(container.querySelector('[data-icon="error"]')).toBeNull()
  })
})
