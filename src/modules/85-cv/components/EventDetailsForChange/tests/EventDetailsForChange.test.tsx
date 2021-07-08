import React from 'react'
import { render, waitFor, fireEvent, getByText } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { Container } from '@wings-software/uicore'
import type { EventData } from '@cv/components/ActivitiesTimelineView/ActivitiesTimelineView'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import { EventDetailsForChange } from '../EventDetailsForChange'

const MockEventData: EventData[] = [
  {
    activityId: '1234_activityId',
    activityType: 'KUBERNETES',
    name: '1 Warning kubernetes events',
    startTime: 1612471080000,
    verificationResult: 'VERIFICATION_PASSED'
  },
  {
    activityId: '7891_activityId',
    name: '1 Warning kubernetes events',
    startTime: 1612471140000,
    activityType: 'KUBERNETES',
    verificationResult: 'VERIFICATION_FAILED'
  },
  {
    activityId: '4567_activityId',
    name: '5 Normal kubernetes events',
    startTime: 1612471140000,
    activityType: 'KUBERNETES',
    verificationResult: 'NOT_STARTED'
  }
]

const MockEventDataDeployment: EventData[] = [
  {
    activityId: '1234_deploymentId',
    activityType: 'DEPLOYMENT',
    name: 'test',
    startTime: 1613628000000,
    verificationResult: 'VERIFICATION_PASSED'
  }
]

const MockActivityVerificationResult = {
  metaData: {},
  resource: {
    activityType: 'KUBERNETES',
    activityId: 'DIONunBCT8iLV0PqAguWdg',
    activityName: '1 Warning kubernetes events',
    activityStartTime: 1612471080000,
    environmentIdentifier: 'prod',
    environmentName: null,
    serviceIdentifier: 'todolist',
    endTime: 1612471980000,
    remainingTimeMs: 0,
    overallRisk: 88,
    preActivityRisks: [
      { category: 'Infrastructure', risk: -1.0 },
      { category: 'Errors', risk: 22.0 },
      { category: 'Performance', risk: 87.0 }
    ],
    postActivityRisks: [
      { category: 'Infrastructure', risk: -1.0 },
      { category: 'Errors', risk: 22.0 },
      { category: 'Performance', risk: 88.0 }
    ],
    progressPercentage: 100,
    status: 'VERIFICATION_FAILED'
  },
  responseMessages: []
}

