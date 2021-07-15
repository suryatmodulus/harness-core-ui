import React from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'

import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

const AccessControlPage: React.FC = ({ children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const { NG_SERVICE_ACCOUNT } = useFeatureFlags()

  return (
    <>
      <Page.Header
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
              ...(NG_SERVICE_ACCOUNT
                ? [
                    {
                      label: getString('rbac.serviceAccounts.label'),
                      to: routes.toServiceAccounts({ accountId, orgIdentifier, projectIdentifier, module })
                    }
                  ]
                : /* istanbul ignore next */ []),
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
