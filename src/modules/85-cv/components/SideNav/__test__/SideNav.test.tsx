import React from 'react'
import { Container } from '@wings-software/uicore'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SideNav from '../SideNav'

jest.mock('@common/navigation/ProjectSelector/ProjectSelector', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(jest.requireActual('@common/navigation/ProjectSelector/ProjectSelector') as object),
  ProjectSelector: function P(props: any) {
    return (
      <Container>
        <button
          onClick={() => props.onSelect({ projectIdentifier: '1234_project', orgIdentifer: '1234_org' })}
          id="bt"
        ></button>
      </Container>
    )
  }
}))

const mockHistoryPush = jest.fn()

jest.mock('react-router-dom', () => ({
  // eslint-disable-next-line @typescript-eslint/ban-types
  ...(jest.requireActual('react-router-dom') as object),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))

describe('Sidenav', () => {
  test('render', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cv/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SideNav />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="Layout"]')).not.toBeNull())
    expect(container).toMatchSnapshot()
    const button = container.querySelector('#bt')
    if (!button) {
      throw Error('Button was not rendered.')
    }
  })

  test('render2', async () => {
    const { container } = render(
      <TestWrapper>
        <SideNav />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="Layout"]')).not.toBeNull())
    const button = container.querySelector('#bt')
    if (!button) {
      throw Error('Button was not rendered.')
    }

    fireEvent.click(button)
    await waitFor(() => expect(mockHistoryPush).toHaveBeenCalledTimes(1))
  })
})
