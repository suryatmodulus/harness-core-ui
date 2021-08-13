import React from 'react'
import { Classes } from '@blueprintjs/core'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SelectedAppsSideNav, SelectedAppsSideNavProps } from '../SelectedAppsSideNav'

function WrapperComponent(props: SelectedAppsSideNavProps): JSX.Element {
  return (
    <TestWrapper>
      <SelectedAppsSideNav {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for SelectedAppsSideNav', () => {
  test('Ensure loading state is rendered correectly', async () => {
    const { container } = render(<WrapperComponent loading={true} />)
    await waitFor(() => expect(container.querySelectorAll(`[class*="${Classes.SKELETON}"]`).length).toBe(5))
  })
  test('Ensure that when apps are provided, the list is rendered', async () => {
    const { container } = render(
      <WrapperComponent
        selectedApps={Array(50)
          .fill(null)
          .map((_, i) => i.toString())}
      />
    )
    await waitFor(() => expect(container.querySelectorAll(`[class*="selectedApp"]`).length).toBe(50))
    expect(container).toMatchSnapshot()
  })
})
