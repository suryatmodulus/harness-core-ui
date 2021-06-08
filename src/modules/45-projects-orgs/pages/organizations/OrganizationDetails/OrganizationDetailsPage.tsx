import React from 'react'
import { Color, Icon, Layout, Text } from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGetOrganizationAggregateDTO } from 'services/cd-ng'
import OrgNavCardRenderer from '@projects-orgs/components/OrgNavCardRenderer/OrgNavCardRenderer'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { useStrings } from 'framework/strings'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
import css from './OrganizationDetailsPage.module.scss'

const OrganizationDetailsPage: React.FC = () => {
  const { accountId, orgIdentifier } = useParams<OrgPathProps>()
  const { getString } = useStrings()
  const { data, refetch, loading, error } = useGetOrganizationAggregateDTO({
    identifier: orgIdentifier,
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const organization = data?.data?.organizationResponse.organization
  const invitePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier
    },
    resource: {
      resourceType: ResourceType.USER
    },
    permission: PermissionIdentifier.INVITE_USER
  }

  const { openCollaboratorModal } = useCollaboratorModal()
  useDocumentTitle([organization?.name || '', getString('orgsText')])

  /* istanbul ignore next */ if (loading) return <Page.Spinner />
  /* istanbul ignore next */ if (error)
    return <Page.Error message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  /* istanbul ignore next */ if (!organization) return <></>

  return (
    <>
      <Page.Header
        size="xlarge"
        title={
          <Layout.Vertical spacing="small" padding="medium" className={css.title}>
            <Layout.Horizontal>
              <Link to={routes.toOrganizations({ accountId })}>
                <Text font="small" color={Color.BLUE_600}>
                  {getString('projectsOrgs.manage')}
                </Text>
              </Link>
            </Layout.Horizontal>
            <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
              {organization.name}
            </Text>
            <Text font="small" lineClamp={2}>
              {organization.description}
            </Text>
            <Layout.Horizontal padding={{ top: 'small' }}>
              <TagsRenderer tags={organization.tags || {}} length={6} />
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        content={
          <Layout.Vertical spacing="xsmall">
            <Layout.Horizontal flex={{ align: 'center-center' }} spacing="medium">
              <Icon name="nav-project-selected" size={30}></Icon>
              <Text font="medium">{data?.data?.projectsCount}</Text>
            </Layout.Horizontal>
            <Link
              to={`${routes.toProjects({
                accountId
              })}?orgIdentifier=${orgIdentifier}`}
            >
              <Text>{getString('projectsOrgs.viewProjects')}</Text>
            </Link>
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Horizontal padding="xxlarge">
            <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall" flex>
              <RbacAvatarGroup
                avatars={data?.data?.admins?.length ? data.data.admins : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  openCollaboratorModal({ orgIdentifier })
                }}
                restrictLengthTo={6}
                permission={invitePermission}
              />
              <Text font="xsmall">{getString('adminLabel')}</Text>
            </Layout.Vertical>
            <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall" flex>
              <RbacAvatarGroup
                avatars={data?.data?.collaborators?.length ? data.data.collaborators : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  openCollaboratorModal({ orgIdentifier })
                }}
                restrictLengthTo={6}
                permission={invitePermission}
              />
              <Text font="xsmall">{getString('collaboratorsLabel')}</Text>
            </Layout.Vertical>
          </Layout.Horizontal>
        }
        className={css.header}
      />
      <Page.Body
        retryOnError={() => {
          refetch()
        }}
      >
        <OrgNavCardRenderer />
      </Page.Body>
    </>
  )
}

export default OrganizationDetailsPage
