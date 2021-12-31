import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AuditTrailsPage from '../AuditTrailsPage'

describe('Access Control Page', () => {
  test('render', () => {
    const renderObj = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsPage />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })
})
