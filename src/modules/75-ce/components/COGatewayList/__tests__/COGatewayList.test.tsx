import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import COGatewayList from '../COGatewayList'

const testpath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/create'
const testparams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

jest.mock('highcharts-react-official', () => () => <></>)

const listData = {
  response: [
    {
      id: 282,
      name: 'ravi-test-13',
      fulfilment: 'kubernetes',
      kind: 'k8s',
      cloud_account_id: 'Lightwing_Non_prod_old',
      idle_time_mins: 15,
      host_name: 'grateful-liger-c40gjtnsbqnjmr91f8n0.gateway.lightwing.io',
      custom_domains: null,
      match_all_subdomains: false,
      disabled: false,
      created_by: 'lv0euRhKRCyiXWzS7pOg6g',
      routing: {
        instance: null,
        lb: null,
        k8s: {
          RuleJson:
            '{"apiVersion":"lightwing.lightwing.io/v1","kind":"AutoStoppingRule","metadata":{"name":"ravi-test-13","annotations":{"harness.io/cloud-connector-id":"Lightwing_Non_prod_old","nginx.ingress.kubernetes.io/configuration-snippet":"more_set_input_headers \\"AutoStoppingRule: undefined-undefined-ravi-test-13\\";"}},"spec":{"idleTimeMins":15,"rules":[{"host":"caddyravi.cedevkubetest1.lightwingtest.com","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"caddy","port":{"number":80}}}}]}}]}}'
        },
        ports: []
      },
      health_check: {
        protocol: 'http',
        path: '/',
        port: 80,
        timeout: 30,
        id: ''
      },
      opts: {
        preserve_private_ip: false,
        delete_cloud_resources: false,
        always_use_private_ip: false
      },
      metadata: {
        custom_domain_providers: null,
        target_group_details: null,
        access_details: {
          backgroundTasks: {
            selected: false
          },
          dnsLink: {
            selected: false
          },
          ipaddress: {
            selected: false
          },
          rdp: {
            selected: false
          },
          ssh: {
            selected: false
          }
        },
        cloud_provider_details: {
          name: 'Lightwing Non prod old'
        },
        service_errors: null,
        kubernetes_connector_id: 'Ravi_test_14',
        health_check_details: null
      },
      access_point_id: null,
      status: 'created',
      created_at: '2021-07-28T07:40:38.420773Z',
      updated_at: '2021-07-28T07:40:38.420773Z',
      account_identifier: 'kmpySmUISimoRrJL6NL73w'
    }
  ]
}

jest.mock('services/lw', () => ({
  useAllServiceResources: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false,
    error: null
  })),
  useGetServices: jest.fn().mockImplementation(() => ({
    data: listData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useHealthOfService: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false
  })),
  useRequestsOfService: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false
  })),
  useSavingsOfService: jest.fn().mockImplementation(() => ({
    data: null,
    loading: false
  })),
  useGetServiceDiagnostics: jest.fn().mockImplementation(() => ({
    data: null
  })),
  useCumulativeServiceSavings: jest.fn().mockImplementation(() => ({
    data: null
  })),
  useToggleAutostoppingRule: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useDeleteService: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useGatewaySessionReport: jest.fn().mockImplementation(() => ({ mutate: Promise.resolve(() => jest.fn()) }))
}))

describe('Test COGatewayList', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('clicking on a row should open info drawer', async () => {
    const { container } = render(
      <TestWrapper path={testpath} pathParams={testparams}>
        <COGatewayList></COGatewayList>
      </TestWrapper>
    )

    const row = container.querySelector('.row.clickable')
    // const delete =
    expect(row).toBeDefined()
    act(() => {
      fireEvent.click(row!)
    })
    expect(container).toMatchSnapshot()
  })
})
