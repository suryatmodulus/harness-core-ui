import { isEmpty as _isEmpty } from 'lodash-es'
import type { GatewayDetails, Provider } from '@ce/components/COCreateGateway/models'
import type { CcmMetaData } from 'services/ce/services'
import type { HealthCheck, PortConfig, Service, ServiceDep, YamlDependency } from 'services/lw'

export class Utils {
  static booleanToString(val: boolean): string {
    return val ? 'yes' : 'no'
  }

  static getTargetGroupObject(port: number, protocol: string): PortConfig {
    return {
      port,
      target_port: port, // eslint-disable-line
      action: 'forward',
      protocol: protocol.toLowerCase(),
      target_protocol: protocol.toLowerCase(), // eslint-disable-line
      redirect_url: '', // eslint-disable-line
      routing_rules: [], // eslint-disable-line
      server_name: '' // eslint-disable-line
    }
  }

  static isNumber(val: any): boolean {
    return !isNaN(val)
  }

  static isProviderAws = (provider: Provider): boolean => provider.value === 'aws'

  static isProviderAzure = (provider: Provider): boolean => provider.value === 'azure'

  static randomString(): string {
    return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8)
  }

  static getDefaultRuleHealthCheck = (): HealthCheck => ({
    protocol: 'http',
    path: '/',
    port: 80,
    timeout: 30
  })

  static toBase64 = (file: any): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve((reader.result || '').toString().replace(/^data:(.*,)?/, '') as string)
      reader.onerror = error => reject(error)
    })

  static getHyphenSpacedString = (str: string) => (str || '').trim().split(' ').join('-')

  static hyphenatedToSpacedString = (str: string) => (str || '').trim().split('-').join(' ')

  static isK8sRule = (details: GatewayDetails) =>
    !_isEmpty(details.routing.k8s?.RuleJson || details.metadata.kubernetes_connector_id)

  static accountHasConnectors = (data: CcmMetaData): boolean => {
    return (
      data.awsConnectorsPresent ||
      data.azureConnectorsPresent ||
      data.gcpConnectorsPresent ||
      data.k8sClusterConnectorPresent
    )
  }

  static isFFEnabledForResource = (
    flags: string[] | undefined,
    featureFlagsMap: Record<string, boolean | undefined>
  ) => {
    let enableStatus = true
    if (!flags || _isEmpty(flags)) {
      return enableStatus
    }
    flags.forEach(_flag => {
      if (!featureFlagsMap[_flag]) {
        enableStatus = false
      }
    })
    return enableStatus
  }

  static fromServiceToYamlDependencies = (services: Service[] = [], dep: ServiceDep[] = []): YamlDependency[] => {
    return dep.map(_d => ({
      selector: {
        ruleName: services.find(_s => _s.id === _d.dep_id)?.name as string
      },
      wait: _d.delay_secs
    }))
  }

  static fromYamlToServiceDependencies = (services: Service[] = [], dep: YamlDependency[] = []): ServiceDep[] => {
    return dep.map(_d => ({
      delay_secs: _d.wait,
      dep_id: services.find(_s => _s.name === _d.selector.ruleName)?.id
    }))
  }
}
