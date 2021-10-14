import React from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { useLocation, matchPath } from 'react-router-dom'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import ScopedTitle from '@common/components/Title/ScopedTitle'

interface AccessControlLink {
  label: string
  to: string
  title: string
}

const AccessControlPage: React.FC = ({ children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const { pathname } = useLocation()

  const accessControlLinks: AccessControlLink[] = [
    {
      label: getString('users'),
      to: routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module }),
      title: getString('rbac.accessControlTitle.users')
    },
    {
      label: getString('common.userGroups'),
      to: routes.toUserGroups({ accountId, orgIdentifier, projectIdentifier, module }),
      title: getString('rbac.accessControlTitle.userGroups')
    },
    {
      label: getString('rbac.serviceAccounts.label'),
      to: routes.toServiceAccounts({ accountId, orgIdentifier, projectIdentifier, module }),
      title: getString('rbac.accessControlTitle.serviceAccounts')
    },
    {
      label: getString('resourceGroups'),
      to: routes.toResourceGroups({ accountId, orgIdentifier, projectIdentifier, module }),
      title: getString('rbac.accessControlTitle.resourceGroups')
    },
    {
      label: getString('roles'),
      to: routes.toRoles({ accountId, orgIdentifier, projectIdentifier, module }),
      title: getString('rbac.accessControlTitle.roles')
    }
  ]

  const getScopedTitle = (): string => {
    return accessControlLinks.find(nav => matchPath(pathname, nav.to))?.title || getString('accessControl')
  }

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={<ScopedTitle title={getScopedTitle()} />}
        toolbar={
          <TabNavigation size={'small'} links={accessControlLinks.map(link => ({ label: link.label, to: link.to }))} />
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default AccessControlPage
