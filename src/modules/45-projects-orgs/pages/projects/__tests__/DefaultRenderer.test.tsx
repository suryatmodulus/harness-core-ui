import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import DefaultRenderer from '@projects-orgs/components/ModuleRenderer/DefaultRenderer'

describe('Default Renderer test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <DefaultRenderer />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
