/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
    featureName: FeatureIdentifier.BUILDS
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
