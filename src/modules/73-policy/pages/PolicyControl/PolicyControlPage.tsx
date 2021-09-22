import React from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

const PolicyControlPage: React.FC = ({ children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={getString('governance')}
        toolbar={
          <TabNavigation
            size={'small'}
            links={[
              {
                label: getString('overview'),
                to: routes.toServiceAccounts({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('common.policies'),
                to: routes.toPolicyListPage({ accountId })
              },
              {
                label: getString('common.policy.policysets'),
                to: routes.toServiceAccounts({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('common.policy.evaluations'),
                to: routes.toResourceGroups({ accountId, orgIdentifier, projectIdentifier, module })
              }
            ]}
          />
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default PolicyControlPage
