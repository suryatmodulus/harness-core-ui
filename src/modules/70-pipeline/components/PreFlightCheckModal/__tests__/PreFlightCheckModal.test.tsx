import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { fireEvent, render } from '@testing-library/react'
import * as pipelineService from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import preflightSuccessMock from './mock/preflightSuccessMock.json'
import preflightFailureMock from './mock/preflightFailureMock.json'
import preflightProgressMock from './mock/preflightProgressMock.json'
import { PreFlightCheckModal } from '../PreFlightCheckModal'

const startPreflightCheckPromiseSpy = jest.spyOn(pipelineService, 'startPreflightCheckPromise')
startPreflightCheckPromiseSpy.mockReturnValue(Promise.resolve({}))

describe('PreflightCheck', () => {
  test('renders property when return all success checks', async () => {
    const mockRefetch = jest.fn()
    const useGetPreflightCheckResponseSpy = jest.spyOn(pipelineService, 'useGetPreflightCheckResponse')
    useGetPreflightCheckResponseSpy.mockReturnValue({
      data: preflightSuccessMock,
      refetch: mockRefetch as any
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <PreFlightCheckModal
          accountId="accId"
          module="ci"
          projectIdentifier="projId"
          orgIdentifier="orgId"
          pipelineIdentifier="pipId"
          onCloseButtonClick={jest.fn()}
          onContinuePipelineClick={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders property when has failed checks', async () => {
    const mockRefetch = jest.fn()
    const useGetPreflightCheckResponseSpy = jest.spyOn(pipelineService, 'useGetPreflightCheckResponse')
    useGetPreflightCheckResponseSpy.mockReturnValue({
      data: preflightFailureMock,
      refetch: mockRefetch as any
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <PreFlightCheckModal
          accountId="accId"
          module="ci"
          projectIdentifier="projId"
          orgIdentifier="orgId"
          pipelineIdentifier="pipId"
          onCloseButtonClick={jest.fn()}
          onContinuePipelineClick={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('renders property when has in progress checks', async () => {
    const mockRefetch = jest.fn()
    const useGetPreflightCheckResponseSpy = jest.spyOn(pipelineService, 'useGetPreflightCheckResponse')
    useGetPreflightCheckResponseSpy.mockReturnValue({
      data: preflightProgressMock,
      refetch: mockRefetch as any
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <PreFlightCheckModal
          accountId="accId"
          module="ci"
          projectIdentifier="projId"
          orgIdentifier="orgId"
          pipelineIdentifier="pipId"
          onCloseButtonClick={jest.fn()}
          onContinuePipelineClick={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('click on section title open correct section', async () => {
    const mockRefetch = jest.fn()
    const useGetPreflightCheckResponseSpy = jest.spyOn(pipelineService, 'useGetPreflightCheckResponse')
    useGetPreflightCheckResponseSpy.mockReturnValue({
      data: preflightProgressMock,
      refetch: mockRefetch as any
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <PreFlightCheckModal
          accountId="accId"
          module="ci"
          projectIdentifier="projId"
          orgIdentifier="orgId"
          pipelineIdentifier="pipId"
          onCloseButtonClick={jest.fn()}
          onContinuePipelineClick={jest.fn()}
        />
      </TestWrapper>
    )

    const connectorsSectionTitle = getByText('pre-flight-check.verifyingPipelineInputs')
    fireEvent.click(connectorsSectionTitle)
    expect(container).toMatchSnapshot()

    const inputsSectionTitle = getByText('pre-flight-check.verifyingConnectors')
    fireEvent.click(inputsSectionTitle)
    expect(container).toMatchSnapshot()
  })
})
