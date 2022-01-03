import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import * as auditServices from 'services/audit'
import AuditTrailsFilters from '../AuditTrailsFilters'
import { filters } from './mockData'

jest.spyOn(auditServices, 'useGetFilterList').mockImplementation(() => ({ data: filters, loading: false } as any))

describe('Audit trail filters', () => {
  test('render', () => {
    const renderObj = render(
      <TestWrapper path={routes.toAuditTrail({ ...accountPathProps })} pathParams={{ accountId: 'testAcc' }}>
        <AuditTrailsFilters />
      </TestWrapper>
    )
    expect(renderObj.container).toMatchSnapshot()
  })
})
