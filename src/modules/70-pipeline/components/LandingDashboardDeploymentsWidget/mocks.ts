import type { Error, Failure, ResponseExecutionResponseDeploymentsStatsOverview } from 'services/dashboard-service'

const generateMockData = (rows: number) => {
  const mockData = []
  for (let i = 0; i < rows; i++) {
    const successCount = 20 + Math.round(Math.random() * 50)
    mockData.push({
      time: 60,
      countWithSuccessFailureDetails: {
        count: 12,
        successCount: successCount,
        failureCount: 5 + Math.round(Math.random() * successCount) / 5,
        countChangeAndCountChangeRateInfo: {
          countChange: 2,
          countChangeRate: 5.0
        }
      }
    })
  }

  return mockData
}

export const deploymentStatsSummaryResponse: {
  data: ResponseExecutionResponseDeploymentsStatsOverview
  error: Error | Failure | undefined
  loading: boolean
} = {
  error: undefined,
  loading: false,
  data: {
    correlationId: '',
    data: {
      response: {
        deploymentsStatsSummary: {
          countAndChangeRate: {
            count: 10,
            countChangeAndCountChangeRateInfo: {
              countChange: 2,
              countChangeRate: 5.0
            }
          },
          // failureCountAndChangeRate: {
          //   count: 10,
          //   countChangeAndCountChangeRateInfo: {
          //     countChange: 2,
          //     countChangeRate: 5.0
          //   }
          // },
          failureRateAndChangeRate: {
            rate: 5.0,
            rateChangeRate: 2.0
          },
          deploymentRateAndChangeRate: {
            rate: 5.0,
            rateChangeRate: 2.0
          },
          // deploymentsOverview: {
          //   runningCount: 2,
          //   pendingApprovalsCount: 4,
          //   manualInterventionsCount: 1,
          //   failedCount: 10
          // },
          deploymentStats: generateMockData(30)
          // [
          //   ({
          //     time: 60,
          //     countWithSuccessFailureDetails: {
          //       count: 12,
          //       successCount: 10,
          //       failureCount: 2,
          //       countChangeAndCountChangeRateInfo: {
          //         countChange: 2,
          //         countChangeRate: 5.0
          //       }
          //     }
          //   },
          //   {
          //     time: 120,
          //     countWithSuccessFailureDetails: {
          //       count: 120,
          //       successCount: 100,
          //       failureCount: 20,
          //       countChangeAndCountChangeRateInfo: {
          //         countChange: 2,
          //         countChangeRate: 5.0
          //       }
          //     }
          //   })
          // ]
        },
        mostActiveServicesList: {
          activeServices: [
            {
              serviceInfo: {
                serviceName: 'Service_demo'
                //serviceInfo: 'Service demo info'
              },
              projectInfo: {
                projectIdentifier: 'ProjectDemo',
                projectName: 'Project_Demo'
              },
              orgInfo: {
                orgIdentifier: 'OrgIdentifier',
                orgName: 'Org_Demo'
              },
              accountInfo: {
                accountIdentifier: 'AccountIdentifier'
              },
              countWithSuccessFailureDetails: {
                count: 120,
                successCount: 100,
                failureCount: 20,
                countChangeAndCountChangeRateInfo: {
                  countChange: 2,
                  countChangeRate: 5.0
                }
              }
            }
          ]
        }
      },
      executionStatus: 'SUCCESS',
      executionMessage: 'Some message'
    }
  }
}
