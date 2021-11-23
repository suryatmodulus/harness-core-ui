import type { RestResponseServiceDependencyGraphDTO, CountServiceDTO } from 'services/cv'
import routes from '@common/RouteDefinitions'
import { projectPathProps } from '@common/utils/routeUtils'
import type { TestWrapperProps } from '@common/utils/testUtils'
import { RiskValues } from '@cv/utils/CommonUtils'
import type { ServicePoint } from '../ServiceDependencyGraph.types'

export const errorMessage = 'TEST ERROR MESSAGE'

export const pathParams = {
  accountId: 'account_id',
  projectIdentifier: 'project_identifier',
  orgIdentifier: 'org_identifier'
}

export const testWrapperProps: TestWrapperProps = {
  path: routes.toCVMonitoringServices({ ...projectPathProps }),
  pathParams
}

export const serviceDependencyData: RestResponseServiceDependencyGraphDTO = {
  resource: {
    nodes: [
      {
        identifierRef: 'identifier_ref',
        serviceRef: 'service_ref',
        environmentRef: 'environment_ref',
        riskScore: 100,
        riskLevel: RiskValues.HEALTHY
      }
    ]
  }
}

export const serviceCountData: CountServiceDTO = {
  allServicesCount: 4,
  servicesAtRiskCount: 2
}

export const servicePoint: ServicePoint = {
  serviceRef: 'service_ref',
  environmentRef: 'environment_ref',
  destroySticky: jest.fn()
}
