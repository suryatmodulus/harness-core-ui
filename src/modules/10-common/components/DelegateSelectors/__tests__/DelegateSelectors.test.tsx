/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render
  // fireEvent
} from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { DelegateSelectors } from '../DelegateSelectors'

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))
const props = {
  urlParams: {
    accountId: 'accountId'
  }
}

const params = {
  accountId: 'testAcc'
}
const TEST_PATH = routes.toDelegates({
  ...accountPathProps
})
describe('Delegate Selectors test', () => {
  test('snapshot testing', () => {
    const { container } = render(
      <TestWrapper path={TEST_PATH} pathParams={params}>
        <DelegateSelectors
          {...props}
          fill
          items={[]}
          {...props}
          allowNewTag
          getTagProps={(value, _index, _selectedItems, createdItems) => {
            return createdItems.includes(value as string) ? { intent: 'danger', minimal: true } : { minimal: true }
          }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
