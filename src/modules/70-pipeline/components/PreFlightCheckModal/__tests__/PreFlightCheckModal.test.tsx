import React from 'react'
import type { UseGetReturn } from 'restful-react'
import { fireEvent, render, act, waitFor } from '@testing-library/react'
import * as pipelineService from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import preflightSuccessMock from './mock/preflightSuccessMock.json'
import preflightFailureMock from './mock/preflightFailureMock.json'
import preflightProgressMock from './mock/preflightProgressMock.json'
import { PreFlightCheckModal } from '../PreFlightCheckModal'

const timeoutSpy = jest.spyOn(window, 'setTimeout')
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

    const closeButtonClickMock = jest.fn()
    const continueButtonClickMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <PreFlightCheckModal
          accountId="accId"
          module="ci"
          projectIdentifier="projId"
          orgIdentifier="orgId"
          pipelineIdentifier="pipId"
          onCloseButtonClick={closeButtonClickMock}
          onContinuePipelineClick={continueButtonClickMock}
        />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('close'))
    })
    await waitFor(() => expect(closeButtonClickMock).toBeCalled())

    act(() => {
      fireEvent.click(getByText('pre-flight-check.continueToRunPipeline'))
    })
    await waitFor(() => expect(continueButtonClickMock).toBeCalled())

    expect(container).toMatchSnapshot()
  })

  test('see if RETRY works', () => {
    const mockRefetch = jest.fn()
    const useGetPreflightCheckResponseSpy = jest.spyOn(pipelineService, 'useGetPreflightCheckResponse')
    const mockedSpyResponse = {
      data: preflightSuccessMock,
      refetch: mockRefetch as any
    } as UseGetReturn<any, any, any, any>
    useGetPreflightCheckResponseSpy.mockReturnValue(mockedSpyResponse)

    startPreflightCheckPromiseSpy.mockResolvedValue({
      status: 'SUCCESS',
      data: 'idafterretry'
    })

    const closeButtonClickMock = jest.fn()
    const continueButtonClickMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <PreFlightCheckModal
          accountId="accId"
          module="ci"
          projectIdentifier="projId"
          orgIdentifier="orgId"
          pipelineIdentifier="pipId"
          onCloseButtonClick={closeButtonClickMock}
          onContinuePipelineClick={continueButtonClickMock}
        />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('retry'))
    })

    expect(container).toMatchSnapshot('loading state after retry click')
    expect(timeoutSpy).toBeCalled()
  })

  test('renders property when has failed checks', async () => {
    const mockRefetch = jest.fn()
    const useGetPreflightCheckResponseSpy = jest.spyOn(pipelineService, 'useGetPreflightCheckResponse')
    useGetPreflightCheckResponseSpy.mockReturnValue({
      data: preflightFailureMock,
      refetch: mockRefetch as any
    } as UseGetReturn<any, any, any, any>)

    const { container, getAllByText } = render(
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

    expect(container).toMatchSnapshot('before opening the error description panel')

    // Click on accordion heading
    act(() => {
      fireEvent.click(getAllByText('org.orgConnectorId')[0])
    })

    expect(container).toMatchSnapshot('after opening the error panel')
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
    act(() => {
      fireEvent.click(connectorsSectionTitle)
    })
    expect(container).toMatchSnapshot('opened pipeline inputs section')

    const inputsSectionTitle = getByText('pre-flight-check.verifyingConnectors')
    act(() => {
      fireEvent.click(inputsSectionTitle)
    })
    expect(container).toMatchSnapshot('opened connectors section')
  })
})
