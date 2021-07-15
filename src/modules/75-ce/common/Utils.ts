import type { Provider } from '@ce/components/COCreateGateway/models'
import type { HealthCheck, PortConfig } from 'services/lw'

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
}
