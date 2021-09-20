import React from 'react'
import { Card, Layout, Text, Color, Checkbox } from '@wings-software/uicore'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
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

  const { getString } = useStrings()

  const getChecked = (resourceCategory: ResourceType | ResourceCategory, resourceTypes?: ResourceType[]): boolean => {
    if (resourceTypes) {
      return Array.from(resourceTypes).every(value => preSelectedResourceList.includes(value))
    } else {
      return preSelectedResourceList.includes(resourceCategory as ResourceType)
    }
  }

  const getIntermittent = (resourceTypes: ResourceType[]): boolean =>
    Array.from(resourceTypes).some(value => preSelectedResourceList.includes(value))

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
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                    <Checkbox
                      data-testid={`CHECK-BOX-${resourceCategory}`}
                      key={resourceCategory}
                      disabled={disableAddingResources}
                      checked={getChecked(resourceCategory, resourceTypes)}
                      indeterminate={
                        resourceTypes
                          ? getIntermittent(resourceTypes) && !getChecked(resourceCategory, resourceTypes)
                          : undefined
                      }
                      className={css.checkBox}
                      onChange={e => {
                        if (resourceTypes) onResourceCategorySelect(resourceTypes, e.currentTarget.checked)
                        else onResourceSelectionChange(resourceCategory as ResourceType, e.currentTarget.checked)
                      }}
                      value={resourceCategory}
                    />

                    <Text
                      font={{ size: 'small', weight: 'semi-bold' }}
                      color={Color.GREY_600}
                      icon={resourceCategoryHandler.icon}
                      iconProps={{ padding: { right: 'small' } }}
                    >
                      {getString(resourceCategoryHandler.label).toUpperCase()}
                    </Text>
                  </Layout.Horizontal>
                  {resourceTypes &&
                    Array.from(resourceTypes).map(resource => {
                      const resourceHandler = RbacFactory.getResourceTypeHandler(resource)
                      return (
                        resourceHandler && (
                          <Layout.Horizontal
                            key={resource}
                            flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
                            className={css.resourceSubList}
                          >
                            <Checkbox
                              data-testid={`CHECK-BOX-${resource}`}
                              disabled={disableAddingResources}
                              onChange={e => {
                                onResourceSelectionChange(resource, e.currentTarget.checked)
                              }}
                              checked={getChecked(resource)}
                            />
                            <Text font="small" color={Color.GREY_800}>
                              {getString(resourceHandler.label)}
                            </Text>
                          </Layout.Horizontal>
                        )
                      )
                    })}
                </Layout.Vertical>
              </Card>
            )
          )
        })}
    </Layout.Vertical>
  )
}
export default ResourceTypeList
