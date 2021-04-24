import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { Classes } from '@blueprintjs/core'
import { cloneDeep } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import RecentActivityChanges from '../RecentActivityChanges'

const MockData = [
  {
    activityType: 'DEPLOYMENT',
    activityName: 'Configuration Change',
    serviceIdentifier: 'Manager',
    preActivityRisks: [
      {
        category: 'infrastructureText',
        risk: 55
      },
      {
        category: 'errors',
        risk: 25
      },
      {
        category: 'performance',
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'IN_PROGRESS',
    overallRisk: 52,
    remainingTimeMs: 10,
    postActivityRisks: [
      {
        category: 'infrastructureText',
        risk: 55
      },
      {
        category: 'errors',
        risk: 25
      },
      {
        category: 'performance',
        risk: 15
      }
    ]
  },
  {
    activityType: 'KUBERNETES',
    activityName: 'Configuration Change',
    serviceIdentifier: 'Manager',
    preActivityRisks: [
      {
        category: 'infrastructureText',
        risk: 55
      },
      {
        category: 'errors',
        risk: 25
      },
      {
        category: 'performance',
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'IN_PROGRESS',
    overallRisk: 52,
    remainingTimeMs: 10,
    postActivityRisks: [
      {
        category: 'infrastructureText',
        risk: 55
      },
      {
        category: 'errors',
        risk: 25
      },
      {
        category: 'performance',
        risk: 15
      }
    ]
  },
  {
    activityType: 'INFRASTRUCTURE',
    activityName: 'Configuration Change',
    serviceIdentifier: 'Manager',
    preActivityRisks: [
      {
        category: 'infrastructureText',
        risk: 55
      },
      {
        category: 'errors',
        risk: 25
      },
      {
        category: 'performance',
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'FAILED',
    overallRisk: 52,
    remainingTimeMs: 10,
    postActivityRisks: [
      {
        category: 'infrastructureText',
        risk: 55
      },
      {
        category: 'errors',
        risk: 25
      },
      {
        category: 'performance',
        risk: 15
      }
    ]
  },
  {
    activityType: 'OTHER',
    activityName: 'Configuration Change',
    serviceIdentifier: 'Manager',
    preActivityRisks: [
      {
        category: 'infrastructureText',
        risk: 55
      },
      {
        category: 'errors',
        risk: 25
      },
      {
        category: 'performance',
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'IN_PROGRESS',
    overallRisk: 52,
    remainingTimeMs: 10,
    postActivityRisks: [
      {
        category: 'infrastructureText',
        risk: 55
      },
      {
        category: 'errors',
        risk: 25
      },
      {
        category: 'performance',
        risk: 15
      }
    ]
  }
]
const refetchFunc = jest.fn()
jest.mock('services/cv', () => ({
  ...(jest.requireActual('services/cv') as any),
  useGetRecentActivityVerificationResults: jest.fn().mockImplementation(({ queryParams }) => {
    const { accountId } = queryParams
    if (accountId === 'loading') {
      return { loading: true }
    } else if (accountId === 'error') {
      return { error: { message: 'mocked error' }, refetch: refetchFunc }
    } else if (accountId === 'no data') {
      return { data: { resources: [] } }
    } else if (accountId === 'Initiated') {
      const mockDataWithInitiatedState = cloneDeep(MockData)
      mockDataWithInitiatedState[0].progressPercentage = 0
      mockDataWithInitiatedState[0].status = 'NOT_STARTED'
      mockDataWithInitiatedState[0].overallRisk = undefined as any
      return {
        data: {
          resource: mockDataWithInitiatedState
        }
      }
    } else if (accountId === 'passed') {
      const mockDataWithInitiatedState = cloneDeep(MockData)
      mockDataWithInitiatedState[0].progressPercentage = 100
      mockDataWithInitiatedState[0].status = 'VERIFICATION_PASSED'
      mockDataWithInitiatedState[0].overallRisk = 5
      return {
        data: {
          resource: mockDataWithInitiatedState
        }
      }
    } else if (accountId === 'failed') {
      const mockDataWithInitiatedState = cloneDeep(MockData)
      mockDataWithInitiatedState[0].progressPercentage = 45
      mockDataWithInitiatedState[0].status = 'VERIFICATION_FAILED'
      mockDataWithInitiatedState[0].overallRisk = 90
      return {
        data: {
          resource: mockDataWithInitiatedState
        }
      }
    } else if (accountId === 'no percentage') {
      const mockDataWithInitiatedState = cloneDeep(MockData)
      mockDataWithInitiatedState[0].progressPercentage = undefined as any
      mockDataWithInitiatedState[0].status = 'ERROR'
      mockDataWithInitiatedState[0].overallRisk = 90
      return {
        data: {
          resource: mockDataWithInitiatedState
        }
      }
    }

    return {
      data: {
        resource: MockData
      }
    }
  })
}))

const TEST_PATH = routes.toCVActivityDashboard({ ...accountPathProps, ...projectPathProps })

describe('Unit tests for RecentActivityChanges', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Ensure that loading state is rendered when api is loading', async () => {
    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'loading',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <RecentActivityChanges />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelectorAll(`[class*="${Classes.SKELETON}"]`).length).toBe(3))
  })

  test('Ensure that when no data is returned, the placeholder with setup button is rendered', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'no data',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <RecentActivityChanges />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="activityList"]')).not.toBeNull())
    expect(getByText('cv.setup')).not.toBeNull()
  })

  test('Ensure that when an error happens, error card is displayed', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'error',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <RecentActivityChanges />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="activityList"]')).not.toBeNull())
    const retryButton = getByText('retry')
    expect(retryButton).not.toBeNull()
    retryButton.click()
    await waitFor(() => expect(refetchFunc).toHaveBeenCalledTimes(1))
  })

  test('Ensure that data is rendered when api provides data', async () => {
    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: '1234_accountId',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <RecentActivityChanges />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="activityList"]')).not.toBeNull())

    const dataRows = container.querySelectorAll('[class*="dataRow"]')
    expect(dataRows.length).toBe(4)

    const dataColumns = container.querySelectorAll('[class*="dataColumn"]')
    expect(dataColumns.length).toBe(8)

    const riskScores = container.querySelectorAll('[class*="riskScore"]')
    expect(riskScores.length).toBe(24)
    expect(riskScores[0].innerHTML).toEqual('30')
    expect(riskScores[1].innerHTML).toEqual('25')
    expect(riskScores[2].innerHTML).toEqual('55')
    expect(riskScores[3].innerHTML).toEqual('15')
    expect(riskScores[4].innerHTML).toEqual('25')
    expect(riskScores[5].innerHTML).toEqual('55')
  })

  test('Ensure right status messaging is displayed on top of progress bar for in progress with time remaining', async () => {
    // in progress with time remaining
    const { container, getAllByText } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: '1234_accountId',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <RecentActivityChanges />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="activityList"]')).not.toBeNull())
    expect(getAllByText(`inProgress (0 cv.activitychanges.minutesremaining)`).length).toBe(3)
    const progressMeter = container.querySelector(`[class*="${Classes.PROGRESS_METER}"]`)
    expect(progressMeter?.getAttribute('style')).toEqual('width: 43%;')
    expect(progressMeter?.getAttribute('class')).toContain('heatmapColor6')
  })

  test('Ensure right status messaging is displayed on top of progress bar for in progress with 0 progress', async () => {
    // initiated with no progress
    const { container, getByText } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'Initiated',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <RecentActivityChanges />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="activityList"]')).not.toBeNull())
    expect(getByText(`cv.initiated`)).not.toBeNull()
    const progressMeter = container.querySelector(`[class*="${Classes.PROGRESS_METER}"]`)
    expect(progressMeter?.getAttribute('style')).toEqual('width: 0%;')
    expect(progressMeter?.getAttribute('class')).toContain('heatmapColor1')
  })

  test('Ensure right status messaging is displayed on top of progress bar for verification that errored out', async () => {
    // failed mid way
    const { container, getByText } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'failed',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <RecentActivityChanges />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="activityList"]')).not.toBeNull())
    expect(getByText(`cv.admin.notifications.create.stepThree.verification failed (cv.riskScore: 90)`))
    const progressMeter = container.querySelector(`[class*="${Classes.PROGRESS_METER}"]`)
    expect(progressMeter?.getAttribute('style')).toEqual('width: 45%;')
    expect(progressMeter?.getAttribute('class')).toContain('heatmapColor9')
  })

  test('Ensure right status messaging is displayed when there is no progress percentage', async () => {
    const { container } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'no percentage',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG'
        }}
      >
        <RecentActivityChanges />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="activityList"]')).not.toBeNull())
    const childNodes = container.querySelector('[class*="verificationProgress"]')?.children
    expect(childNodes?.length).toBe(3)
    expect(childNodes?.[0].innerHTML).toEqual('')
  })

  test('Ensure right status messaging is displayed when verification has passed', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'passed',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_org'
        }}
      >
        <RecentActivityChanges />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="activityList"]')).not.toBeNull())
    expect(getByText(`cv.admin.notifications.create.stepThree.verification passed (cv.riskScore: 5)`))
    const progressMeter = container.querySelector(`[class*="${Classes.PROGRESS_METER}"]`)
    expect(progressMeter?.getAttribute('style')).toEqual('width: 100%;')
    expect(progressMeter?.getAttribute('class')).toContain('heatmapColor1')
  })
})
