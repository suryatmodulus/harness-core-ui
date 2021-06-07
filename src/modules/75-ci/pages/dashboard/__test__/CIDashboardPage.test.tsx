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
        time: 1621125462238,
        builds: {
          total: 0,
          success: 0,
          failed: 0
        }
      },
      {
        time: 1621125462238,
        builds: {
          total: 0,
          success: 0,
          failed: 0
        }
      },
      {
        time: 1621125462238,
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
            startTs: 1621125462238,
            endTs: 1621126062238
          },
          {
            piplineName: 'Go Demo2',
            branch: 'main',
            commit: 'Update test.txt',
            commitID: '673c37fbd3d9d903b7bc1fcf5e700b8ab73f0ae3',
            startTs: 1621125462238,
            endTs: 1621126062238
          }
        ],
        active: [
          {
            piplineName: 'Go Demo2',
            branch: 'main',
            commit: 'Update test.txt',
            commitID: '673c37fbd3d9d903b7bc1fcf5e700b8ab73f0ae3',
            startTs: 1621125462238,
            status: 'RUNNING',
            endTs: 1621126062238
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
            lastRepository: {
              commit: 'Update test.txt'
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
            ],
            time: 1621125462238
          }
        ]
      }
    }
  })
}))

jest.mock('highcharts-react-official', () => () => <div />)
const RealDate = Date.now

describe('CIDashboardPage snapshot test', () => {
  beforeAll(() => {
    global.Date.now = jest.fn(() => new Date('2021-04-22T10:20:30Z').getTime())
  })

  afterAll(() => {
    global.Date.now = RealDate
  })
  test('should render properly', async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={defaultAppStoreValues}>
        <CIDashboardPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
