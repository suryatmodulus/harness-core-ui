import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import FeatureWarningUpgradeBanner from '@common/components/FeatureWarning/FeatureWarningUpgradeBanner'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useFeatureModule, useFeatureRequiredPlans } from '@common/hooks/useFeatures'

jest.mock('@common/hooks/useFeatures')
const useFeatureModuleMock = useFeatureModule as jest.MockedFunction<any>
useFeatureModuleMock.mockImplementation(() => {
  return 'CI'
})

const useFeatureRequiredPlansMock = useFeatureRequiredPlans as jest.MockedFunction<any>
useFeatureRequiredPlansMock.mockImplementation(() => {
  return []
})

describe('FeatureWarningUpgradeBanner', () => {
  test('FeatureWarningUpgradeBanner', () => {
    const { container } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <FeatureWarningUpgradeBanner featureName={FeatureIdentifier.MULTIPLE_ORGANIZATIONS} message="" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