const Mock5KubeEvents = {
  status: 'SUCCESS',
  data: {
    sourceName: 'k8',
    connectorIdentifier: 'org.harness_test_ban',
    workload: 'harness-example-prod-deployment',
    kind: 'Pod',
    namespace: 'raghu',
    details: [
      {
        timeStamp: 1613057579000,
        eventType: 'Normal',
        reason: 'Created',
        message: 'Created container harness-example-prod',
        eventJson:
          'class V1Event {\n    action: null\n    apiVersion: v1\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-02-11T21:02:59.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: spec.containers{harness-example-prod}\n        kind: Pod\n        name: harness-example-prod-deployment-766fd6d949-cgdbr\n        namespace: raghu\n        resourceVersion: 280862365\n        uid: 9c3222cf-5afa-48cb-acbb-69312f8d671f\n    }\n    kind: Event\n    lastTimestamp: 2021-02-11T21:02:59.000+05:30\n    message: Created container harness-example-prod\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-02-11T21:02:59.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-766fd6d949-cgdbr.1662bb52972de4b7\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 24381932\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-766fd6d949-cgdbr.1662bb52972de4b7\n        uid: fb84a5f9-c1a7-48da-9bc4-8c0515839963\n    }\n    reason: Created\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: kubelet\n        host: gke-harness-test-pool-1-c8ba8831-50pq\n    }\n    type: Normal\n}'
      },
      {
        timeStamp: 1613057578000,
        eventType: 'Normal',
        reason: 'Scheduled',
        message:
          'Successfully assigned raghu/harness-example-prod-deployment-766fd6d949-cgdbr to gke-harness-test-pool-1-c8ba8831-50pq',
        eventJson:
          'class V1Event {\n    action: null\n    apiVersion: v1\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-02-11T21:02:58.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: null\n        kind: Pod\n        name: harness-example-prod-deployment-766fd6d949-cgdbr\n        namespace: raghu\n        resourceVersion: 280862362\n        uid: 9c3222cf-5afa-48cb-acbb-69312f8d671f\n    }\n    kind: Event\n    lastTimestamp: 2021-02-11T21:02:58.000+05:30\n    message: Successfully assigned raghu/harness-example-prod-deployment-766fd6d949-cgdbr to gke-harness-test-pool-1-c8ba8831-50pq\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-02-11T21:02:58.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-766fd6d949-cgdbr.1662bb523fa39e78\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 24381926\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-766fd6d949-cgdbr.1662bb523fa39e78\n        uid: 7f62e3a6-3e5d-4d07-8d18-87a0119d083a\n    }\n    reason: Scheduled\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: default-scheduler\n        host: null\n    }\n    type: Normal\n}'
      },
      {
        timeStamp: 1613057579000,
        eventType: 'Normal',
        reason: 'Pulling',
        message: 'Pulling image "registry.hub.docker.com/harness/todolist:latest"',
        eventJson:
          'class V1Event {\n    action: null\n    apiVersion: v1\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-02-11T21:02:59.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: spec.containers{harness-example-prod}\n        kind: Pod\n        name: harness-example-prod-deployment-766fd6d949-cgdbr\n        namespace: raghu\n        resourceVersion: 280862365\n        uid: 9c3222cf-5afa-48cb-acbb-69312f8d671f\n    }\n    kind: Event\n    lastTimestamp: 2021-02-11T21:02:59.000+05:30\n    message: Pulling image "registry.hub.docker.com/harness/todolist:latest"\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-02-11T21:02:59.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-766fd6d949-cgdbr.1662bb52759441b9\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 24381929\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-766fd6d949-cgdbr.1662bb52759441b9\n        uid: 0b366ae4-4aac-45d8-b46d-51d50445ec26\n    }\n    reason: Pulling\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: kubelet\n        host: gke-harness-test-pool-1-c8ba8831-50pq\n    }\n    type: Normal\n}'
      },
      {
        timeStamp: 1613057552000,
        eventType: 'Normal',
        reason: 'Killing',
        message: 'Stopping container harness-example-prod',
        eventJson:
          'class V1Event {\n    action: null\n    apiVersion: v1\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-02-11T21:02:32.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: spec.containers{harness-example-prod}\n        kind: Pod\n        name: harness-example-prod-deployment-canary-b7bdbb966-g5lgh\n        namespace: raghu\n        resourceVersion: 280861150\n        uid: 26ba5fac-10d3-4002-b108-6997254776cc\n    }\n    kind: Event\n    lastTimestamp: 2021-02-11T21:02:32.000+05:30\n    message: Stopping container harness-example-prod\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-02-11T21:02:32.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-canary-b7bdbb966-g5lgh.1662bb4c40144e80\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 24381917\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-canary-b7bdbb966-g5lgh.1662bb4c40144e80\n        uid: 73d509c1-bc2d-432e-8402-caec1cbd6aae\n    }\n    reason: Killing\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: kubelet\n        host: gke-harness-test-pool-1-c8ba8831-b1gh\n    }\n    type: Normal\n}'
      },
      {
        timeStamp: 1613057579000,
        eventType: 'Normal',
        reason: 'Pulled',
        message: 'Successfully pulled image "registry.hub.docker.com/harness/todolist:latest"',
        eventJson:
          'class V1Event {\n    action: null\n    apiVersion: v1\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-02-11T21:02:59.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: spec.containers{harness-example-prod}\n        kind: Pod\n        name: harness-example-prod-deployment-766fd6d949-cgdbr\n        namespace: raghu\n        resourceVersion: 280862365\n        uid: 9c3222cf-5afa-48cb-acbb-69312f8d671f\n    }\n    kind: Event\n    lastTimestamp: 2021-02-11T21:02:59.000+05:30\n    message: Successfully pulled image "registry.hub.docker.com/harness/todolist:latest"\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-02-11T21:02:59.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-766fd6d949-cgdbr.1662bb52949ad272\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 24381931\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-766fd6d949-cgdbr.1662bb52949ad272\n        uid: 8d5e8202-e1d3-49a0-871a-9d0069c3a352\n    }\n    reason: Pulled\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: kubelet\n        host: gke-harness-test-pool-1-c8ba8831-50pq\n    }\n    type: Normal\n}'
      }
    ]
  },
  metaData: null,
  correlationId: null
}

