import { cloneDeep } from 'lodash-es'
import { updateMonitoredServiceDTOOnTypeChange } from '../Service.utils'
import { MockMonitoredServiceDTO } from './Service.mock'

describe('Unit tests for Servicee utils', () => {
  test('Ensure updateMonitoredServiceDTOOnTypeChange works as expected', () => {
    const clonedObj = cloneDeep(MockMonitoredServiceDTO)
    clonedObj.sources?.changeSources?.push({
      category: 'Deployment',
      enabled: true,
      identifier: '1234_iden',
      name: 'deployment',
      spec: {},
      type: 'HarnessCDNextGen'
    })

    // for infra expect deployment to be removed
    expect(updateMonitoredServiceDTOOnTypeChange('Infrastructure', clonedObj)).toEqual({
      dependencies: [],
      environmentRef: '1234_env',
      identifier: '1234_ident',
      name: 'solo-dolo',
      serviceRef: '1234_serviceRef',
      sources: {
        changeSources: [
          {
            category: 'Infrastructure',
            enabled: true,
            identifier: '343_iden',
            name: 'k8',
            spec: {},
            type: 'K8sCluster'
          },
          {
            category: 'Alert',
            enabled: true,
            identifier: '343_iden',
            name: 'pager',
            spec: {},
            type: 'PagerDuty'
          }
        ]
      },
      tags: {},
      type: 'Infrastructure'
    })

    // for application expect k8s to be removed
    expect(updateMonitoredServiceDTOOnTypeChange('Application', cloneDeep(MockMonitoredServiceDTO))).toEqual({
      dependencies: [],
      environmentRef: '1234_env',
      identifier: '1234_ident',
      name: 'solo-dolo',
      serviceRef: '1234_serviceRef',
      sources: {
        changeSources: [
          {
            category: 'Deployment',
            enabled: true,
            identifier: '1234_iden',
            name: 'deployment',
            spec: {},
            type: 'HarnessCD'
          },
          {
            category: 'Alert',
            enabled: true,
            identifier: '343_iden',
            name: 'pager',
            spec: {},
            type: 'PagerDuty'
          }
        ]
      },
      tags: {},
      type: 'Application'
    })
  })
})
