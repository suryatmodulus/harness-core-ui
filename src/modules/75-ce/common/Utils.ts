import type { Provider } from '@ce/components/COCreateGateway/models'
import type { PortConfig } from 'services/lw'

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
}
