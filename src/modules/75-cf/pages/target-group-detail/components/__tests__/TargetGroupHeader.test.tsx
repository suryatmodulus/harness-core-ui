import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as useDeleteTargetGroupDialog from '../../hooks/useDeleteTargetGroupDialog'
import TargetGroupHeader, { TargetGroupHeaderProps } from '../TargetGroupHeader'

const renderComponent = (props: Partial<TargetGroupHeaderProps> = {}): RenderResult =>
  render(
    <TestWrapper defaultPermissionValues={{ checkPermission: () => true }}>
      <TargetGroupHeader
        targetGroup={{ identifier: 'TARGET_GROUP_ID', name: 'TARGET GROUP' }}
        env={{ name: 'ENVIRONMENT NAME' }}
        {...props}
      />
    </TestWrapper>
  )

describe('TargetGroupHeader', () => {
  const useDeleteTargetGroupDialogMock = jest.spyOn(useDeleteTargetGroupDialog, 'default')

  beforeEach(() => {
    jest.resetAllMocks()
    useDeleteTargetGroupDialogMock.mockReturnValue(jest.fn())
  })

  test('it should display the env name', async () => {
    const envName = 'TEST ENV NAME'
    renderComponent({ env: { name: envName } })

    expect(screen.getByText(envName)).toBeInTheDocument()
  })

  test('it should display a menu with the option to delete the target group', async () => {
    const deleteTargetGroupDialogMock = jest.fn()
    useDeleteTargetGroupDialogMock.mockReturnValue(deleteTargetGroupDialogMock)

    renderComponent()

    const menuButton = (document.querySelector('[data-icon="Options"]') as HTMLElement).closest(
      'button'
    ) as HTMLButtonElement

    expect(deleteTargetGroupDialogMock).not.toHaveBeenCalled()
    expect(menuButton).toBeInTheDocument()
    expect(screen.queryByText('delete')).not.toBeInTheDocument()

    userEvent.click(menuButton)

    await waitFor(() => {
      expect(screen.getByText('delete')).toBeInTheDocument()
    })

    userEvent.click(screen.getByText('delete'))

    await waitFor(() => {
      expect(deleteTargetGroupDialogMock).toHaveBeenCalled()
    })
  })
})
