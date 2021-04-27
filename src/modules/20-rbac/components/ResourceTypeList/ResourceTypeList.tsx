import React from 'react'
import { Icon, Card, Layout, Text, Color } from '@wings-software/uicore'
import { Checkbox } from '@blueprintjs/core'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import css from './ResourceTypeList.module.scss'

interface ResourceTypeListProps {
  resourceCategoryMap?: Map<ResourceType | ResourceCategory, ResourceType[] | undefined>
  onResourceSelectionChange: (resource: ResourceType, isAdd: boolean) => void
  onResourceCategorySelect: (types: ResourceType[], isAdd: boolean) => void
  preSelectedResourceList: ResourceType[]
  disableAddingResources?: boolean
}
const ResourceTypeList: React.FC<ResourceTypeListProps> = props => {
  const {
    resourceCategoryMap,
    onResourceSelectionChange,
    onResourceCategorySelect,
    preSelectedResourceList,
    disableAddingResources
  } = props

  const getChecked = (resourceCategory: ResourceType | ResourceCategory, resourceTypes?: ResourceType[]): boolean => {
    if (resourceTypes) {
      return Array.from(resourceTypes).every(value => preSelectedResourceList.includes(value))
    } else {
      return preSelectedResourceList.includes(resourceCategory as ResourceType)
    }
  }

  return (
    <Layout.Vertical flex spacing="small">
      {resourceCategoryMap?.keys() &&
        Array.from(resourceCategoryMap.keys()).map(resourceCategory => {
          const resourceCategoryHandler =
            RbacFactory.getResourceCategoryHandler(resourceCategory as ResourceCategory) ||
            RbacFactory.getResourceTypeHandler(resourceCategory as ResourceType)
          const resourceTypes = resourceCategoryMap.get(resourceCategory)
          return (
            resourceCategoryHandler && (
              <>
                <Card
                  className={css.resourceTypeCard}
                  key={resourceCategory}
                  draggable={!disableAddingResources}
                  onDragStart={e => {
                    e.dataTransfer.setData('text/plain', resourceCategory)
                    e.dataTransfer.dropEffect = 'copy'
                  }}
                >
                  <Layout.Vertical>
                    <Layout.Horizontal>
                      <Checkbox
                        data-testid={`CHECK-BOX-${resourceCategory}`}
                        key={resourceCategory}
                        disabled={disableAddingResources}
                        onChange={e => {
                          if (resourceTypes) onResourceCategorySelect(resourceTypes, e.currentTarget.checked)
                          else onResourceSelectionChange(resourceCategory as ResourceType, e.currentTarget.checked)
                        }}
                        value={resourceCategory}
                        checked={getChecked(resourceCategory, resourceTypes)}
                      />
                      <Layout.Horizontal spacing="small">
                        <Icon name={resourceCategoryHandler.icon} />
                        <Text color={Color.BLACK}>{resourceCategoryHandler.label}</Text>
                      </Layout.Horizontal>
                    </Layout.Horizontal>
                    {resourceTypes &&
                      Array.from(resourceTypes).map(resource => {
                        const resourceHandler = RbacFactory.getResourceTypeHandler(resource)
                        return (
                          resourceHandler && (
                            <Layout.Horizontal className={css.resourceSubList}>
                              <Checkbox
                                data-testid={`CHECK-BOX-${resource}`}
                                disabled={disableAddingResources}
                                onChange={e => {
                                  onResourceSelectionChange(resource, e.currentTarget.checked)
                                }}
                                checked={getChecked(resource)}
                              />
                              <Text color={Color.BLACK}>{resourceHandler.label}</Text>
                            </Layout.Horizontal>
                          )
                        )
                      })}
                  </Layout.Vertical>
                </Card>
              </>
            )
          )
        })}
    </Layout.Vertical>
  )
}
export default ResourceTypeList
