# Audit trail

The Audit trail framework is built using the _registration_ pattern. Developers from each team will need to register their resources with the AuditTrailFactory.

Registration of **resources** requires the following details -

- **Icon** - Module icon to which the resource belongs.
- **resourceUrl** - Resource redirection url (For eg. Connector details page in case of connector)

Example of a resource registration:

```typescript
import AuditTrailFactory from '@audit-trail/factories/AuditTrailFactory'
import type { ResourceDTO, ResourceScopeDTO } from 'services/audit'
AuditTrailFactory.registerResourceHandler('CONNECTOR', {
  moduleIcon: {
    name: 'nav-settings',
    size: 30
  },
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScopeDTO) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope
    return routes.toConnectorDetails({
      orgIdentifier,
      accountId: accountIdentifier || accountPathProps.accountId,
      connectorId: resource.identifier,
      projectIdentifier
    })
  }
})
```
