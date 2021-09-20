import produce from 'immer'
import { RbacResourceGroupTypes } from '@rbac/constants/utils'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import { isDynamicResourceSelector } from '@rbac/utils/utils'
import type { ResourceSelector } from 'services/resourcegroups'

export const getSelectedResourcesMap = (
  resourceSelectorList?: ResourceSelector[]
): Map<ResourceType, string[] | string> => {
  const map: Map<ResourceType, string[] | string> = new Map()

  resourceSelectorList?.map(resourceSelector => {
    if (isDynamicResourceSelector(resourceSelector.type)) {
      map.set(resourceSelector.resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
    } else {
      map.set(resourceSelector.resourceType, resourceSelector.identifiers)
    }
  })

  return map
}

export const validateResourceSelectors = (value: ResourceSelector[]): ResourceType[] => {
  return value
    .filter(val => {
      if (!isDynamicResourceSelector(val.type)) {
        if (val.identifiers?.length < 1) {
          return true
        }
      }
      return false
    })
    .map(val => val.resourceType)
}

export const getResourceSelectorsfromMap = (map: Map<ResourceType, string[] | string>): ResourceSelector[] => {
  const resourceSelectors: ResourceSelector[] = []
  map.forEach((value, key) => {
    if (isDynamicResourceSelector(value)) {
      resourceSelectors.push({
        type: RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR,
        resourceType: key
      })
    } else {
      resourceSelectors.push({
        type: RbacResourceGroupTypes.STATIC_RESOURCE_SELECTOR,
        resourceType: key,
        identifiers: value
      })
    }
  })
  return resourceSelectors
}

export const computeResourceMapOnChange = (
  setSelectedResourceMap: (value: React.SetStateAction<Map<ResourceType, string | string[]>>) => void,
  selectedResourcesMap: Map<ResourceType, string | string[]>,
  resourceType: ResourceType,
  isAdd: boolean,
  identifiers?: string[]
): void => {
  if (identifiers) {
    if (isAdd) {
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          draft.set(resourceType, identifiers)
        })
      )
    } else {
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          if (Array.isArray(draft.get(resourceType))) {
            draft.set(
              resourceType,
              (draft.get(resourceType) as string[]).filter(el => !identifiers.includes(el))
            )
          }
          if (draft.get(resourceType)?.length === 0) {
            draft.delete(resourceType)
          }
        })
      )
    }
  } else {
    if (isAdd) {
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          draft.set(resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
        })
      )
    } else {
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          draft.delete(resourceType)
        })
      )
    }
  }
}

export const computeResourceMapOnMultiChange = (
  setSelectedResourceMap: (value: React.SetStateAction<Map<ResourceType, string | string[]>>) => void,
  selectedResourcesMap: Map<ResourceType, string | string[]>,
  types: ResourceType[],
  isAdd: boolean
): void => {
  if (isAdd) {
    setSelectedResourceMap(
      produce(selectedResourcesMap, draft => {
        types.forEach(resourceType => {
          draft.set(resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
        })
      })
    )
  } else {
    setSelectedResourceMap(
      produce(selectedResourcesMap, draft => {
        types.forEach(resourceType => {
          draft.delete(resourceType)
        })
      })
    )
  }
}
