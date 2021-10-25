import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CDSideNav from '../CDSideNav'

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

describe('Sidenav', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cd/deployments/orgs/:orgIdentifier/projects/:projectIdentifier"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CDSideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should go to pipeline studio with trial query param when select project from trial in progress page', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        path="/account/:accountId/cd/home"
        pathParams={{ accountId: 'dummy' }}
        queryParams={{ experience: 'TRIAL' }}
      >
        <CDSideNav />
      </TestWrapper>
    )

    const projectButtonSel = '#projectSelectorId'
    const projectButton = await waitFor(() => container.querySelector(projectButtonSel))
    fireEvent.click(projectButton!)

    expect(getByTestId('location')).toMatchInlineSnapshot(`
      <div
        data-testid="location"
      >
        /account/dummy/cd/orgs/org/projects/project/pipelines/-1/pipeline-studio/?modal=TRIAL
      </div>
    `)
  })
})
