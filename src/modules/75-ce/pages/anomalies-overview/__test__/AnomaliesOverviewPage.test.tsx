import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import AnomaliesOverviewPage from '../AnomaliesOverviewPage'

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test case for anomalies detection overview page', () => {
  test('should be able to render the overview dashboard', () => {
    const { container } = render(
      <TestWrapper pathParams={params}>
        <AnomaliesOverviewPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
