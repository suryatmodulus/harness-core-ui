import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { useStrings } from 'framework/exports'
import LogAnalysisView from '../LogAnalysisView'

const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => <TestWrapper>{children}</TestWrapper>
const { result } = renderHook(() => useStrings(), { wrapper })

describe('Unit tests for log analysis view', () => {
  test('Ensure no data state is rendered when no data is provided', async () => {
    const refetchMock = jest.fn()
    const useGetAllLogsSpy = jest.spyOn(cvService, 'useGetAllLogs')
    useGetAllLogsSpy.mockReturnValue({
      data: {
        resource: {
          content: []
        }
      },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <LogAnalysisView startTime={123243435} endTime={43535345345} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="noDataCard"]')).not.toBeNull)

    // click retry button
    fireEvent.click(getByText('Retry'))
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(2))
  })

  test('Ensure that when api errors out, error state is rendered', async () => {
    const refetchMock = jest.fn()
    const useGetAllLogsSpy = jest.spyOn(cvService, 'useGetAllLogs')
    useGetAllLogsSpy.mockReturnValue({
      error: { message: 'mockError' },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, any>)

    const { getByText } = render(
      <TestWrapper>
        <LogAnalysisView startTime={123243435} endTime={43535345345} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('mockError')).not.toBeNull)

    // click retry button
    fireEvent.click(getByText(result.current.getString('retry')))
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(2))
  })

  test('Ensure loading spinner is displayed in loading state', async () => {
    const refetchMock = jest.fn()
    const useGetAllLogsSpy = jest.spyOn(cvService, 'useGetAllLogs')
    useGetAllLogsSpy.mockReturnValue({
      loading: true,
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <LogAnalysisView startTime={123243435} endTime={43535345345} />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="spinner"]')).not.toBeNull)
  })
})
