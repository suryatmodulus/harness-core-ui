import { RiskValues } from '@cv/utils/CommonUtils'
import type { Node } from '@cv/components/DependencyGraph/DependencyGraph.types'
import { serviceIcon } from '../DependencyGraph.constants'

const commonClassName = `PointData Test_Service_101 Status_${RiskValues.NO_ANALYSIS}`

export const graphData = [
  {
    from: 'Test_service_103',
    to: 'Test_Service_102_Test_Prod_Env_101'
  },
  {
    from: 'service106_Test_env_102',
    to: 'Test_Service_104_Test_env_102'
  },
  {
    from: 'Test_Service_102_Test_Prod_Env_101',
    to: 'Test_service_103_Test_Prod_Env_101'
  },
  {
    from: 'Test_service_103_Test_Prod_Env_101',
    to: 'Test_Service_102_Test_Prod_Env_101'
  },
  {
    from: 'Test_Service_101',
    to: 'Test_Service_102_Test_Prod_Env_101'
  },
  {
    from: 'Test_Service_101_Test_Prod_Env_101',
    to: 'Test_service_103_Test_Prod_Env_101'
  },
  {
    from: 'service105_Test_env_102',
    to: 'Test_Service_104_Test_env_102'
  },
  {
    from: 'Test_Service_102',
    to: 'Test_service_103_Test_Prod_Env_101'
  },
  {
    from: 'service107_Test_env_102',
    to: 'Test_Service_104_Test_env_102'
  },
  {
    from: 'Test_Service_103_Test_env_102',
    to: 'Test_Service_104_Test_env_102'
  },
  {
    from: 'Test_Service_101',
    to: 'Test_service_103_Test_Prod_Env_101'
  },
  {
    from: 'Test_Service_101_Test_Prod_Env_101',
    to: 'Test_Service_102_Test_Prod_Env_101'
  }
]

export const nodes: Array<Node> = [
  {
    id: 'service106_Test_env_102',
    status: RiskValues.NO_ANALYSIS,
    icon: serviceIcon,
    name: 'service106'
  },
  {
    id: 'Test_Service_101_Test_Prod_Env_101',
    status: RiskValues.NO_ANALYSIS,
    icon: serviceIcon,
    name: 'Test_Service_101'
  },
  {
    id: 'Test_Service_103_Test_env_102',
    status: RiskValues.NO_ANALYSIS,
    icon: serviceIcon,
    name: 'Test_Service_103'
  },
  {
    id: 'Test_Service_102_Test_Prod_Env_101',
    status: RiskValues.NO_ANALYSIS,
    icon: serviceIcon,
    name: 'Test_Service_102'
  },
  {
    id: 'Test_service_103_Test_Prod_Env_101',
    status: RiskValues.NO_ANALYSIS,
    icon: serviceIcon,
    name: 'Test_service_103'
  },
  {
    id: 'service105_Test_env_102',
    status: RiskValues.NO_ANALYSIS,
    icon: serviceIcon,
    name: 'service105'
  },
  {
    id: 'service107_Test_env_102',
    status: RiskValues.NO_ANALYSIS,
    icon: serviceIcon,
    name: 'service107'
  },
  {
    id: 'Test_Service_104_Test_Prod_Env_101',
    status: RiskValues.NO_ANALYSIS,
    icon: serviceIcon,
    name: 'Test_Service_104'
  },
  {
    id: 'Test_Service_104_Test_env_102',
    status: RiskValues.HEALTHY,
    icon: serviceIcon,
    name: 'Test_Service_104'
  }
]

export const formattedNodes = [
  {
    className: `PointData service106 Status_${RiskValues.NO_ANALYSIS}`,
    id: 'service106_Test_env_102'
  },
  {
    className: commonClassName,
    id: 'Test_Service_101_Test_Prod_Env_101'
  },
  {
    className: `PointData Test_Service_103 Status_${RiskValues.NO_ANALYSIS}`,
    id: 'Test_Service_103_Test_env_102'
  },
  {
    className: `PointData Test_Service_102 Status_${RiskValues.NO_ANALYSIS}`,
    id: 'Test_Service_102_Test_Prod_Env_101'
  },
  {
    className: `PointData Test_service_103 Status_${RiskValues.NO_ANALYSIS}`,
    id: 'Test_service_103_Test_Prod_Env_101'
  },
  {
    className: `PointData service105 Status_${RiskValues.NO_ANALYSIS}`,
    id: 'service105_Test_env_102'
  },
  {
    className: `PointData service107 Status_${RiskValues.NO_ANALYSIS}`,
    id: 'service107_Test_env_102'
  },
  {
    className: `PointData Test_Service_104 Status_${RiskValues.NO_ANALYSIS}`,
    id: 'Test_Service_104_Test_Prod_Env_101'
  },
  {
    className: `PointData Test_Service_104 Status_${RiskValues.HEALTHY}`,
    id: 'Test_Service_104_Test_env_102'
  },
  {
    className: `PointData Test_service_103 Status_${RiskValues.NO_ANALYSIS}`,
    id: 'Test_service_103'
  },
  {
    className: commonClassName,
    id: 'Test_Service_101'
  },
  {
    className: `PointData Test_Service_102 Status_${RiskValues.NO_ANALYSIS}`,
    id: 'Test_Service_102'
  },
  {
    className: commonClassName,
    id: 'Test_Service_101'
  }
]

export const defaultOptions = {
  chart: {
    type: 'networkgraph',
    events: {
      click: jest.fn()
    }
  },
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  plotOptions: {
    networkgraph: {
      layoutAlgorithm: {
        integration: 'verlet'
      },
      cursor: 'pointer',
      states: {
        inactive: {
          enabled: false
        },
        hover: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: true,
        linkFormat: '',
        useHTML: true,
        allowOverlap: false,
        y: 50,
        formatter: jest.fn()
      }
    }
  },
  tooltip: {
    enabled: false
  },
  series: [
    {
      id: 'lang-tree',
      marker: {
        enabled: true,
        radius: 50
      },
      type: 'networkgraph',
      data: graphData,
      nodes: formattedNodes,
      point: {
        events: {
          click: jest.fn()
        }
      }
    }
  ]
}
export const mockedServiceDependencies = {
  metaData: {},
  resource: {
    nodes: [
      {
        identifierRef: 'service110_Test_env_102',
        serviceRef: 'service110',
        serviceName: 'service110',
        environmentRef: 'Test_env_200',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0
      },
      {
        identifierRef: 'Test_Service_103_Test_env_200',
        serviceRef: 'Test_Service_200',
        serviceName: 'Test_Service_200',
        environmentRef: 'Test_env_200',
        riskScore: -1,
        riskLevel: RiskValues.NO_ANALYSIS,
        anomalousMetricsCount: 0,
        anomalousLogsCount: 0,
        changeCount: 0
      }
    ],
    edges: [
      {
        from: 'service110_Test_env_102',
        to: 'Test_Service_104_Test_env_102'
      }
    ]
  },
  responseMessages: []
}

export const mockedDependenciesResults = {
  data: [
    {
      from: 'service110_Test_env_102',
      to: 'Test_Service_104_Test_env_102'
    }
  ],
  nodes: [
    {
      icon: 'dependency-default-icon',
      id: 'service110_Test_env_102',
      name: 'service110',
      status: RiskValues.NO_ANALYSIS
    },
    {
      icon: 'dependency-default-icon',
      id: 'Test_Service_103_Test_env_200',
      name: 'Test_Service_200',
      status: RiskValues.NO_ANALYSIS
    }
  ]
}
