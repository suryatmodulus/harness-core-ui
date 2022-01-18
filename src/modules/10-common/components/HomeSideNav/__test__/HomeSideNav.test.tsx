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
import HomeSideNav from '../HomeSideNav'

describe('HomeSidenav', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/home/get-started" pathParams={{ accountId: 'dummy' }}>
        <HomeSideNav />
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
        <HomeSideNav />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
