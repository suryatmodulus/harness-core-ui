import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { ResourceType } from '@common/interfaces/ResourceInterface'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { getResourceTypeHandlerMock } from '@rbac/utils/RbacFactoryMockData'

jest.mock('@rbac/factories/RbacFactory', () => ({
  getResourceTypeHandler: jest.fn().mockImplementation(resource => getResourceTypeHandlerMock(resource))
}))

describe('RBACTooltip', () => {
  test('RBACTooltip component', () => {
    const { container } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <RBACTooltip permission={PermissionIdentifier.CREATE_PROJECT} resourceType={ResourceType.PROJECT} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  }),
    test('RBACTooltip component - Org scope', () => {
      const { container } = render(
        <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
          <RBACTooltip
            permission={PermissionIdentifier.CREATE_ORG}
            resourceType={ResourceType.ORGANIZATION}
            resourceScope={{
              orgIdentifier: 'organization_123'
            }}
          />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    }),
    test('RBACTooltip component - Project scope', () => {
      const { container } = render(
        <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
          <RBACTooltip
            permission={PermissionIdentifier.CREATE_PROJECT}
            resourceType={ResourceType.PROJECT}
            resourceScope={{
              projectIdentifier: 'project_123'
            }}
          />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
})
