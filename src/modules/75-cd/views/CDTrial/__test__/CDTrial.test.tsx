import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'

import CDTrial from '../CDTrial'

describe('CDTrial Modal', () => {
  const props = {
    handleSubmit: jest.fn()
  }
  describe('Rendering', () => {
    test('should render CDTrial', () => {
      const { container } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <CDTrial {...props} />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
