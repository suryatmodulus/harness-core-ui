import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'

import ProjectsSideNav from './ProjectsSideNav'

describe('Projects Side Nav', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toProjectDetails(projectPathProps)}
        pathParams={{ accountId: 'account', orgIdentifier: 'org', projectIdentifier: 'project' }}
      >
        <ProjectsSideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
