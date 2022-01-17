/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as LicenseStoreContext from 'framework/LicenseStore/LicenseStoreContext'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import AccountSideNav from '../AccountSideNav/AccountSideNav'

describe('AccountSideNav', () => {
  test('AccountSideNav simple snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <AccountSideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Disable launch button for community edition', () => {
    jest.spyOn(LicenseStoreContext, 'useLicenseStore').mockReturnValue({
      licenseInformation: {
        CD: {
          edition: 'COMMUNITY'
        }
      },
      CD_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE,
      CI_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE,
      FF_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE,
      CCM_LICENSE_STATE: LICENSE_STATE_VALUES.ACTIVE,
      updateLicenseStore: () => {
        //empty method
      },
      versionMap: {}
    })
    const { container } = render(
      <TestWrapper>
        <AccountSideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('AccountSideNav test governance', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      OPA_PIPELINE_GOVERNANCE: true
    })
    const renderObj = render(
      <TestWrapper>
        <AccountSideNav />
      </TestWrapper>
    )
    expect(renderObj.getByText('common.governance')).toBeTruthy()
  })

  test('AccountSideNav test no licenses enabled', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      NG_LICENSES_ENABLED: true
    })
    const renderObj = render(
      <TestWrapper>
        <AccountSideNav />
      </TestWrapper>
    )
    expect(renderObj.getByText('common.subscriptions.title')).toBeTruthy()
  })

  test('AccountSideNav test audit trail', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      AUDIT_TRAIL_WEB_INTERFACE: true
    })
    const renderObj = render(
      <TestWrapper>
        <AccountSideNav />
      </TestWrapper>
    )
    expect(renderObj.getByText('common.auditTrail')).toBeTruthy()
  })
})
