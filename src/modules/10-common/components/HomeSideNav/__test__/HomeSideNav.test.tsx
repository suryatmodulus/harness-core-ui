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
