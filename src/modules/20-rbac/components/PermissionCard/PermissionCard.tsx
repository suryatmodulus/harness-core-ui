import React from 'react'
import cx from 'classnames'
import { Card, Icon, Layout, Text, Color, Checkbox } from '@wings-software/uicore'
import type { Permission } from 'services/rbac'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import css from './PermissionCard.module.scss'

interface PermissionCardProps {
  resourceTypes?: ResourceType[]
  resourceCategory: ResourceType | ResourceCategory
  permissionMap: Map<ResourceType, Permission[]>
  selected?: boolean
  disableEdit?: boolean
  onChangePermission: (permission: string, isAdd: boolean) => void
  isPermissionEnabled: (_permission: string) => boolean
}

const PermissionCard: React.FC<PermissionCardProps> = ({
  resourceCategory,
  resourceTypes,
  selected,
  disableEdit,
  permissionMap,
  onChangePermission,
  isPermissionEnabled
}) => {
  const { getString } = useStrings()
  const isView = (value: string): boolean => {
    if (value === 'view') return true
    return false
  }
  const isDashboardResource = (value: string): boolean => {
    if (value === 'DASHBOARDS') return true
    return false
  }
  const getPermissionList = (resource: ResourceType): JSX.Element | undefined => {
    const handler = RbacFactory.getResourceTypeHandler(resource)
    if (handler && handler.permissionLabels) {
      const permissions = Object.keys(handler.permissionLabels)
      const permissionArray = permissionMap.get(resource)
      const sortedList = permissions
        .map(permission => {
          const item = permissionArray?.find(_permission => _permission['identifier'] === permission)
          if (item) return item
        })
        .filter(item => item)

      return (
        <div className={css.permissionList}>
          {sortedList.map(permission => {
            if (permission)
              return (
                <Checkbox
                  labelElement={
                    handler.permissionLabels?.[permission.identifier as PermissionIdentifier] || permission.action
                  }
                  data-testid={`checkBox-${resource}-${permission.action}`}
                  key={permission.name}
                  disabled={
                    disableEdit || (isView(permission.action) && !isDashboardResource(permission?.resourceType))
                  }
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
              {getString(resourceHandler.label)}
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
                      {getString(handler.label)}
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
