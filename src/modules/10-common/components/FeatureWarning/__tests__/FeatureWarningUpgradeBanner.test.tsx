/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
