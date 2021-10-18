import React from 'react'
import { render, waitFor, fireEvent, getByText } from '@testing-library/react'
import { Container } from '@wings-software/uicore'
import type { EventData } from '@cv/components/ActivitiesTimelineView/ActivitiesTimelineView'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { EventDetailsForChange } from '../EventDetailsForChange'

const MockEventDataDeployment: EventData[] = [
  {
    activityId: '1234_deploymentId',
    activityType: 'DEPLOYMENT',
    name: 'test',
    startTime: 1613628000000,
    verificationResult: 'VERIFICATION_PASSED'
  }
]

const MockDeploymentResponse = {
  metaData: {},
  resource: {
    serviceName: 'manager',
    serviceIdentifier: 'manager',
    envName: 'Production',
    envIdentifier: 'Prod',
    deploymentTag: 'build#2',
    deploymentVerificationJobInstanceSummary: {
      progressPercentage: 100,
      startTime: 1613628000000,
      durationMs: 300000,
      risk: 'NO_DATA',
      environmentName: 'Production',
      jobName: 'test',
      verificationJobInstanceId: '1234_jobId',
      activityId: '12345_activityId',
      activityStartTime: 1613628000000,
      status: 'VERIFICATION_PASSED',
      additionalInfo: {
        baselineDeploymentTag: null,
        baselineStartTime: null,
        currentDeploymentTag: 'build#2',
        currentStartTime: 1613628000000,
        type: 'TEST',
        baselineRun: true
      }
    }
  },
  responseMessages: []
}

jest.mock('react-monaco-editor', () => (props: any) => (
  <Container className="monaco-editor">
    <button className="monaco-editor-onChangebutton" onClick={() => props.onChange('{ "sdfsdffdf": "2132423" }')} />
  </Container>
))

describe('Unit tests for EventDetailsForChange', () => {
  test('Ensure  deployment content is rendered correctly and clicking on the card goes to deployment page', async () => {
    const refetchMock = jest.fn()
    jest.spyOn(cvService, 'useGetDeploymentActivitySummary').mockReturnValue({
      data: MockDeploymentResponse,
      refetch: refetchMock as unknown
    } as any)

    render(
      <TestWrapper>
        <EventDetailsForChange selectedActivities={MockEventDataDeployment} onCloseCallback={jest.fn()} />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelector('[class*="main"]')).not.toBeNull())
    expect(getByText(document.body, 'Production')).not.toBeNull()
    expect(document.body.querySelector('[class*="verificationStatusCard"]')?.innerHTML).toEqual('passed')

    const deploymentCard = document.body.querySelector('[class*="deploymentContent"]')
    if (!deploymentCard) {
      throw Error('deployment card was not rendered')
    }

    fireEvent.click(deploymentCard)
    await waitFor(() => expect('[class*="metricsTab"]').not.toBeNull())
  })
})
