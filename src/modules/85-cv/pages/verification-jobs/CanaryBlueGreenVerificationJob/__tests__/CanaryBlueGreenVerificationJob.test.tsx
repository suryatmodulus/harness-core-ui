import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { noop } from 'lodash-es'

import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'

import mockEnvironments from '@cv/pages/onboarding/activity-source-setup/harness-cd/SelectEnvironment/__tests__/mockEnvironments.json'
import mockServices from '@cv/pages/onboarding/activity-source-setup/harness-cd/SelectServices/__tests__/mockServices.json'
import CanaryBlueGreenVerificationJob from '../CanaryBlueGreenVerificationJob'
jest.mock('services/cd-ng', () => ({
  useGetEnvironmentListForProject: () => mockEnvironments,
  useGetServiceListForProject: () => mockServices
}))

describe('CanaryBlueGreenVerificationJob', () => {
  test('Render initially for canary', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <CanaryBlueGreenVerificationJob onNext={() => noop} stepData={{ type: 'CANARY' }} onPrevious={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.configure.heading')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
  test('Render initially for bluegreen', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toCVAdminSetupVerificationJob({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <CanaryBlueGreenVerificationJob onNext={() => noop} stepData={{ type: 'BLUE_GREEN' }} onPrevious={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => expect(queryByText(container, 'cv.verificationJobs.configure.heading')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
})
