import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import get from 'lodash-es/get'
import type { UseGetReturn } from 'restful-react'
import { Container } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import {
  VerificationInstancePostDeploymentView,
  mapMetricsData,
  getSeriesZones
} from '../VerificationInstancePostDeploymentView'

const MockLogData = {
  resource: {
    totalPages: 10,
    totalItems: 100,
    pageItemCount: 10,
    pageSize: 10,
    content: [
      {
        projectIdentifier: '1234_projectIdentifier',
        orgIdentifier: '1234_orgIdentifier',
        environmentIdentifier: '1234_envIdentifier',
        serviceIdentifier: '1234_serviceIdentifier',
        logData: {
          text: '234234234',
          label: '8978yjghfjghf',
          count: 5,
          trend: [
            {
              timestamp: 12143287,
              count: 6
            }
          ],
          tag: 'KNOWN'
        }
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

const MockTimeSeriesData = {
  resource: {
    totalPages: 10,
    totalItems: 100,
    pageItemCount: 10,
    pageSize: 10,
    content: [
      {
        projectIdentifier: '1234_projectIdentifier',
        orgIdentifier: '1234_orgIdentifier',
        environmentIdentifier: '1234_envIdentifier',
        serviceIdentifier: '1234_serviceIdentifier',
        metricType: 'INFRA',
        category: 'PERFORMANCE',
        groupName: 'groupname',
        metricName: 'metricname',
        metricDataList: [
          {
            timestamp: 12143287,
            value: 56,
            risk: 'LOW_RISK'
          }
        ]
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

const MockData = {
  metaData: {},
  resource: {
    activityType: 'KUBERNETES',
    activityId: '1234_asdad',
    activityName: '7 Normal kubernetes events',
    activityStartTime: 1609953840000,
    environmentIdentifier: 'Prod',
    environmentName: null,
    serviceIdentifier: 'todolist',
    endTime: 1609954740000,
    remainingTimeMs: 0,
    overallRisk: 0,
    preActivityRisks: [
      { category: 'Errors', risk: -1.0 },
      { category: 'Performance', risk: 0.0 },
      { category: 'Infrastructure', risk: -1.0 }
    ],
    postActivityRisks: [
      { category: 'Errors', risk: -1.0 },
      { category: 'Performance', risk: 0.0 },
      { category: 'Infrastructure', risk: -1.0 }
    ],
    progressPercentage: 100,
    status: 'VERIFICATION_PASSED'
  },
  responseMessages: []
}

const MockDetailsData = {
  status: 'SUCCESS',
  data: [
    'class V1Event {\n    action: null\n    apiVersion: null\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-01-06T22:54:57.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: spec.containers{harness-example-prod}\n        kind: Pod\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt\n        namespace: raghu\n        resourceVersion: 224515707\n        uid: 7c846a79-ec46-45a1-a67e-07989dd5d4fc\n    }\n    kind: null\n    lastTimestamp: 2021-01-06T22:54:57.000+05:30\n    message: Created container harness-example-prod\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-01-06T22:54:57.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b48a4efb6417\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 22508066\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b48a4efb6417\n        uid: eb264f2d-5224-4f84-acd6-87e346f63bde\n    }\n    reason: Created\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: kubelet\n        host: gke-harness-test-pool-1-c8ba8831-m0zg\n    }\n    type: Normal\n}',
    'class V1Event {\n    action: null\n    apiVersion: null\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-01-06T22:54:57.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: spec.containers{harness-example-prod}\n        kind: Pod\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt\n        namespace: raghu\n        resourceVersion: 224515707\n        uid: 7c846a79-ec46-45a1-a67e-07989dd5d4fc\n    }\n    kind: null\n    lastTimestamp: 2021-01-06T22:54:57.000+05:30\n    message: Pulling image "registry.hub.docker.com/harness/todolist:latest"\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-01-06T22:54:57.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b48a2b2762c9\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 22508064\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b48a2b2762c9\n        uid: 6a7e6888-4c07-4aa5-851d-ab22648f4c70\n    }\n    reason: Pulling\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: kubelet\n        host: gke-harness-test-pool-1-c8ba8831-m0zg\n    }\n    type: Normal\n}',
    'class V1Event {\n    action: null\n    apiVersion: null\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-01-06T22:54:56.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: apps/v1\n        fieldPath: null\n        kind: Deployment\n        name: harness-example-prod-deployment-canary\n        namespace: raghu\n        resourceVersion: 224515700\n        uid: 9a3301bc-7286-4547-aa0c-37d959c87c5f\n    }\n    kind: null\n    lastTimestamp: 2021-01-06T22:54:56.000+05:30\n    message: Scaled up replica set harness-example-prod-deployment-canary-64b469d998 to 1\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-01-06T22:54:56.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-canary.1657b489f657a95e\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 22508061\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-canary.1657b489f657a95e\n        uid: 9bbb784f-b042-4b88-8c05-7cb2a9bcdf31\n    }\n    reason: ScalingReplicaSet\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: deployment-controller\n        host: null\n    }\n    type: Normal\n}',
    'class V1Event {\n    action: null\n    apiVersion: null\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-01-06T22:54:58.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: spec.containers{harness-example-prod}\n        kind: Pod\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt\n        namespace: raghu\n        resourceVersion: 224515707\n        uid: 7c846a79-ec46-45a1-a67e-07989dd5d4fc\n    }\n    kind: null\n    lastTimestamp: 2021-01-06T22:54:58.000+05:30\n    message: Started container harness-example-prod\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-01-06T22:54:58.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b48a57a1c933\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 22508067\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b48a57a1c933\n        uid: 494e9a44-3d21-4b4d-a293-230b71cd1fcd\n    }\n    reason: Started\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: kubelet\n        host: gke-harness-test-pool-1-c8ba8831-m0zg\n    }\n    type: Normal\n}',
    'class V1Event {\n    action: null\n    apiVersion: null\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-01-06T22:54:57.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: spec.containers{harness-example-prod}\n        kind: Pod\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt\n        namespace: raghu\n        resourceVersion: 224515707\n        uid: 7c846a79-ec46-45a1-a67e-07989dd5d4fc\n    }\n    kind: null\n    lastTimestamp: 2021-01-06T22:54:57.000+05:30\n    message: Successfully pulled image "registry.hub.docker.com/harness/todolist:latest"\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-01-06T22:54:57.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b48a496d32fd\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 22508065\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b48a496d32fd\n        uid: 4913da8e-18ad-4557-9489-4cacd7c0c34a\n    }\n    reason: Pulled\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: kubelet\n        host: gke-harness-test-pool-1-c8ba8831-m0zg\n    }\n    type: Normal\n}',
    'class V1Event {\n    action: null\n    apiVersion: null\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-01-06T22:54:56.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: apps/v1\n        fieldPath: null\n        kind: ReplicaSet\n        name: harness-example-prod-deployment-canary-64b469d998\n        namespace: raghu\n        resourceVersion: 224515701\n        uid: 38eee040-e7f9-451e-a8df-2d3c53f00828\n    }\n    kind: null\n    lastTimestamp: 2021-01-06T22:54:56.000+05:30\n    message: Created pod: harness-example-prod-deployment-canary-64b469d998-gxrzt\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-01-06T22:54:56.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-canary-64b469d998.1657b489f771e7d8\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 22508062\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-canary-64b469d998.1657b489f771e7d8\n        uid: d1a5e80e-e4e0-4e27-af07-f4853e9dd2b9\n    }\n    reason: SuccessfulCreate\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: replicaset-controller\n        host: null\n    }\n    type: Normal\n}',
    'class V1Event {\n    action: null\n    apiVersion: null\n    count: 1\n    eventTime: null\n    firstTimestamp: 2021-01-06T22:54:56.000+05:30\n    involvedObject: class V1ObjectReference {\n        apiVersion: v1\n        fieldPath: null\n        kind: Pod\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt\n        namespace: raghu\n        resourceVersion: 224515705\n        uid: 7c846a79-ec46-45a1-a67e-07989dd5d4fc\n    }\n    kind: null\n    lastTimestamp: 2021-01-06T22:54:56.000+05:30\n    message: Successfully assigned raghu/harness-example-prod-deployment-canary-64b469d998-gxrzt to gke-harness-test-pool-1-c8ba8831-m0zg\n    metadata: class V1ObjectMeta {\n        annotations: null\n        clusterName: null\n        creationTimestamp: 2021-01-06T22:54:56.000+05:30\n        deletionGracePeriodSeconds: null\n        deletionTimestamp: null\n        finalizers: null\n        generateName: null\n        generation: null\n        labels: null\n        managedFields: null\n        name: harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b489f7ee5370\n        namespace: raghu\n        ownerReferences: null\n        resourceVersion: 22508063\n        selfLink: /api/v1/namespaces/raghu/events/harness-example-prod-deployment-canary-64b469d998-gxrzt.1657b489f7ee5370\n        uid: f83861d9-70ee-452a-9d81-825bc1d205ce\n    }\n    reason: Scheduled\n    related: null\n    reportingComponent: \n    reportingInstance: \n    series: null\n    source: class V1EventSource {\n        component: default-scheduler\n        host: null\n    }\n    type: Normal\n}'
  ],
  metaData: null,
  correlationId: null
}

jest.mock('moment', () => {
  const original = jest.requireActual('moment')
  original().__proto__.format = () => 'XX:YY'
  return original
})

jest.mock('@cv/components/ActivitiesTimelineView/ActivitiesTimelineViewSection', () => () => (
  <Container className="activitiestimeline" />
))

jest.mock('react-monaco-editor', () => (props: any) => (
  <Container className="monaco-editor">
    <button className="monaco-editor-onChangebutton" onClick={() => props.onChange('{ "sdfsdffdf": "2132423" }')} />
  </Container>
))

jest.mock('@cv/components/EventDetailsForChange/EventDetailsForChange', () => ({
  ...(jest.requireActual('@cv/components/EventDetailsForChange/EventDetailsForChange') as any),
  EventDetailsForChange: function MockEventDetails() {
    return <Container className="eventDetails" />
  }
}))

describe('VerificationInstancePostDeploymentView', () => {
  test('mapMetricsData works correctly', () => {
    const data = mapMetricsData(
      {
        resource: {
          content: [
            {
              groupName: 'testGroupName',
              metricName: 'testMetricName',
              metricDataList: [
                { timestamp: 1605541814220, value: 10, risk: 'LOW_RISK' },
                { timestamp: 1605541874220, value: 10, risk: 'LOW_RISK' },
                { timestamp: 1605541934220, value: 10, risk: 'LOW_RISK' },
                { timestamp: 1605541994220, value: 10, risk: 'LOW_RISK' },
                { timestamp: 1605542054220, value: 10, risk: 'LOW_RISK' },
                { timestamp: 1605542114220, value: 10, risk: 'LOW_RISK' },

                { timestamp: 1605542174220, value: 10, risk: 'LOW_RISK' },
                { timestamp: 1605542234220, value: 10, risk: 'LOW_RISK' },
                { timestamp: 1605542294220, value: 10, risk: 'LOW_RISK' }
              ]
            }
          ]
        }
      },
      1605541814220,
      1605542294220
    )
    expect(data[0].transactionName).toEqual('testGroupName')
    expect(data[0].metricName).toEqual('testMetricName')
    expect(get(data[0], 'seriesData[0].series[0].type')).toEqual('line')
  })

  test('getSeriesZones works correctly', () => {
    const zones = getSeriesZones([
      { timestamp: 100, risk: 'LOW_RISK' },
      { timestamp: 200, risk: 'LOW_RISK' },
      { timestamp: 300, risk: 'HIGH_RISK' },
      { timestamp: 400, risk: 'HIGH_RISK' },
      { timestamp: 500, risk: 'LOW_RISK' }
    ])
    expect(zones.length).toEqual(3)
    expect(zones[0].value).toEqual(200)
    expect(zones[1].value).toEqual(400)
    expect(zones[2].value).toEqual(500)
  })

  test('Ensure kubernetes vents link is displayed for a kubernetes event', async () => {
    jest.spyOn(cvService, 'useGetActivityVerificationResult').mockReturnValue({
      data: MockData,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetEventDetails').mockReturnValue({
      data: MockDetailsData
    } as UseGetReturn<any, any, any, any>)

    const { container } = render(
      <TestWrapper>
        <VerificationInstancePostDeploymentView
          selectedActivityId="1234_activity_id"
          activityStartTime={(undefined as unknown) as number}
          durationMs={15}
          environmentIdentifier="1234_envIdentifier"
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    const button = container.querySelector('[class*="kubernetesButton"]')
    if (!button) {
      throw Error('button was not rendered')
    }
    fireEvent.click(button)
    await waitFor(() => expect(document.body.querySelector('.eventDetails')).not.toBeNull())
  })

  test('Ensure that logs tab is rendered properly', async () => {
    jest.spyOn(cvService, 'useGetActivityVerificationResult').mockReturnValue({
      data: MockData
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetEventDetails').mockReturnValue({
      error: { message: 'mockError' },
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const refetchMock = jest.fn()
    jest.spyOn(cvService, 'useGetActivityLogs').mockReturnValue({
      data: MockLogData,
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetActivityMetrics').mockReturnValue({
      data: MockTimeSeriesData,
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    jest.spyOn(cvService, 'useGetTagCountForActivity').mockReturnValue({
      data: null
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <VerificationInstancePostDeploymentView
          selectedActivityId="1234_activity_id"
          activityStartTime={1609946640000}
          durationMs={15}
          environmentIdentifier="1234_envIdentifier"
        />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="main"]')).not.toBeNull())
    fireEvent.click(getByText('cv.analysisScreens.analysisTab.logs'))
    await waitFor(() => expect(container.querySelector('[class*="frequencyChart"]')).not.toBeNull())
    fireEvent.click(getByText('2'))
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })
})
