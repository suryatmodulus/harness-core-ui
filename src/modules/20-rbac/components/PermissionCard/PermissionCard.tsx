import React from 'react'
import cx from 'classnames'
import { Card, Icon, Layout, Text, Color } from '@wings-software/uicore'
import { Checkbox } from '@blueprintjs/core'
import type { Permission } from 'services/rbac'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from './PermissionCard.module.scss'

interface PermissionCardProps {
  resourceTypes?: ResourceType[]
  resourceCategory: ResourceType | ResourceCategory
  permissionMap: Map<ResourceType, Permission[]>
  selected?: boolean
  isDefault?: boolean
  onChangePermission: (permission: string, isAdd: boolean) => void
  isPermissionEnabled: (_permission: string) => boolean
}

const PermissionCard: React.FC<PermissionCardProps> = ({
  resourceCategory,
  resourceTypes,
  selected,
  isDefault,
  permissionMap,
  onChangePermission,
  isPermissionEnabled
}) => {
  const getPermissionList = (resource: ResourceType): JSX.Element => {
    const handler = RbacFactory.getResourceTypeHandler(resource)
    return (
      <div className={css.permissionList}>
        {permissionMap.get(resource)?.map(permission => {
          return (
            <Checkbox
              labelElement={
                handler?.permissionLabels?.[permission.identifier as PermissionIdentifier] || permission.action
              }
              data-testid={`checkBox-${resource}-${permission.action}`}
              key={permission.name}
              disabled={isDefault}
              defaultChecked={isPermissionEnabled(permission.identifier)}
              onChange={(event: React.FormEvent<HTMLInputElement>) => {
                onChangePermission(permission.identifier, event.currentTarget.checked)
              }}
              className={css.checkbox}
            />
          )
        })}
      </div>
    )
  }
  const resourceHandler =
    RbacFactory.getResourceCategoryHandler(resourceCategory as ResourceCategory) ||
    RbacFactory.getResourceTypeHandler(resourceCategory as ResourceType)
  return resourceHandler ? (
    <Card className={cx(css.card, { [css.selectedCard]: selected })}>
      <Layout.Vertical padding="small" width="100%">
        <Layout.Horizontal width="100%" className={css.permissionRow}>
          <Layout.Horizontal spacing="medium" className={css.center}>
            <Icon name={resourceHandler.icon} size={30} />
            <Text color={Color.BLACK} font={{ weight: 'semi-bold' }}>
              {resourceHandler.label}
            </Text>
          </Layout.Horizontal>
          {resourceTypes && Array.from(resourceTypes).length
            ? null
            : getPermissionList(resourceCategory as ResourceType)}
        </Layout.Horizontal>
        {resourceTypes && Array.from(resourceTypes).length ? (
          <Layout.Vertical padding={{ top: 'large' }}>
            {Array.from(resourceTypes).map(resource => {
              const handler = RbacFactory.getResourceTypeHandler(resource)
              return (
                handler && (
                  <div key={resource} className={cx(css.permissionRow, css.groupRow)}>
                    <Text color={Color.BLACK} padding={{ left: 'large' }}>
                      {handler.label}
                    </Text>
                    {getPermissionList(resource)}
                  </div>
                )
              )
            })}
          </Layout.Vertical>
        ) : null}
      </Layout.Vertical>
    </Card>
  ) : null
}

export default PermissionCard
