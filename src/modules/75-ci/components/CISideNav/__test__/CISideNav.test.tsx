import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { CurrentLocation, TestWrapper } from '@common/utils/testUtils'
import CISideNav from '../CISideNav'

jest.mock('@projects-orgs/components/ProjectSelector/ProjectSelector', () => ({
  ProjectSelector: function ProjectSelectorComp(props: any) {
    return (
      <button
        onClick={() => props.onSelect({ identifier: 'project', orgIdentifier: 'org' })}
        id="projectSelectorId"
      ></button>
    )
  }
}))

function ComponentWrapper(): React.ReactElement {
  return (
    <React.Fragment>
      <CISideNav />
      <CurrentLocation />
    </React.Fragment>
  )
}

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
    const { container, getByTestId } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ComponentWrapper />
      </TestWrapper>
    )

    const projectButtonSel = '#projectSelectorId'
    const projectButton = await waitFor(() => container.querySelector(projectButtonSel))
    fireEvent.click(projectButton!)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/dummy/ci/dashboard/orgs/org/projects/project
      </div>
    `)
  })

  test('update route on project selection - if project is NOT selected', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        path="/account/:accountId/ci/dashboard/orgs/:orgIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy' }}
      >
        <ComponentWrapper />
      </TestWrapper>
    )

    const projectButtonSel = '#projectSelectorId'
    const projectButton = await waitFor(() => container.querySelector(projectButtonSel))
    fireEvent.click(projectButton!)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/dummy/ci/orgs/org/projects/project/dashboard
      </div>
    `)
  })
})
