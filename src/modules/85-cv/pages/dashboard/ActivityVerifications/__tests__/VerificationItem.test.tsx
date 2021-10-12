import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as cvService from 'services/cv'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import type { UseStringsReturn } from 'framework/strings'
import VerificationItem, { mapTooltipItemStatus } from '../VerificationItem'

const MockItem: cvService.DeploymentActivityVerificationResultDTO = {
  postDeploymentSummary: {
    aggregatedStatus: 'VERIFICATION_PASSED',
    durationMs: 1800000,
    errors: 0,
    failed: 0,
    notStarted: 0,
    passed: 1,
    progress: 0,
    progressPercentage: 100,
    remainingTimeMs: 0,
    risk: 'LOW',
    startTime: 1614011400000,
    total: 1
  },
  preProductionDeploymentSummary: {
    aggregatedStatus: 'VERIFICATION_PASSED',
    durationMs: 1800000,
    errors: 0,
    failed: 0,
    notStarted: 0,
    passed: 1,
    progress: 0,
    progressPercentage: 100,
    remainingTimeMs: 0,
    risk: 'LOW',
    startTime: 1614010320000,
    total: 1
  },
  productionDeploymentSummary: {
    aggregatedStatus: 'VERIFICATION_PASSED',
    durationMs: 1800000,
    errors: 0,
    failed: 0,
    notStarted: 0,
    passed: 1,
    progress: 0,
    progressPercentage: 100,
    remainingTimeMs: 0,
    risk: 'LOW',
    startTime: 1614013200000,
    total: 1
  },
  serviceIdentifier: 'Banking_WebApp',
  serviceName: 'Banking WebApp',
  tag: 'build-18531'
}

const MockPopoverSummaryResponse = {
  metaData: {},
  resource: {
    tag: 'build-11375',
    serviceName: 'Banking WebApp',
    preProductionDeploymentSummary: {
      total: 1,
      verificationResults: [
        {
          jobName: 'TestVerification',
          status: 'VERIFICATION_PASSED',
          risk: 'NO_DATA',
          remainingTimeMs: 0,
          progressPercentage: 100,
          startTime: 1614217860000
        }
      ]
    },
    productionDeploymentSummary: null,
    postDeploymentSummary: null
  },
  responseMessages: []
}

describe('VerificationItem', () => {
  test('VerificationItem', async () => {
    const refetchMock = jest.fn()
    const useGetVerificationsPopoverSummarySpy = jest
      .spyOn(cvService, 'useGetVerificationsPopoverSummary')
      .mockReturnValue({
        refetch: refetchMock as unknown
      } as any)
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toCVProjectOverview({ ...accountPathProps, ...projectPathProps })}
        pathParams={{
          accountId: 'testAccountId',
          projectIdentifier: 'testProject',
          orgIdentifier: 'testOrg'
        }}
      >
        <VerificationItem item={MockItem} />
      </TestWrapper>
    )
    expect(getByText(MockItem.tag as string)).toBeDefined()
    expect(getByText(MockItem.serviceName as string)).toBeDefined()

    const progressIndicator = container.querySelector('[class*="bp3-progress-meter"]')
    if (!progressIndicator) {
      throw Error('Progress indicator was not rendered.')
    }

    useGetVerificationsPopoverSummarySpy.mockReturnValue({
      data: MockPopoverSummaryResponse,
      refetch: refetchMock as unknown
    } as any)
    fireEvent.mouseOver(progressIndicator)
    await waitFor(() => expect(document.body.querySelector('[class*="tooltipSubHeader"]')).not.toBeNull())
    expect(useGetVerificationsPopoverSummarySpy).toHaveBeenCalledWith({
      deploymentTag: 'build-18531',
      lazy: true
    })
    expect(refetchMock).toHaveBeenCalledWith({
      queryParams: {
        accountId: 'testAccountId',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'testProject',
        serviceIdentifier: 'Banking_WebApp'
      }
    })
  })
  test('mapTooltipItemStatus works correctly', () => {
    expect(
      mapTooltipItemStatus(
        'IN_PROGRESS',
        jest.fn().mockReturnValue('in progress') as UseStringsReturn['getString'],
        60000
      )
    ).toEqual('1in progress')
    expect(mapTooltipItemStatus('ERROR', jest.fn().mockReturnValue('Error') as UseStringsReturn['getString'])).toEqual(
      'Error'
    )
    expect(
      mapTooltipItemStatus('NOT_STARTED', jest.fn().mockReturnValue('Not Started') as UseStringsReturn['getString'])
    ).toEqual('Not Started')
    expect(
      mapTooltipItemStatus('VERIFICATION_FAILED', jest.fn().mockReturnValue('Failed') as UseStringsReturn['getString'])
    ).toEqual('Failed')
    expect(
      mapTooltipItemStatus('VERIFICATION_PASSED', jest.fn().mockReturnValue('Passed') as UseStringsReturn['getString'])
    ).toEqual('Passed')
  })
})
