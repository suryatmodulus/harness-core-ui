import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CISideNav from '../CISideNav'

const historyPushMock = jest.fn()
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useHistory: () => ({
    push: historyPushMock
  })
}))

jest.mock('@common/navigation/ProjectSelector/ProjectSelector', () => ({
  ProjectSelector: function ProjectSelectorComp(props: any) {
    return (
      <button
        onClick={() => props.onSelect({ identifier: 'project', orgIdentifier: 'org' })}
        id="projectSelectorId"
      ></button>
    )
  }
}))

describe('SideNav', () => {
  test('render properly', () => {
    const { container, rerender } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CISideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const container2 = rerender(
      <TestWrapper path="/" pathParams={{}}>
        <CISideNav />
      </TestWrapper>
    )
    expect(container2).toMatchSnapshot()
  })

  test('update route on project selection - if project is selected', async () => {
    const spyUseHistory = jest.spyOn({ historyPushMock }, 'historyPushMock')

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CISideNav />
      </TestWrapper>
    )

    const projectButtonSel = '#projectSelectorId'
    const projectButton = await waitFor(() => container.querySelector(projectButtonSel))
    fireEvent.click(projectButton!)

    expect(spyUseHistory).toBeCalledWith('/account/dummy/ci/dashboard/orgs/org/projects/project')

    spyUseHistory.mockClear()
  })

  test('update route on project selection - if project is NOT selected', async () => {
    const spyUseHistory = jest.spyOn({ historyPushMock }, 'historyPushMock')

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/orgs/:orgIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy' }}
      >
        <CISideNav />
      </TestWrapper>
    )

    const projectButtonSel = '#projectSelectorId'
    const projectButton = await waitFor(() => container.querySelector(projectButtonSel))
    fireEvent.click(projectButton!)

    expect(spyUseHistory).toBeCalledWith('/account/dummy/ci/orgs/org/projects/project/dashboard')

    spyUseHistory.mockClear()
  })
})
