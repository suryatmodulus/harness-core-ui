import React from 'react'
import { render } from '@testing-library/react'
import * as LicenseStoreContext from 'framework/LicenseStore/LicenseStoreContext'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'
import { LaunchButton } from '../LaunchButton'

describe('Launch Button test', () => {
  test('Launch button render ', async () => {
    const { container } = render(
      <LaunchButton launchButtonText="Launch Next Generation" redirectUrl="#/account/abc123/dashboard" />
    )
    expect(container).toMatchSnapshot()
  })

  test('Launch button render for community ', async () => {
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
      <LaunchButton launchButtonText="Launch Next Generation" redirectUrl="#/account/abc123/dashboard" />
    )
    expect(container).toMatchSnapshot()
  })
})
