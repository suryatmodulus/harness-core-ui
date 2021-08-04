import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CECOEditGatewayPage from '../CECOEditGatewayPage'

const mockedService = {
  id: 224,
  name: 'k8s rule edit test',
  fulfilment: 'ondemand',
  kind: 'k8s',
  org_id: 'lwdev1',
  project_id: 'Rishabh_bugbash2303',
  cloud_account_id: 'CeDevShaAWS',
  idle_time_mins: 15,
  host_name: 'lwdev1-k8s-rule-edit-test.gateway.lightwing.io',
  custom_domains: null,
  match_all_subdomains: false,
  disabled: false,
  created_by: 'lv0euRhKRCyiXWzS7pOg6g',
  routing: {
    instance: null,
    lb: null,
    k8s: {
      RuleJson:
        '{"apiVersion":"lightwing.lightwing.io/v1","kind":"AutoStoppingRule","metadata":{"name":"k8s-rule-edit-test","annotations":{"harness.io/project-id":"Rishabh_bugbash2303","harness.io/org-id":"lwdev1","harness.io/cloud-connector-id":"CeDevShaAWS","nginx.ingress.kubernetes.io/configuration-snippet":"more_set_input_headers \\"AutoStoppingRule: lwdev1-Rishabh_bugbash2303-k8s-rule-edit-test\\""}},"spec":{"idleTimeMins":15,"rules":[{"host":"randomtest.lw.in","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"test-service","port":{"number":80}}}}]}}]}}'
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
      name: 'CeDevShaAWS'
    },
    service_errors: null,
    kubernetes_connector_id: 'ry_kops_test_1',
    health_check_details: null
  },
  access_point_id: null,
  status: 'created',
  created_at: '2021-07-01T06:39:20.845693Z',
  updated_at: '2021-07-01T07:47:15.527434Z',
  account_identifier: 'kmpySmUISimoRrJL6NL73w'
}

const mockedData = { response: [] }

const mockedInstances = [
  {
    id: 'id',
    ipv4: '',
    launch_time: '', // eslint-disable-line
    name: 'name',
    region: 'us-west-2',
    status: 'running',
    tags: '',
    type: 'type',
    vpc: 'vpcid'
  }
]

const mockedAsg = {
  id: 'mockAsg',
  desired: 0,
  max: 3,
  min: 0,
  spot: 0,
  on_demand: 1, // eslint-disable-line
  provider_name: '', // eslint-disable-line
  // eslint-disable-next-line
  target_groups: [
    {
      id: 'target',
      name: 'my-targets',
      port: 80,
      protocol: 'HTTP',
      vpc: 'vpc'
    }
  ],
  availability_zones: ['us-east-1a'], // eslint-disable-line
  status: '',
  region: 'us-east-1',
  meta: {
    // eslint-disable-next-line
    mixed_instance_policy: {
      InstancesDistribution: {
        OnDemandAllocationStrategy: 'prioritized',
        OnDemandBaseCapacity: 1,
        OnDemandPercentageAboveBaseCapacity: 0,
        SpotAllocationStrategy: 'lowest-price',
        SpotInstancePools: 2,
        SpotMaxPrice: null
      },
      LaunchTemplate: {
        LaunchTemplateSpecification: {
          LaunchTemplateId: 'lt-03',
          LaunchTemplateName: 'lwcg',
          Version: null
        },
        Overrides: [{ InstanceType: '', LaunchTemplateSpecification: null, WeightedCapacity: null }]
      }
    }
  },
  mixed_instance: true // eslint-disable-line
}

const mockedRouteDetails = { response: { service: mockedService } }

const testPath = '/account/:accountId/ce/orgs/:orgIdentifier/projects/:projectIdentifier/autostopping-rules/edit/10'

const testParams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier', projectIdentifier: 'projectIdentifier' }

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/lw', () => ({
  useRouteDetails: jest.fn().mockImplementation(() => ({ data: mockedRouteDetails, loading: false })),
  useAllServiceResources: jest.fn().mockImplementation(() => ({ data: mockedData, loading: false })),
  useSaveService: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useAllResourcesOfAccount: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() =>
      Promise.resolve({
        response: mockedInstances
      })
    ),
    loading: false
  })),
  useGetAllASGs: jest
    .fn()
    .mockImplementation(() => ({ mutate: jest.fn(() => Promise.resolve({ response: [mockedAsg] })), loading: false })),
  useSecurityGroupsOfInstances: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve({ response: {} })),
    loading: false
  })),
  useGetServices: jest.fn().mockImplementation(() => ({ data: mockedData, loading: false, error: null }))
}))

describe('Edit rule page', () => {
  test('render edit rule page successfully', () => {
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testParams}>
        <CECOEditGatewayPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
