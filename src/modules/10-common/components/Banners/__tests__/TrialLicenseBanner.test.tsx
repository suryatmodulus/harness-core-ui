import React from 'react'
import moment from 'moment'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ModuleName } from 'framework/types/ModuleName'

import { TrialLicenseBanner } from '../TrialLicenseBanner'

const props = {
  module: 'ci' as ModuleName,
  licenseType: 'TRIAL',
  expiryTime: moment().add(15, 'days').unix()
}

const defaultAppStoreValues = {
  currentUserInfo: {
    emailVerified: true,
    email: 'hello@world.com'
  }
}

jest.mock('services/portal', () => ({
  useResendEmail: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn(),
      loading: false
    }
  })
}))

describe('TrialLicenseBanner', () => {
  describe('Rendering', () => {
    test('should render banner if api call returns TRIAL', () => {
      const { container, getByText } = render(
        <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
          <TrialLicenseBanner {...props} />
        </TestWrapper>
      )
      expect(getByText('common.banners.trial.contactSales')).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    test('should NOT render banner if api call returns NOT TRIAL', () => {
      const localProps = {
        ...props,
        licenseType: 'PAID'
      }
      const { queryByText } = render(
        <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
          <TrialLicenseBanner {...localProps} />
        </TestWrapper>
      )
      expect(queryByText('common.banners.trial.contactSales')).toBeNull()
    })
  })

  describe('Event', () => {
    test('should open contact sales modal on clicking Contact Sales when user email is verified', async () => {
      const { getByText, queryByText } = render(
        <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
          <TrialLicenseBanner {...props} />
        </TestWrapper>
      )
      fireEvent.click(getByText('common.banners.trial.contactSales'))
      await waitFor(() => expect(getByText('common.banners.trial.contactSalesForm.description')).toBeDefined())
      expect(queryByText('common.banners.trial.verifyEmail.title')).toBeNull()
    })

    test('should open verify email modal on clicking Contact Sales when user email is NOT verified', async () => {
      const currentUserInfo = {
        emailVerified: false,
        email: 'hellow@world.com'
      }

      const { getByText, queryByText } = render(
        <TestWrapper defaultAppStoreValues={{ currentUserInfo }}>
          <TrialLicenseBanner {...props} />
        </TestWrapper>
      )
      fireEvent.click(getByText('common.banners.trial.contactSales'))
      await waitFor(() => expect(getByText('common.banners.trial.verifyEmail.title')).toBeDefined())
      expect(queryByText('common.banners.trial.contactSalesForm.description')).toBeNull()
    })
  })
})
