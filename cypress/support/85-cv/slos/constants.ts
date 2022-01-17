const projectIdentifier = 'project1'
const orgIdentifier = 'default'
const healthSource = 'appd_cvng_prod'
const accountId = 'accountId'

export const getUserJourneysCall = `/cv/api/user-journey?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&offset=0&pageSize=100`
export const listSLOsCall = `/cv/api/slo-dashboard/widgets?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}&pageNumber=0&pageSize=4`
export const listMonitoredServices = `/cv/api/monitored-service/all/time-series-health-sources?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`
export const getSLOMetrics = `/cv/api/monitored-service/cvng_prod/health-source/${healthSource}/slo-metrics?routingId=${accountId}&accountId=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectIdentifier}`

export const listSLOsCallResponse = {
  status: 'SUCCESS',
  data: { totalPages: 0, totalItems: 0, pageItemCount: 0, pageSize: 4, content: [], pageIndex: 0, empty: false },
  metaData: null,
  correlationId: '6a558a73-53e9-4b5a-9700-cbfcd64e87ad'
}

export const listUserJourneysCallResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 100,
    content: [
      {
        createdAt: 1641461279691,
        lastModifiedAt: 1641461279691,
        userJourney: { identifier: 'newone', name: 'new-one' }
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '241de3a2-d84a-48fa-8e7b-06d7217e489d'
}

export const listMonitoredServicesCallResponse = {
  status: 'SUCCESS',
  data: [
    {
      identifier: 'cvng_prod',
      name: 'cvng_prod',
      healthSources: [
        { name: 'appd_manager', identifier: 'appd_manager' },
        { name: 'appd_cvng_prod', identifier: 'appd_cvng_prod' },
        { name: 'New Relic Health source', identifier: 'New_Relic_Health_source' }
      ]
    }
  ],
  metaData: null,
  correlationId: 'fe6686a2-cd9e-45e1-bca4-2cc86285eb82'
}

export const listSLOMetricsCallResponse = {
  metaData: {},
  resource: [
    { identifier: 'number_of_slow_calls', metricName: 'number_of_slow_calls' },
    { identifier: 'https_errors_per_min', metricName: 'https_errors_per_min' }
  ],
  responseMessages: []
}

export const updatedListSLOsCallResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 1,
    pageItemCount: 1,
    pageSize: 4,
    content: [
      {
        sloIdentifier: 'SLO1',
        title: 'SLO-1',
        monitoredServiceIdentifier: 'cvng_prod',
        monitoredServiceName: 'cvng_prod',
        healthSourceIdentifier: 'appd_cvng_prod',
        healthSourceName: 'appd_cvng_prod',
        serviceIdentifier: 'cvng',
        environmentIdentifier: 'prod',
        environmentName: 'prod',
        serviceName: 'cvng',
        tags: {},
        type: 'Latency',
        burnRate: {
          currentRatePercentage: 138.44167025398193
        },
        timeRemainingDays: 0,
        errorBudgetRemainingPercentage: -32.67326732673267,
        errorBudgetRemaining: -33,
        totalErrorBudget: 101,
        sloTargetType: 'Rolling',
        currentPeriodLengthDays: 7,
        currentPeriodStartTime: 1640864583676,
        currentPeriodEndTime: 1641469383676,
        sloTargetPercentage: 99,
        errorBudgetBurndown: [],
        sloPerformanceTrend: [],
        errorBudgetRisk: 'EXHAUSTED',
        recalculatingSLI: false
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '95d58b07-33b2-4501-8d6c-71bfd140bba1'
}
