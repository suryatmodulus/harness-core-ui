import React from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

const AccessControlPage: React.FC = ({ children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={getString('accessControl')}
        toolbar={
          <TabNavigation
            links={[
              {
                label: getString('users'),
                to: routes.toUsers({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('common.userGroups'),
                to: routes.toUserGroups({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('rbac.serviceAccounts.label'),
                to: routes.toServiceAccounts({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('resourceGroups'),
                to: routes.toResourceGroups({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('roles'),
                to: routes.toRoles({ accountId, orgIdentifier, projectIdentifier, module })
              }
            ]}
          />
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default AccessControlPage
