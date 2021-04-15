import React from 'react'
import { render } from '@testing-library/react'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { TestWrapper } from '@common/utils/testUtils'
import { BuildZeroState } from '../BuildZeroState'

describe('BuildZeroState snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper
        path="/account/zEaak-FLS425IEO7OLzMUg/ci/orgs/default/projects/citestproject/builds/2445/tests"
        pathParams={{
          accountId: 'zEaak-FLS425IEO7OLzMUg',
          orgIdentifier: 'default',
          projectIdentifier: 'citestproject',
          buildIdentifier: 2445
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <BuildZeroState />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
