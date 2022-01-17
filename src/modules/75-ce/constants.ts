/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getConfig } from 'services/config'
import type { Provider } from './components/COCreateGateway/models'

export const allProviders: Provider[] = [
  {
    name: 'AWS',
    value: 'aws',
    icon: 'service-aws'
  },
  {
    name: 'Azure',
    value: 'azure',
    icon: 'service-azure'
  }
  // {
  //   name: 'Digital Ocean',
  //   value: 'do',
  //   icon: 'harness'
  // }
]

export enum PAGE_NAME {
  PERSPECTIVE_EXPLORER,
  CREATE_PERSPECTIVE
}

export enum PROVIDER_TYPES {
  AWS = 'aws',
  AZURE = 'azure',
  DIGITAL_OCEAN = 'do'
}

type GetGraphQLAPIConfigReturnType = {
  path: string
  queryParams: {
    accountIdentifier: string
  }
}

export const getGraphQLAPIConfig: (accountId: string) => GetGraphQLAPIConfigReturnType = (accountId: string) => {
  return {
    path: getConfig('ccm/api/graphql'),
    queryParams: {
      accountIdentifier: accountId
    }
  }
}
export const VALID_DOMAIN_REGEX =
  /((https?):\/\/)?(www.)?[a-z0-9-]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#-]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/

export enum ASRuleTabs {
  CONFIGURATION = 'configuration',
  SETUP_ACCESS = 'setupAccess',
  REVIEW = 'review'
}

export const ConnectorStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export enum GatewayKindType {
  INSTANCE = 'instance',
  KUBERNETES = 'k8s',
  DATABASE = 'database',
  CONTAINERS = 'containers'
}

export enum CCM_CHART_TYPES {
  COLUMN = 'column',
  AREA = 'area',
  LINE = 'line'
}

export const portProtocolMap: { [key: number]: string } = {
  80: 'http',
  443: 'https'
}

export const DEFAULT_ACCESS_DETAILS = {
  dnsLink: { selected: false },
  ssh: { selected: false },
  rdp: { selected: false },
  backgroundTasks: { selected: false },
  ipaddress: { selected: false }
}

export const providerLoadBalancerRefMap: Record<string, string> = {
  azure: 'Application Gateway',
  aws: 'Load Balancer'
}

export const CONFIG_STEP_IDS = ['configStep1', 'configStep2', 'configStep3', 'configStep4']

export const CONFIG_IDLE_TIME_CONSTRAINTS = {
  MIN: 5,
  MAX: 480
}

export enum RESOURCES {
  INSTANCES = 'INSTANCES',
  ASG = 'ASG',
  KUBERNETES = 'KUBERNETES',
  ECS = 'ECS',
  RDS = 'RDS'
}

export const CONFIG_TOTAL_STEP_COUNTS = {
  DEFAULT: 4,
  MODIFIED: 3
}

export enum DaysOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

export enum AS_RESOURCE_TYPE {
  rule = 'autostop_rule'
}

export const ENFORCEMENT_USAGE_THRESHOLD = 90
