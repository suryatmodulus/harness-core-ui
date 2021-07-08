import React, { useEffect, useState } from 'react'
import { Text, Layout, Container, Color } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import produce from 'immer'
import type { ResourceGroupDetailsPathProps } from '@common/interfaces/RouteInterfaces'

import { useStrings } from 'framework/strings'
import ResourceTypeList from '@rbac/components/ResourceTypeList/ResourceTypeList'
import {
  useGetResourceGroup,
  useUpdateResourceGroup,
  ResourceGroupRequestRequestBody,
  ResourceGroupDTO,
  useGetResourceTypes
} from 'services/resourcegroups'
import { Page } from '@common/components/Page/Page'
import { useToaster } from '@common/components/Toaster/useToaster'
import { RbacResourceGroupTypes } from '@rbac/constants/utils'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import ResourcesCard from '@rbac/components/ResourcesCard/ResourcesCard'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import routes from '@common/RouteDefinitions'
import RbacFactory from '@rbac/factories/RbacFactory'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import { getResourceSelectorsfromMap, getSelectedResourcesMap } from './utils'
import css from './ResourceGroupDetails.module.scss'

const ResourceGroupDetails: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, resourceGroupIdentifier } =
    useParams<ResourceGroupDetailsPathProps>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [isUpdated, setIsUpdated] = useState<boolean>(false)

  const [selectedResourcesMap, setSelectedResourceMap] = useState<Map<ResourceType, string[] | string>>(new Map())
  const [resourceCategoryMap, setResourceCategoryMap] =
    useState<Map<ResourceType | ResourceCategory, ResourceType[] | undefined>>()

  const [canEdit] = usePermission(
    {
      resource: {
        resourceType: ResourceType.RESOURCEGROUP,
        resourceIdentifier: resourceGroupIdentifier
      },
      permissions: [PermissionIdentifier.UPDATE_RESOURCEGROUP]
    },
    [resourceGroupIdentifier]
  )

  const {
    data: resourceGroupDetails,
    error: errorInGettingResourceGroup,
    loading,
    refetch
  } = useGetResourceGroup({
    identifier: resourceGroupIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const { data: resourceTypeData } = useGetResourceTypes({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  useEffect(() => {
    setResourceCategoryMap(
      RbacFactory.getResourceCategoryList(
        (resourceTypeData?.data?.resourceTypes?.map(val => val.name) || []) as ResourceType[]
      )
    )
  }, [resourceTypeData?.data])

  useEffect(() => {
    setSelectedResourceMap(getSelectedResourcesMap(resourceGroupDetails?.data?.resourceGroup.resourceSelectors))
    setIsUpdated(false)
  }, [resourceGroupDetails?.data?.resourceGroup])

  const { mutate: updateResourceGroup, loading: updating } = useUpdateResourceGroup({
    identifier: resourceGroupIdentifier || '',
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const updateResourceGroupData = async (resourceGroup: ResourceGroupDTO): Promise<void> => {
    const dataToSubmit: ResourceGroupRequestRequestBody = {
      resourcegroup: {
        ...resourceGroup,
        resourceSelectors: getResourceSelectorsfromMap(selectedResourcesMap)
      }
    }
    try {
      const updated = await updateResourceGroup(dataToSubmit)
      if (updated) {
        showSuccess(getString('resourceGroup.updateSuccess'))
        refetch()
      }
    } /* istanbul ignore next */ catch (e) {
      showError(e.data?.message || e.message)
    }
  }

  const onResourceSelectionChange = (resourceType: ResourceType, isAdd: boolean, identifiers?: string[]): void => {
    setIsUpdated(true)
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
            if (Array.isArray(draft.get(resourceType)))
              draft.set(
                resourceType,
                (draft.get(resourceType) as string[]).filter(el => !identifiers.includes(el))
              )
            if (draft.get(resourceType)?.length === 0) draft.delete(resourceType)
          })
        )
      }
    } else {
      if (isAdd)
        setSelectedResourceMap(
          produce(selectedResourcesMap, draft => {
            draft.set(resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
          })
        )
      else
        setSelectedResourceMap(
          produce(selectedResourcesMap, draft => {
            draft.delete(resourceType)
          })
        )
    }
  }

  const onResourceCategorySelect = (types: ResourceType[], isAdd: boolean): void => {
    setIsUpdated(true)
    if (isAdd)
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          types.map(resourceType => {
            draft.set(resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
          })
        })
      )
    else
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          types.map(resourceType => {
            draft.delete(resourceType)
          })
        })
      )
  }

  const resourceGroup = resourceGroupDetails?.data?.resourceGroup
  const isHarnessManaged = resourceGroupDetails?.data?.harnessManaged
  const disableAddingResources = isHarnessManaged || !canEdit

  useDocumentTitle([resourceGroup?.name || '', getString('resourceGroups')])

  if (loading) return <Page.Spinner />
  if (errorInGettingResourceGroup)
    return (
      <Page.Error
        message={(errorInGettingResourceGroup.data as Error)?.message || errorInGettingResourceGroup.message}
      />
    )
  if (!resourceGroup)
    return <Page.NoDataCard icon="resources-icon" message={getString('resourceGroup.noResourceGroupFound')} />

  return (
    <>
      <Page.Header
        size="xlarge"
        className={css.headerContainer}
        title={
          <Layout.Vertical spacing="small">
            <Breadcrumbs
              links={[
                {
                  url: routes.toAccessControl({ accountId, orgIdentifier, projectIdentifier }),
                  label: getString('accessControl')
                },
                {
                  url: routes.toResourceGroups({ accountId, orgIdentifier, projectIdentifier }),
                  label: getString('resourceGroups')
                },
                {
                  url: '#',
                  label: resourceGroup.name || ''
                }
              ]}
            />
            <Layout.Horizontal spacing="medium" flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
              <div style={{ backgroundColor: resourceGroup.color }} className={css.colorDiv}></div>
              <Layout.Vertical padding={{ left: 'medium' }} spacing="xsmall">
                <Text font="medium" lineClamp={1} color={Color.BLACK} width={700}>
                  {resourceGroup.name}
                </Text>
                <Text lineClamp={1} color={Color.GREY_400} width={700}>
                  {resourceGroup.description}
                </Text>
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Horizontal flex>
            <Layout.Vertical
              padding={{ right: 'small' }}
              border={{ right: true, color: Color.GREY_300 }}
              spacing="xsmall"
            >
              <Text>{getString('created')}</Text>
              <Text lineClamp={1} color={Color.BLACK}>
                {isHarnessManaged ? (
                  <Text lineClamp={1} color={Color.BLACK}>
                    {getString('resourceGroup.builtInResourceGroup')}
                  </Text>
                ) : (
                  <ReactTimeago date={resourceGroupDetails?.data?.createdAt || ''} />
                )}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
              <Text>{getString('lastUpdated')}</Text>
              <Text lineClamp={1} color={Color.BLACK}>
                {isHarnessManaged ? (
                  <Text lineClamp={1} color={Color.BLACK}>
                    {getString('resourceGroup.builtInResourceGroup')}
                  </Text>
                ) : (
                  <ReactTimeago date={resourceGroupDetails?.data?.lastModifiedAt || ''} />
                )}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        }
      />
      <Page.Body loading={updating || loading}>
        <div className={css.pageContainer}>
          <Container
            padding="xlarge"
            className={css.resourceTypeListContainer}
            border={{ right: true, color: Color.GREY_250 }}
          >
            <ResourceTypeList
              resourceCategoryMap={resourceCategoryMap}
              onResourceSelectionChange={onResourceSelectionChange}
              onResourceCategorySelect={onResourceCategorySelect}
              preSelectedResourceList={Array.from(selectedResourcesMap.keys())}
              disableAddingResources={disableAddingResources}
            />
          </Container>
          <Container
            padding="xlarge"
            onDrop={event => {
              const resourceCategory: ResourceType | ResourceCategory = event.dataTransfer.getData('text/plain') as
                | ResourceType
                | ResourceCategory
              const types = resourceCategoryMap?.get(resourceCategory)
              if (types) {
                onResourceCategorySelect(types, true)
              } else onResourceSelectionChange(resourceCategory as ResourceType, true)

              event.preventDefault()
              event.stopPropagation()
            }}
            onDragOver={event => {
              event.dataTransfer.dropEffect = 'copy'
              event.preventDefault()
            }}
          >
            {!isHarnessManaged && (
              <Layout.Vertical flex={{ alignItems: 'flex-end' }} padding="medium">
                <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} spacing="small">
                  {isUpdated && <Text color={Color.BLACK}>{getString('unsavedChanges')}</Text>}
                  <RbacButton
                    text={getString('applyChanges')}
                    onClick={() => updateResourceGroupData(resourceGroup)}
                    disabled={updating || !isUpdated}
                    intent="primary"
                    permission={{
                      resource: {
                        resourceType: ResourceType.RESOURCEGROUP,
                        resourceIdentifier: resourceGroupIdentifier
                      },
                      permission: PermissionIdentifier.UPDATE_RESOURCEGROUP
                    }}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
            )}
            <Layout.Vertical spacing="small" height="100%">
              {Array.from(selectedResourcesMap.keys()).length === 0 && (
                <Page.NoDataCard
                  message={getString('resourceGroup.dragAndDropData')}
                  icon="drag-handle-horizontal"
                  iconSize={100}
                />
              )}
              {Array.from(selectedResourcesMap.keys()).length !== 0 &&
                Array.from(selectedResourcesMap.keys()).map(resourceType => {
                  return (
                    <ResourcesCard
                      key={resourceType}
                      resourceType={resourceType}
                      resourceValues={selectedResourcesMap.get(resourceType) || []}
                      onResourceSelectionChange={onResourceSelectionChange}
                      disableAddingResources={isHarnessManaged}
                    />
                  )
                })}
            </Layout.Vertical>
          </Container>
        </div>
      </Page.Body>
    </>
  )
}
export default ResourceGroupDetails
