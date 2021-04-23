import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps, orgPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'

import ResourcesPage from '../ResourcesPage'

describe('Resources Page', () => {
  test('render account scope', () => {
    const { container } = render(
      <TestWrapper path={routes.toResources(accountPathProps)} pathParams={{ accountId: 'dummy' }}>
        <ResourcesPage>hello</ResourcesPage>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render org scope', () => {
    const { container } = render(
      <TestWrapper path={routes.toResources(orgPathProps)} pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy' }}>
        <ResourcesPage>hello</ResourcesPage>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render project scope', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toResources(projectPathProps)}
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ResourcesPage>hello</ResourcesPage>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
