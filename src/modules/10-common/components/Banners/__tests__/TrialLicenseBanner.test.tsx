/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import moment from 'moment'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { ModuleName } from 'framework/types/ModuleName'

import { TrialLicenseBanner } from '../TrialLicenseBanner'

jest.mock('services/cd-ng', () => {
  return {
    useExtendTrialLicense: jest.fn,
    useSaveFeedback: jest.fn
  }
})

const props = {
  module: 'ci' as ModuleName,
  licenseType: 'TRIAL',
  expiryTime: moment.now() + 24 * 60 * 60 * 1000
}
describe('TrialLicenseBanner', () => {
  test('should render banner and provide feedback button if api call returns TRIAL and not expired', () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <TrialLicenseBanner {...props} />
      </TestWrapper>
    )
    expect(getByText('common.banners.trial.description')).toBeDefined()
    expect(queryByText('common.banners.trial.expired.extendTrial')).toBeNull()
    expect(getByText('common.banners.trial.provideFeedback'))
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

  test('should render expired banner and extend trial button if it is expired less than or equal to 14 days', () => {
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

  test('should render expired banner BUT NO extend trial button if it is expired more than 14 days', () => {
    const newProps = {
      module: 'ci' as ModuleName,
      licenseType: 'TRIAL',
      expiryTime: moment.now() - 24 * 60 * 60 * 1000 * 15
    }

    const { container, queryByText } = render(
      <TestWrapper>
        <TrialLicenseBanner {...newProps} />
      </TestWrapper>
    )
    expect(queryByText('common.banners.expired.description')).toBeNull()
    expect(queryByText('common.banners.trial.description')).toBeNull()
    expect(queryByText('common.banners.trial.expired.extendTrial')).toBeNull()
    expect(container).toMatchSnapshot()
  })
})
