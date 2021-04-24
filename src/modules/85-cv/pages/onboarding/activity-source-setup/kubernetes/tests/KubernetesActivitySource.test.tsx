import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { Container } from '@wings-software/uicore'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { KubernetesActivitySource, transformApiData } from '../KubernetesActivitySource'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockImplementation(() => {
    return { isInitializingDB: false, dbInstance: { get: jest.fn(), put: jest.fn() } }
  }),
  CVObjectStoreNames: {}
}))

jest.mock('../SelectActivitySource/SelectActivitySource', () => ({
  ...(jest.requireActual('../SelectActivitySource/SelectActivitySource') as any),
  SelectActivitySource: function MockSelectActivitySource(props: any) {
    return <Container className="SelectActivitySource" onClick={() => props.onSubmit()} />
  }
}))
jest.mock('../SelectKubernetesConnector/SelectKubernetesConnector', () => ({
  ...(jest.requireActual('../SelectKubernetesConnector/SelectKubernetesConnector') as any),
  SelectKubernetesConnector: function MockSelectKubernetesConnector(props: any) {
    return <Container className="SelectKubernetesConnector" onClick={() => props.onSubmit()}></Container>
  }
}))
jest.mock('../SelectKubernetesNamespaces/SelectKubernetesNamespaces', () => ({
  ...(jest.requireActual('../SelectKubernetesNamespaces/SelectKubernetesNamespaces') as any),
  SelectKubernetesNamespaces: function MockSelectKubernetesNamespaces(props: any) {
    return (
      <Container className="SelectKubernetesNamespaces" onClick={() => props.onSubmit()}>
        <button id="SelectKubernetesNamespacesPrevious" onClick={() => props.onPrevious()} />
      </Container>
    )
  }
}))

jest.mock('../MapWorkloadsToServices/MapWorkloadsToServices', () => ({
  ...(jest.requireActual('../MapWorkloadsToServices/MapWorkloadsToServices') as any),
  MapWorkloadsToServices: function MapWorkloadsToServices(props: any) {
    return (
      <Container className="MapWorkloadsToServices" onClick={() => props.onSubmit()}>
        <button id="MapWorkloadsToServices" onClick={() => props.onPrevious()} />
      </Container>
    )
  }
}))

jest.mock('../ReviewKubernetesActivitySource/ReviewKubernetesActivitySource', () => ({
  ...(jest.requireActual('../ReviewKubernetesActivitySource/ReviewKubernetesActivitySource') as any),
  ReviewKubernetesActivitySource: function ReviewKubernetesActivitySource(props: any) {
    return (
      <Container className="ReviewKubernetesActivitySource" onClick={() => props.onSubmit()}>
        <button id="ReviewKubernetesActivitySource" onClick={() => props.onPrevious()} />
      </Container>
    )
  }
}))

const CurrentDate = Date.now()
const MockData = {
  uuid: '1234_uuid',
  identifier: '1234_identifier',
  name: 'kubernetes_activity_source',
  connectorIdentifier: '1234_conn_iden',
  createdAt: CurrentDate,
  lastUpdatedAt: CurrentDate,
  activitySourceConfigs: [
    {
      serviceIdentifier: '1234_serviceIden',
      envIdentifier: '1234_envIden',
      namespace: '1234_namespace',
      workloadName: '1234_workload'
    },
    {
      serviceIdentifier: '5678_serviceIden',
      envIdentifier: '5678_envIden',
      namespace: '1234_namespace',
      workloadName: '5678_workload'
    },
    {
      serviceIdentifier: '91011_serviceIden',
      envIdentifier: '91011_envIden',
      namespace: '5678_namespace',
      workloadName: '91011_workload'
    },
    {
      serviceIdentifier: '',
      envIdentifier: '5678_envIden',
      namespace: '1234_namespace',
      workloadName: '5678_workload'
    },
    {
      serviceIdentifier: '5678_serviceIden',
      envIdentifier: '',
      namespace: '1234_namespace',
      workloadName: '5678_workload'
    },
    {
      serviceIdentifier: '5678_serviceIden',
      envIdentifier: '5678_envIden',
      namespace: '',
      workloadName: '5678_workload'
    },
    {
      serviceIdentifier: '5678_serviceIden',
      envIdentifier: '5678_envIden',
      namespace: '1234_namespace',
      workloadName: ''
    }
  ]
}

