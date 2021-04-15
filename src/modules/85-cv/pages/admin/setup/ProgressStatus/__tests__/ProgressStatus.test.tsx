import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ProgressStatus from '../ProgressStatus'

describe('ProgressStatus', () => {
  test('render initial state with services and env', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ProgressStatus
          numberOfServicesUsedInActivitySources={0}
          numberOfServicesUsedInMonitoringSources={0}
          totalNumberOfEnvironments={2}
          totalNumberOfServices={2}
          servicesUndergoingHealthVerification={0}
        />
      </TestWrapper>
    )

    expect(getByText('cv.onboarding.progress.serviceEnvCount')).toBeDefined()

    expect(container).toMatchSnapshot()
  })
  test('render with some services in activity and monitoring', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ProgressStatus
          numberOfServicesUsedInActivitySources={1}
          numberOfServicesUsedInMonitoringSources={2}
          totalNumberOfEnvironments={2}
          totalNumberOfServices={2}
          servicesUndergoingHealthVerification={0}
        />
      </TestWrapper>
    )

    expect(getByText('cv.onboarding.progress.multiServiceUsedInMonitoringSources')).toBeDefined()

    expect(container).toMatchSnapshot()
  })
})
