import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { OnboardingPage } from '../OnboardingPage'

describe('OnboardingPage', () => {
  test('OnboardingPage should be rendered properly', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <OnboardingPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
