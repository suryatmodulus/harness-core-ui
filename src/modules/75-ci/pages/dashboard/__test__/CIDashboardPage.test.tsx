import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import CIDashboardPage from '../CIDashboardPage'

jest.mock('framework/exports', () => ({
  ...(jest.requireActual('framework/exports') as any),
  useRouteParams: () => ({
    params: {
      projectIdentifier: 'test'
    }
  })
}))

const buildExecutionMock = {
  data: {
    buildExecutionInfoList: [
      {
        time: '2020-01-19',
        builds: {
          total: 0,
          success: 0,
          failed: 0
        }
      },
      {
        time: '2020-01-20',
        builds: {
          total: 0,
          success: 0,
          failed: 0
        }
      },
      {
        time: '2020-01-21',
        builds: {
          total: 0,
          success: 0,
          failed: 0
        }
      }
    ]
  }
}

const buildHealthMock = {
  data: {
    builds: {
      total: {
        count: 7,
        rate: -22.22222222222222
      },
      success: {
        count: 3,
        rate: 10
      },
      failed: {
        count: 2,
        rate: 0.0
      }
    }
  }
}

jest.mock('services/ci', () => ({
  useGetBuilds: () => ({
    loading: false,
    data: {
      data: {
        failed: [
          {
            piplineName: 'Go Demo2',
            branch: 'main',
            commit: 'Update test.txt',
            commitID: '673c37fbd3d9d903b7bc1fcf5e700b8ab73f0ae3',
            startTs: '2020-12-23 18:29:30.123',
            endTs: '2020-12-24 18:29:30.123'
          },
          {
            piplineName: 'Go Demo2',
            branch: 'main',
            commit: 'Update test.txt',
            commitID: '673c37fbd3d9d903b7bc1fcf5e700b8ab73f0ae3',
            startTs: '2020-10-31 18:29:27.123',
            endTs: '2020-11-01 18:29:27.123'
          }
        ],
        active: [
          {
            piplineName: 'Go Demo2',
            branch: 'main',
            commit: 'Update test.txt',
            commitID: '673c37fbd3d9d903b7bc1fcf5e700b8ab73f0ae3',
            startTs: '2021-03-26 18:29:09.123',
            status: 'RUNNING',
            endTs: '2021-04-14 20:24:53.044'
          }
        ]
      }
    }
  }),
  useGetBuildHealth: () => ({
    loading: false,
    data: buildHealthMock
  }),
  useGetBuildExecution: () => ({
    loading: false,
    data: buildExecutionMock
  }),
  useGetRepositoryBuild: () => ({
    loading: false,
    data: {
      data: {
        repositoryInfo: [
          {
            name: 'springboot',
            buildCount: 7,
            percentSuccess: 0.0,
            successRate: -100.0,
            lastCommit: 'Update test.txt',
            countList: [
              {
                time: '2021-04-16',
                builds: {
                  count: 3
                }
              },
              {
                time: '2021-04-17',
                builds: {
                  count: 0
                }
              },
              {
                time: '2021-04-18',
                builds: {
                  count: 1
                }
              },
              {
                time: '2021-04-19',
                builds: {
                  count: 0
                }
              },
              {
                time: '2021-04-20',
                builds: {
                  count: 0
                }
              },
              {
                time: '2021-04-21',
                builds: {
                  count: 3
                }
              },
              {
                time: '2021-04-22',
                builds: {
                  count: 0
                }
              }
            ],
            time: '2021-04-21 17:03:39.123'
          }
        ]
      }
    }
  })
}))

jest.mock('highcharts-react-official', () => () => <div />)

describe('CIDashboardPage snapshot test', () => {
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <CIDashboardPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
