import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ModuleName } from 'framework/types/ModuleName'

import { TrialLicenseBanner } from '../TrialLicenseBanner'

const props = {
  module: 'ci' as ModuleName,
  licenseType: 'TRIAL',
  expiryTime: moment.now() + 24 * 60 * 60 * 1000
}
describe('TrialLicenseBanner', () => {
  test('should render banner if api call returns TRIAL', () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <TrialLicenseBanner {...props} />
      </TestWrapper>
    )
    expect(getByText('common.banners.trial.description')).toBeDefined()
    expect(queryByText('common.banners.trial.expired.extendTrial')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('should NOT render banner if api call returns NOT TRIAL', () => {
    const localProps = {
      ...props,
      licenseType: 'PAID'
    }
    const { container, queryByText } = render(
      <TestWrapper>
        <TrialLicenseBanner {...localProps} />
      </TestWrapper>
    )
    expect(queryByText('common.banners.trial.contactSales')).toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('should render expired banner if it is expired', () => {
    const newProps = {
      module: 'ci' as ModuleName,
      licenseType: 'TRIAL',
      expiryTime: moment.now() - 24 * 60 * 60 * 1000
    }

    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <TrialLicenseBanner {...newProps} />
      </TestWrapper>
    )
    expect(queryByText('common.banners.trial.description')).toBeNull()
    expect(getByText('common.banners.trial.expired.extendTrial')).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
