import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { waitFor } from '@testing-library/dom'
import { TestWrapper } from '@common/utils/testUtils'
import { useGitDiffEditorDialog } from '../useGitDiffEditorDialog'

jest.mock('services/cd-ng', () => ({
  useGetFileContent: jest.fn().mockImplementation(() => ({ refetch: jest.fn() }))
}))

describe('Test hook for correctness', () => {
  test('render useGitDiffEditorDialog hook', async () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(
      () =>
        useGitDiffEditorDialog({
          onClose: jest.fn(),
          onSuccess: jest.fn()
        }),
      { wrapper }
    )
    expect(Object.keys(result.current).indexOf('hideGitDiffDialog')).not.toBe(-1)
    expect(Object.keys(result.current).indexOf('openGitDiffDialog')).not.toBe(-1)
    await waitFor(() => {
      expect(result.current.openGitDiffDialog({})).toBe(undefined)
    })
  })
})
