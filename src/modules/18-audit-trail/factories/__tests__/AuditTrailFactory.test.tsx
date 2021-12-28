import type { ResourceDTO, ResourceScopeDTO } from 'services/audit'
import AuditTrailFactory from '../AuditTrailFactory'

describe('Audit trail factory tests', () => {
  AuditTrailFactory.registerResourceHandler('CONNECTOR', {
    moduleIcon: { name: 'nav-settings' },
    resourceUrl: (_resource: ResourceDTO, _resourceScopeDTO: ResourceScopeDTO) => {
      return 'dummy_url'
    }
  })

  test('test with registered resource', () => {
    const handler = AuditTrailFactory.getResourceHandler('CONNECTOR')
    expect(handler?.moduleIcon.name).toBe('nav-settings')
    expect(
      handler?.resourceUrl?.(
        { identifier: 'test_connector_id', type: 'CONNECTOR' },
        { orgIdentifier: 'orgIdentifier', accountIdentifier: 'accountIdentifier' }
      )
    ).toBe('dummy_url')
  })

  test('test without registered resource', () => {
    const handler = AuditTrailFactory.getResourceHandler('SECRET')
    expect(handler).toBeUndefined()
  })
})
