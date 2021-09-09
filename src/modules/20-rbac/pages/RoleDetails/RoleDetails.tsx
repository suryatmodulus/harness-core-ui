import React, { useEffect, useState } from 'react'
import { Card, Color, Container, Icon, Layout, Text, ButtonVariation } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import produce from 'immer'
import { useStrings } from 'framework/strings'
import { Page, useToaster } from '@common/exports'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import {
  Permission,
  Role,
  useGetPermissionList,
  useGetRole,
  useUpdateRole,
  useGetPermissionResourceTypesList
} from 'services/rbac'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import PermissionCard from '@rbac/components/PermissionCard/PermissionCard'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import { getPermissionMap } from '@rbac/pages/RoleDetails/utils'
import routes from '@common/RouteDefinitions'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { getRoleIcon } from '@rbac/utils/utils'
import type { PipelineType, RolePathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import css from './RoleDetails.module.scss'

const RoleDetails: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, roleIdentifier, module } =
    useParams<PipelineType<ProjectPathProps & RolePathProps>>()
  const [resource, setResource] = useState<ResourceType>()
  const [resourceCategoryMap, setResourceCategoryMap] =
    useState<Map<ResourceType | ResourceCategory, ResourceType[] | undefined>>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [permissions, setPermissions] = useState<string[]>([])
  const [isUpdated, setIsUpdated] = useState<boolean>(false)
  const listRef: Map<ResourceCategory | ResourceType, HTMLDivElement | null> = new Map()
  const { data, loading, error, refetch } = useGetRole({
    identifier: roleIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const [canEdit] = usePermission(
    {
      resource: {
        resourceType: ResourceType.ROLE,
        resourceIdentifier: roleIdentifier
      },
      permissions: [PermissionIdentifier.UPDATE_ROLE]
    },
    [roleIdentifier]
  )

  const { data: resourceGroups } = useGetPermissionResourceTypesList({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })

  const { mutate: addPermissions } = useUpdateRole({
    identifier: roleIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { data: permissionList } = useGetPermissionList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  useEffect(() => {
    setPermissions(data?.data?.role.permissions || /* istanbul ignore next */ [])
    setIsUpdated(false)
  }, [data?.data])

  useEffect(() => {
    setResourceCategoryMap(RbacFactory.getResourceCategoryList((resourceGroups?.data || []) as ResourceType[]))
  }, [resourceGroups?.data])

  const permissionsMap: Map<ResourceType, Permission[]> = getPermissionMap(permissionList?.data)

  const isPermissionEnabled = (_permission: string): boolean => {
    if (data?.data?.role.permissions?.includes(_permission)) return true
    return false
  }

  const onChangePermission = async (permission: string, isAdd: boolean): Promise<void> => {
    if (isAdd) {
      if (
        permission === PermissionIdentifier.EDIT_DASHBOARD ||
        permissions.indexOf(PermissionIdentifier.EDIT_DASHBOARD) !== -1
      ) {
        setPermissions(_permissions => [...permissions, permission, PermissionIdentifier.VIEW_DASHBOARD])
      } else {
        setPermissions(_permissions => [...permissions, permission])
      }
    } else if (
      !(
        permission === PermissionIdentifier.VIEW_DASHBOARD &&
        permissions.indexOf(PermissionIdentifier.EDIT_DASHBOARD) !== -1
      )
    ) {
      setPermissions(_permissions =>
        produce(_permissions, draft => {
          draft?.splice(permissions.indexOf(permission), 1)
        })
      )
    }

    setIsUpdated(true)
  }

  const submitChanges = async (role: Role): Promise<void> => {
    role['permissions'] = permissions
    try {
      const updated = await addPermissions(role)
      /* istanbul ignore else */ if (updated) {
        showSuccess(getString('rbac.roleDetails.permissionUpdatedSuccess'))
        refetch()
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.data?.message || e.message)
    }
  }
  const role = data?.data?.role
  const disableEdit = data?.data?.harnessManaged || !canEdit

  useDocumentTitle([role?.name || '', getString('roles')])

  if (loading) return <PageSpinner />
  if (error) return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />

  if (!role) return <></>
  return (
    <>
      <Page.Header
        size="xlarge"
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toAccessControl({ accountId, orgIdentifier, projectIdentifier, module }),
                label: getString('accessControl')
              },
              {
                url: routes.toRoles({ accountId, orgIdentifier, projectIdentifier, module }),
                label: getString('roles')
              }
            ]}
          />
        }
        title={
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
            <Icon name={getRoleIcon(role.identifier)} size={40} />
            <Layout.Vertical padding={{ left: 'medium' }} spacing="xsmall" className={css.details}>
              <Text color={Color.BLACK} font="medium">
                {role.name}
              </Text>
              {role.description && <Text lineClamp={2}>{role.description}</Text>}
              {role.tags && (
                <Layout.Horizontal padding={{ top: 'small' }}>
                  <TagsRenderer tags={role.tags || /* istanbul ignore next */ {}} length={6} />
                </Layout.Horizontal>
              )}
            </Layout.Vertical>
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal flex>
            {data?.data?.createdAt && (
              <Layout.Vertical
                padding={{ right: 'small' }}
                border={{ right: true, color: Color.GREY_300 }}
                spacing="xsmall"
              >
                <Text>{getString('created')}</Text>
                <ReactTimeago date={data.data.createdAt} />
              </Layout.Vertical>
            )}
            {data?.data?.lastModifiedAt && (
              <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
                <Text>{getString('lastUpdated')}</Text>
                <ReactTimeago date={data.data.lastModifiedAt} />
              </Layout.Vertical>
            )}
          </Layout.Horizontal>
        }
      />
      <Page.Body>
        <Layout.Horizontal className={css.body}>
          <Container className={css.resourceList}>
            <Layout.Vertical flex spacing="small">
              {resourceCategoryMap?.keys() &&
                Array.from(resourceCategoryMap.keys()).map(resourceType => {
                  const resourceHandler =
                    RbacFactory.getResourceCategoryHandler(resourceType as ResourceCategory) ||
                    RbacFactory.getResourceTypeHandler(resourceType as ResourceType)
                  return (
                    resourceHandler && (
                      <Card
                        interactive
                        key={resourceType}
                        data-testid={`resourceCard-${resourceType}`}
                        className={css.card}
                        onClick={() => {
                          setResource(resourceType as ResourceType)
                          const elem = listRef.get(resourceType)
                          elem?.scrollIntoView()
                        }}
                      >
                        <Layout.Horizontal flex spacing="small">
                          <Icon name={resourceHandler.icon} size={20} />
                          <Text color={Color.BLACK}>{getString(resourceHandler.label)} </Text>
                        </Layout.Horizontal>
                      </Card>
                    )
                  )
                })}
            </Layout.Vertical>
          </Container>
          <Container padding="large" className={css.permissionListContainer}>
            <Layout.Vertical>
              <Layout.Horizontal flex padding="medium" spacing="medium">
                <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }} padding={{ left: 'medium' }}>
                  {getString('rbac.roleDetails.updateRolePermissions')}
                </Text>
                <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} spacing="small">
                  {isUpdated && <Text color={Color.BLACK}>{getString('unsavedChanges')}</Text>}
                  <RbacButton
                    onClick={() => submitChanges(role)}
                    text={getString('applyChanges')}
                    variation={ButtonVariation.PRIMARY}
                    disabled={data?.data?.harnessManaged || !isUpdated}
                    permission={{
                      resource: {
                        resourceType: ResourceType.ROLE,
                        resourceIdentifier: roleIdentifier
                      },
                      permission: PermissionIdentifier.UPDATE_ROLE
                    }}
                  />
                </Layout.Horizontal>
              </Layout.Horizontal>
              {resourceCategoryMap?.keys() &&
                Array.from(resourceCategoryMap.keys()).map(resourceCategory => {
                  return (
                    <div
                      key={resourceCategory}
                      ref={input => {
                        listRef.set(resourceCategory, input)
                      }}
                    >
                      <PermissionCard
                        resourceTypes={resourceCategoryMap.get(resourceCategory)}
                        selected={resourceCategory === resource}
                        permissionMap={permissionsMap}
                        resourceCategory={resourceCategory}
                        disableEdit={disableEdit}
                        onChangePermission={onChangePermission}
                        isPermissionEnabled={isPermissionEnabled}
                      />
                    </div>
                  )
                })}
            </Layout.Vertical>
          </Container>
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default RoleDetails
