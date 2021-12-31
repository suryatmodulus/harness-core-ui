import routes from '@common/RouteDefinitions'
import type { TestWrapperProps } from '@common/utils/testUtils'
import { projectPathProps } from '@common/utils/routeUtils'
import { cvModuleParams } from '@cv/RouteDestinations'
import { editParams } from '@cv/utils/routeUtils'
import type {
  RestResponseServiceLevelObjectiveResponse,
  ResponsePageUserJourneyResponse,
  ResponseListMonitoredServiceWithHealthSources,
  RestResponseListMetricDTO
} from 'services/cv'
import {
  Comparators,
  PeriodTypes,
  SLIEventTypes,
  SLIMetricTypes,
  SLIMissingDataTypes,
  SLITypes,
  SLOForm
} from '../CVCreateSLO.types'
import { createSLORequestPayload } from '../CVCreateSLO.utils'

export const errorMessage = 'TEST ERROR MESSAGE'

export const pathParams = {
  accountId: 'account_id',
  projectIdentifier: 'project_identifier',
  orgIdentifier: 'org_identifier',
  module: 'cv'
}

export const testWrapperProps: TestWrapperProps = {
  path: routes.toCVCreateSLOs({ ...projectPathProps, ...cvModuleParams }),
  pathParams
}

export const testWrapperPropsForEdit: TestWrapperProps = {
  path: routes.toCVEditSLOs({ ...projectPathProps, ...cvModuleParams, ...editParams }),
  pathParams: { ...pathParams, identifier: 'SLO5' }
}

export const serviceLevelObjective: SLOForm = {
  name: 'SLO-5-updated',
  identifier: 'SLO5',
  description: 'description added',
  tags: {},
  userJourneyRef: 'journey2',
  monitoredServiceRef: 'test1_env1',
  healthSourceRef: 'Test_gcp',
  SLIType: SLITypes.LATENCY,
  SLIMetricType: SLIMetricTypes.RATIO,
  eventType: SLIEventTypes.GOOD,
  validRequestMetric: 'metric1',
  goodRequestMetric: 'metric2',
  objectiveValue: 10,
  objectiveComparator: Comparators.LESS,
  SLIMissingDataType: SLIMissingDataTypes.GOOD,
  periodType: PeriodTypes.ROLLING,
  periodLength: '30',
  periodLengthType: undefined,
  dayOfWeek: undefined,
  dayOfMonth: undefined,
  SLOTargetPercentage: 0
}

export const SLOResponse: RestResponseServiceLevelObjectiveResponse = {
  resource: {
    serviceLevelObjective: createSLORequestPayload(
      serviceLevelObjective,
      pathParams.orgIdentifier,
      pathParams.projectIdentifier
    )
  }
}

export const initialFormData: SLOForm = {
  name: '',
  identifier: '',
  userJourneyRef: '',
  monitoredServiceRef: '',
  healthSourceRef: '',
  SLIType: SLITypes.LATENCY,
  SLIMetricType: SLIMetricTypes.RATIO,
  validRequestMetric: '',
  SLIMissingDataType: SLIMissingDataTypes.GOOD,
  periodType: PeriodTypes.ROLLING,
  SLOTargetPercentage: 99
}

export const userJourneyResponse: ResponsePageUserJourneyResponse = {
  data: {
    content: [
      {
        userJourney: {
          name: 'User Journey 1',
          identifier: 'User_Journey_1'
        }
      }
    ]
  }
}

export const monitoredServiceWithHealthSourcesResponse: ResponseListMonitoredServiceWithHealthSources = {
  data: [
    {
      name: 'Service_1_Environment_1',
      identifier: 'Service_1_Environment_1',
      healthSources: [{ name: 'Health Source 1', identifier: 'Health_source_1' }]
    }
  ]
}

export const listMetricDTOResponse: RestResponseListMetricDTO = {
  resource: [{ metricName: 'Metric 1', identifier: 'Metric_1' }]
}
