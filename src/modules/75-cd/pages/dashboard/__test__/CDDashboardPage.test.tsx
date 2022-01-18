/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import CDDashboardPage from '../CDDashboardPage'

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useRouteParams: () => ({
    params: {
      projectIdentifier: 'test'
    }
  })
}))

jest.mock('react-timeago', () => () => 'dummy date')

const deploymentExecutionMock = {
  data: {
    executionDeploymentList: [
      {
        date: 1621125462238,
        deployments: {
          total: 0,
          success: 0,
          failure: 0
        }
      },
      {
        date: 1621125462238,
        deployments: {
          total: 0,
          success: 0,
          failure: 0
        }
      },
      {
        date: 1621125462238,
        deployments: {
          total: 0,
          success: 0,
          failure: 0
        }
      }
    ]
  }
}

const deploymentHealthMock = {
  data: {
    healthDeploymentInfo: {
      total: {
        count: 19,
        production: 5,
        nonProduction: 2,
        countList: [
          {
            time: 1621125462238,
            deployments: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 6
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 11
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 2
            }
          }
        ]
      },
      success: {
        count: 8,
        rate: 700.0,
        countList: [
          {
            time: 1621125462238,
            deployments: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 6
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 2
            }
          }
        ]
      },
      failure: {
        count: 1,
        rate: 0.0,
        countList: [
          {
            time: 1621125462238,
            deployments: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 1
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            deployments: {
              count: 0
            }
          }
        ]
      }
    }
  }
}

const deploymentsMock = {
  data: {
    failure: [
      {
        name: 'twoStagetwoSer',
        startTs: 1621039062238,
        endTs: 1621125462238,
        status: 'FAILED',
        serviceInfoList: [
          {
            serviceName: 'service2',
            serviceTag: null
          },
          {
            serviceName: 'service1',
            serviceTag: null
          }
        ]
      }
    ],
    pending: [
      {
        name: 'p1',
        startTs: 1621039062238,
        endTs: 1621125462238,
        status: 'PENDING',
        serviceInfoList: [
          {
            serviceName: 'service1',
            serviceTag: null
          },
          {
            serviceName: 'service1',
            serviceTag: null
          }
        ]
      }
    ],
    active: [
      {
        name: 'RunningPipeline',
        startTs: 1621039062238,
        endTs: 1621125462238,
        status: 'RUNNING',
        serviceInfoList: [
          {
            serviceName: 'service1',
            serviceTag: null
          },
          {
            serviceName: 'service1',
            serviceTag: null
          }
        ]
      }
    ]
  }
}

const workloadsMock = {
  data: {
    workloadDeploymentInfoList: [
      {
        name: 'springboot',
        buildCount: 7,
        percentSuccess: 0.0,
        successRate: -100.0,
        lastCommit: 'Update test.txt',
        lastExecuted: {
          startTime: 1621555606947,
          endTime: 1621556205569
        },
        countList: [
          {
            time: 1621125462238,
            builds: {
              count: 3
            }
          },
          {
            time: 1621125462238,
            builds: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            builds: {
              count: 1
            }
          },
          {
            time: 1621125462238,
            builds: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            builds: {
              count: 0
            }
          },
          {
            time: 1621125462238,
            builds: {
              count: 3
            }
          },
          {
            time: 1621125462238,
            builds: {
              count: 0
            }
          }
        ]
      }
    ]
  }
}

jest.mock('services/cd-ng', () => ({
  useGetDeployments: () => ({
    loading: false,
    data: {
      data: deploymentsMock
    }
  }),
  useGetDeploymentHealth: () => ({
    loading: false,
    data: deploymentHealthMock
  }),
  useGetDeploymentExecution: () => ({
    loading: false,
    data: deploymentExecutionMock
  }),
  useGetWorkloads: () => ({
    loading: false,
    data: workloadsMock
  })
}))

jest.mock('highcharts-react-official', () => () => <div />)
const RealDate = Date.now

describe('CDDashboardPage snapshot test', () => {
  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date('2021-04-22T10:20:30Z').getTime())
  })

  afterAll(() => {
    global.Date.now = RealDate
  })
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <CDDashboardPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
