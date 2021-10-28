import React from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import type { StringsMap } from 'stringTypes'
import type { GovernancePathProps } from '@common/interfaces/RouteInterfaces'

export interface PolicyControlPageProps {
  titleKey?: keyof StringsMap
}

const PolicyControlPage: React.FC<PolicyControlPageProps> = ({ titleKey, children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<GovernancePathProps>()
  const { getString } = useStrings()
  const { pageTitle } = useQueryParams<{ pageTitle: string }>()

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={pageTitle || (titleKey && getString(titleKey)) || ''}
        toolbar={
          <TabNavigation
            size={'small'}
            links={[
              {
                label: getString('overview'),
                to: routes.toGovernancePolicyDashboard({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('common.policies'),
                to: routes.toGovernancePolicyListing({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('common.policy.policysets'),
                to: routes.toGovernancePolicySetsListing({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('common.policy.evaluations'),
                to: routes.toGovernanceEvaluationsListing({ accountId, orgIdentifier, projectIdentifier, module })
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
