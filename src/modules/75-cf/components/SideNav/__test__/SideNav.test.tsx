import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SideNav from '../SideNav'

describe('Sidenav', () => {
  beforeEach(() => localStorage.clear())

  test('it should render', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('it should display the pipelines link only when pipelines are enabled', async () => {
    const Subject: React.FC = () => (
      <TestWrapper
        path="/account/:accountId/cf/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SideNav />
      </TestWrapper>
    )

    const { rerender } = render(<Subject />)
    expect(screen.queryByText('pipelines')).not.toBeInTheDocument()

    localStorage.setItem('FF_PIPELINES', 'true')
    rerender(<Subject />)
    expect(screen.getByText('pipelines')).toBeInTheDocument()
  })
})
