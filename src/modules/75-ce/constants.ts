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
  KUBERNETES = 'k8s'
}

export enum CCM_CHART_TYPES {
  COLUMN = 'column',
  AREA = 'area',
  LINE = 'line'
}
