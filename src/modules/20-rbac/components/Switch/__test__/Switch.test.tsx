import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Switch from '@rbac/components/Switch/Switch'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'

const checkFeatureReturnMock = {
  enabled: true
}
jest.mock('@common/hooks/useFeatures', () => {
  return {
    useFeature: () => {
      return checkFeatureReturnMock
    }
  }
})

const featureProps = {
  featureRequest: {
    featureName: FeatureIdentifier.TEST1
  }
}

describe('Switch', () => {
  test('should render Switch ', async () => {
    const { container } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <Switch featureProps={featureProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
