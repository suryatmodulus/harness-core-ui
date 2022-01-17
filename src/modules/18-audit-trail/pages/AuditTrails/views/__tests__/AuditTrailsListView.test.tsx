import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import AuditTrailsListView from '../AuditTrailsListView'
import { data } from './mockData'

describe('Audit trail list view', () => {
  test('render', () => {
    const renderObj = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsListView data={data.data as any} setPage={jest.fn} />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })
})