describe('Unit tests for KubernetesActivitySource', () => {
  test('Ensure all tabs are rendered, and tabs can be selected on demand', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toCVActivitySourceSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '123'
        }}
      >
        <KubernetesActivitySource />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="SelectActivitySource"]')))

    const sourceRef = container.querySelector('.SelectActivitySource')
    if (!sourceRef) throw Error('Tabs were not rendered')
    fireEvent.click(sourceRef)

    await waitFor(() => expect(container.querySelector('.SelectKubernetesConnector')).not.toBeNull())

    const connectorRef = container.querySelector('.SelectKubernetesConnector')
    if (!connectorRef) throw Error('Tabs were not rendered')
    fireEvent.click(connectorRef)

    await waitFor(() => expect(container.querySelector('.SelectKubernetesNamespaces')).not.toBeNull())

    const nameSpaceRef = container.querySelector('.SelectKubernetesNamespaces')
    if (!nameSpaceRef) throw Error('Tabs were not rendered')

    const previousButtonNamespace = container.querySelector('#SelectKubernetesNamespacesPrevious')
    if (!previousButtonNamespace) throw Error('Previous button was not rendered namespace.')
    fireEvent.click(previousButtonNamespace)

    await waitFor(() => expect(container.querySelector('.MapWorkloadsToServices')).not.toBeNull())

    const workloadRef = container.querySelector('.MapWorkloadsToServices')
    if (!workloadRef) throw Error('Tabs were not rendered')

    const previousButtonWorkload = container.querySelector('#MapWorkloadsToServices')
    if (!previousButtonWorkload) throw Error('Previous button was not rendered workload.')
    fireEvent.click(previousButtonWorkload)

    await waitFor(() => expect(container.querySelector('.ReviewKubernetesActivitySource')).not.toBeNull())

    const reviewRef = container.querySelector('.ReviewKubernetesActivitySource')
    if (!reviewRef) throw Error('Tabs were not rendered')

    const previousButtonReview = container.querySelector('#ReviewKubernetesActivitySource')
    if (!previousButtonReview) throw Error('Previous button was not rendered review.')
    fireEvent.click(previousButtonReview)
  })

  test('Ensure that api is called when id is in params', async () => {
    const useGetKubernetesSourceSpy = jest.spyOn(cvService, 'useGetActivitySource')
    const refetchMock = jest.fn()
    useGetKubernetesSourceSpy.mockReturnValue({
      data: { data: { content: MockData } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, unknown>)

    const { container } = render(
      <TestWrapper
        path={routes.toCVActivitySourceEditSetup({
          ...accountPathProps,
          ...projectPathProps,
          activitySource: ':activitySource',
          activitySourceId: ':activitySourceId'
        })}
        pathParams={{
          accountId: '1234_account',
          projectIdentifier: '1234_project',
          orgIdentifier: '1234_ORG',
          activitySource: '1234_activitySource',
          activitySourceId: '1234_sourceId'
        }}
      >
        <KubernetesActivitySource />
      </TestWrapper>
    )
    await waitFor(() => expect(container.querySelector('[class*="SelectActivitySource"]')))
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })

  test('Ensure tranformfunction works correctly', async () => {
    expect(
      transformApiData({
        uuid: '1234_uuid',
        identifier: '1234_identifier',
        name: 'kubernetes_activity_source',
        connectorIdentifier: '1234_conn_iden',
        createdAt: CurrentDate,
        lastUpdatedAt: CurrentDate,
        activitySourceConfigs: [
          {
            serviceIdentifier: '1234_serviceIden',
            envIdentifier: '1234_envIden',
            namespace: '1234_namespace',
            workloadName: '1234_workload'
          },
          {
            serviceIdentifier: '5678_serviceIden',
            envIdentifier: '5678_envIden',
            namespace: '1234_namespace',
            workloadName: '5678_workload'
          },
          {
            serviceIdentifier: '91011_serviceIden',
            envIdentifier: '91011_envIden',
            namespace: '5678_namespace',
            workloadName: '91011_workload'
          },
          {
            serviceIdentifier: '',
            envIdentifier: '5678_envIden',
            namespace: '1234_namespace',
            workloadName: '5678_workload'
          },
          {
            serviceIdentifier: '5678_serviceIden',
            envIdentifier: '',
            namespace: '1234_namespace',
            workloadName: '5678_workload'
          },
          {
            serviceIdentifier: '5678_serviceIden',
            envIdentifier: '5678_envIden',
            namespace: '',
            workloadName: '5678_workload'
          },
          {
            serviceIdentifier: '5678_serviceIden',
            envIdentifier: '5678_envIden',
            namespace: '1234_namespace',
            workloadName: ''
          }
        ]
      })
    ).toEqual({
      uuid: '1234_uuid',
      identifier: '1234_identifier',
      name: 'kubernetes_activity_source',
      connectorIdentifier: '1234_conn_iden',
      connectorRef: {
        label: '1234_conn_iden',
        value: '1234_conn_iden'
      },
      connectorType: 'Kubernetes',
      createdAt: CurrentDate,
      selectedNamespaces: ['1234_namespace', '5678_namespace'],
      selectedWorkloads: new Map([
        [
          '1234_namespace',
          new Map([
            [
              '1234_workload',
              {
                selected: true,
                environmentIdentifier: { label: '1234_envIden', value: '1234_envIden' },
                serviceIdentifier: { label: '1234_serviceIden', value: '1234_serviceIden' },
                workload: '1234_workload'
              }
            ],
            [
              '5678_workload',
              {
                selected: true,
                environmentIdentifier: { label: '5678_envIden', value: '5678_envIden' },
                serviceIdentifier: { label: '5678_serviceIden', value: '5678_serviceIden' },
                workload: '5678_workload'
              }
            ]
          ])
        ],
        [
          '5678_namespace',
          new Map([
            [
              '91011_workload',
              {
                selected: true,
                environmentIdentifier: { label: '91011_envIden', value: '91011_envIden' },
                serviceIdentifier: { label: '91011_serviceIden', value: '91011_serviceIden' },
                workload: '91011_workload'
              }
            ]
          ])
        ]
      ])
    })
  })
})
