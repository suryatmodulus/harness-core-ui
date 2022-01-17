/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