const MockEventDetailsResponse = {
  status: 'SUCCESS',
  data: {
    sourceName: 'k8',
    connectorIdentifier: 'org.harness_test_ban',
    workload: 'harness-example-prod-deployment',
    kind: 'Deployment',
    namespace: 'raghu',
    details: [
      {
        timeStamp: 1613057512000,
        eventType: 'Normal',
        reason: 'ScalingReplicaSet',
        message: 'Scaled up replica set harness-example-prod-deployment-canary-b7bdbb966 to 1',
        eventJson:
          'class V1Event {\n    action: null\n    apiVersion: v1\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-02-11T21:01:52.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: apps/v1\n        fieldPath: null\n        kind: Deployment\n        name: harness-example-prod-deployment-canary\n        namespace: raghu\n        resourceVersion: 280861142\n        uid: 2fddb2f9-0c3d-4143-a3b6-6fd4a40a4254\n    }\n    kind: Event\n    lastTimestamp: 2021-02-11T21:01:52.000+05:30\n    message: Scaled up replica set harness-example-prod-deployment-canary-b7bdbb966 to 1\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-02-11T21:01:52.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-canary.1662bb42c7ac5bc6\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 24381889\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-canary.1662bb42c7ac5bc6\n        uid: b96c5e57-c864-438b-b560-fae70fab09d5\n    }\n    reason: ScalingReplicaSet\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: deployment-controller\n        host: null\n    }\n    type: Normal\n}'
      }
    ]
  },
  metaData: null,
  correlationId: null
}

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
  test('Ensure left nav is rendered with correct events when provided', async () => {
    jest
      .spyOn(cvService, 'useGetActivityVerificationResult')
      .mockReturnValue({ data: MockActivityVerificationResult, refetch: jest.fn() as unknown } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
    jest
      .spyOn(cvService, 'useGetEventDetails')
      .mockReturnValue({ data: MockEventDetailsResponse, refetch: jest.fn() as unknown } as UseGetReturn<
        any,
        any,
        any,
        any
      >)

    const { rerender } = render(
      <TestWrapper>
        <EventDetailsForChange selectedActivities={MockEventData} onCloseCallback={jest.fn()} />
      </TestWrapper>
    )

    // check what happens when there are 3 activities to render
    await waitFor(() => expect(document.body.querySelectorAll('[class*="activityItem"]')?.length).toBe(3))
    const activityItems = document.body.querySelectorAll('[class*="activityItem"]')
    expect(document.body.querySelector('[class*="selectedActivity"]')).toEqual(activityItems[0])

    fireEvent.click(activityItems[1])
    await waitFor(() => expect(activityItems[1]?.getAttribute('class')).toContain('selectedActivity'))

    //re render with only one item
    rerender(
      <TestWrapper>
        <EventDetailsForChange selectedActivities={[MockEventData[2]]} onCloseCallback={jest.fn()} />
      </TestWrapper>
    )
    await waitFor(() => expect(document.body.querySelectorAll('[class*="activityItem"]')?.length).toBe(1))
  })

  test('Ensure that when view json is clicked the json is rendered', async () => {
    jest
      .spyOn(cvService, 'useGetEventDetails')
      .mockReturnValue({ data: MockEventData, refetch: jest.fn() as unknown } as UseGetReturn<any, any, any, any>)
    jest
      .spyOn(cvService, 'useGetActivityVerificationResult')
      .mockReturnValue({ data: MockActivityVerificationResult, refetch: jest.fn() as unknown } as UseGetReturn<
        any,
        any,
        any,
        any
      >)

    render(
      <TestWrapper>
        <EventDetailsForChange selectedActivities={MockEventData} onCloseCallback={jest.fn()} />
      </TestWrapper>
    )

    await waitFor(() =>
      expect(document.body.querySelector('[class*="largeTile"]')?.children[0]?.innerHTML).toEqual('88')
    )

    const activities = document.body.querySelectorAll('[class*="activityItem"]')
    expect(activities?.length).toBe(3)
    expect(activities[0].getAttribute('class')).toContain('selectedActivity')
    const viewJSONButton = getByText(document.body, 'viewJSON')
    fireEvent.click(viewJSONButton)

    await waitFor(() => expect(document.body.querySelector('[class*="monaco-editor"]')).not.toBeNull())

    // go back to activities view
    const goBackButton = document.body.querySelector('button[class*="backToChangeList"]')
    if (!goBackButton) {
      throw Error('Button was not rendered.')
    }

    fireEvent.click(goBackButton)
    await waitFor(() =>
      expect(document.body.querySelector('[class*="largeTile"]')?.children[0]?.innerHTML).toEqual('88')
    )

    // click on a different activity and expect right side to update
    jest
      .spyOn(cvService, 'useGetActivityVerificationResult')
      .mockReturnValue({ data: Mock5KubeEvents, refetch: jest.fn() as unknown } as UseGetReturn<any, any, any, any>)
    fireEvent.click(activities[2])
    await waitFor(() =>
      expect(document.querySelectorAll('[class*="activityItem"]')?.[2]?.getAttribute('class')).toContain(
        'selectedActivity'
      )
    )
  })

  test('Ensure kubernetes events modal shows error when there is error', async () => {
    jest.spyOn(cvService, 'useGetActivityVerificationResult').mockReturnValue({
      data: MockActivityVerificationResult,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const refetchMock = jest.fn()
    jest.spyOn(cvService, 'useGetEventDetails').mockReturnValue({
      error: { data: { detailedMessage: 'mockError' } } as any,
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, any>)

    render(
      <TestWrapper>
        <EventDetailsForChange
          selectedActivities={MockEventData}
          selectedActivityInfo={{ selectedActivityId: '1234_activityId', selectedActivityType: 'KUBERNETES' }}
          onCloseCallback={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelector('[class*="main"]')).not.toBeNull())
    await waitFor(() => expect(document.body.querySelector('[class*="contentError"]')).not.toBeNull())
    const retryButton = document.body.querySelector('[class*="contentError"] button')
    if (!retryButton) {
      throw Error('Retry button was not rendered.')
    }
    fireEvent.click(retryButton)
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })

  test('Ensure  deployment content is rendered correctly and clicking on the card goes to deployment page', async () => {
    const refetchMock = jest.fn()
    jest.spyOn(cvService, 'useGetDeploymentActivitySummary').mockReturnValue({
      data: MockDeploymentResponse,
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, any>)

    render(
      <TestWrapper>
        <EventDetailsForChange selectedActivities={MockEventDataDeployment} onCloseCallback={jest.fn()} />
      </TestWrapper>
    )

    await waitFor(() => expect(document.body.querySelector('[class*="main"]')).not.toBeNull())
    expect(getByText(document.body, 'Production')).not.toBeNull()
    expect(getByText(document.body, 'passed')).not.toBeNull()

    const deploymentCard = document.body.querySelector('[class*="deploymentContent"]')
    if (!deploymentCard) {
      throw Error('deployment card was not rendered')
    }

    fireEvent.click(deploymentCard)
    await waitFor(() => expect('[class*="metricsTab"]').not.toBeNull())
  })
})
