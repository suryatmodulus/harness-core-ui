import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { DelegateOverview } from '../DelegateOverview'

const delegateProfile = {
  uuid: 'dsadassd2e23d',
  accountId: 'dsdddss',
  name: '',
  description: '',
  primary: false,
  approvalRequired: false,
  startupScript: '',
  scopingRules: [],
  selectors: [],
  createdAt: 3232,

  lastUpdatedAt: 231243423
}

describe('Delegates Overview Page', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateOverview delegate={{}} delegateProfile={delegateProfile} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
