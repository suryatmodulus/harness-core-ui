import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HomeSideNav from '../HomeSideNav'

describe('HomeSidenav', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/home/get-started" pathParams={{ accountId: 'dummy' }}>
        <HomeSideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
