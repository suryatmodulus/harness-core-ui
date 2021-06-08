import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DefaultRenderer from '@projects-orgs/components/ModuleRenderer/DefaultRenderer'

describe('Default Renderer test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <DefaultRenderer />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
