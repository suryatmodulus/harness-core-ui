import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import OnPremFeatureWarningInfoBanner from '@common/components/FeatureWarning/OnPremFeatureWarningInfoBanner'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'

describe('OnPremFeatureWarningInfoBanner', () => {
  test('OnPremFeatureWarningInfoBanner', () => {
    const { container } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <OnPremFeatureWarningInfoBanner />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
