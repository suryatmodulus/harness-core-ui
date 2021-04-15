import React from 'react'
import { fireEvent, render } from '@testing-library/react'
jest.mock('copy-to-clipboard')
import c2cMock from 'copy-to-clipboard'
import * as toaster from '@common/components/Toaster/useToaster'
import BuildCommits from '../BuildCommits'
import BuildMock from './mock/build.json'

jest.mock('@ci/services/CIUtils', () => ({
  getTimeAgo: () => '1 day ago',
  getShortCommitId: () => 'abc'
}))

jest.mock('@pipeline/pages/execution/ExecutionContext/ExecutionContext', () => ({
  useExecutionContext: () => ({
    pipelineExecutionDetail: {
      pipelineExecutionSummary: BuildMock
    }
  })
}))

describe('BuildCommits snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(<BuildCommits />)
    expect(container).toMatchSnapshot()
  })
})

describe('BuildCommits interaction test', () => {
  test('should copy commit id', async () => {
    ;(c2cMock as jest.Mock).mockImplementationOnce(() => true)
    ;(c2cMock as jest.Mock).mockImplementationOnce(() => false)

    const showSuccess = jest.fn()
    const showError = jest.fn()
    const useToasterSpy = jest.spyOn(toaster, 'useToaster')
    useToasterSpy.mockImplementation(
      () =>
        ({
          showSuccess,
          showError
        } as any)
    )

    render(<BuildCommits />)

    const btn1 = document.querySelectorAll('button.hash')[0]
    fireEvent.click(btn1)

    expect(showSuccess).toBeCalledWith('Successfully copied to clipboard')

    const btn3 = document.querySelectorAll('button.hash')[2]
    fireEvent.click(btn3)

    expect(showError).toBeCalledWith('Copy to clipboard has failed')
  })
})
