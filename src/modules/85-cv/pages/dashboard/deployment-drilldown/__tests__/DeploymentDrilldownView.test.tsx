import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetDeploymentTimeSeries, useGetVerificationInstances } from 'services/cv'
import DeploymentDrilldownView from '../DeploymentDrilldownView'

const mockParams = {
  accountId: 'kmpySmUISimoRrJL6NL73w',
  projectIdentifier: 'project1',
  orgIdentifier: 'org1',
  deploymentTag: 'testDeploy',
  serviceIdentifier: 'service1'
}

const verificationInstancesMock = {
  data: {
    resource: {
      deploymentTag: 'testTag',
      deploymentResultSummary: {
        productionDeploymentVerificationJobInstanceSummaries: [
          {
            progressPercentage: 43,
            startTime: 1604955241804,
            durationMs: 60000,
            riskScore: 0.3,
            environmentName: 'env',
            jobName: 'jobName',
            verificationJobInstanceId: '123',
            activityId: 'activityId123',
            status: 'VERIFICATION_PASSED',
            additionalInfo: null
          }
        ]
      }
    }
  }
}

const timeseriesMock = {
  data: {
    resource: null
  },
  refetch: jest.fn()
}

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useRouteParams: () => ({
    params: mockParams
  })
}))

jest.mock('services/cv', () => ({
  ...(jest.requireActual('services/cv') as any),
  useGetVerificationInstances: jest.fn().mockImplementation(() => verificationInstancesMock),
  useGetDeploymentTimeSeries: jest.fn().mockImplementation(() => timeseriesMock)
}))

describe('DeploymentDrilldownView', () => {
  test('renders correctly and gets data', () => {
    const { container } = render(
      <TestWrapper
        path="/cv/dashboard/deployment/:deploymentTag/service/:serviceIdentifier/org/:orgIdentifier/project/:projectIdentifier"
        pathParams={mockParams}
      >
        <DeploymentDrilldownView />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(useGetVerificationInstances).toHaveBeenCalled()
    expect(useGetDeploymentTimeSeries).toHaveBeenCalled()
  })
})
