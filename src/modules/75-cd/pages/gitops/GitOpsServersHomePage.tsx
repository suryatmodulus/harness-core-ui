import React from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

const GitOpsServersPage: React.FC = ({ children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const { ARGO_PHASE2_MANAGED } = useFeatureFlags()

  return (
    <>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2> {getString('cd.gitOps')}</h2>
          </div>
        }
        breadcrumbs={<NGBreadcrumbs links={[]} />}
        toolbar={
          ARGO_PHASE2_MANAGED && (
            <TabNavigation
              size={'normal'}
              links={[
                {
                  label: 'GitOps Server',
                  to: routes.toHarnessManagedGitOps({ accountId, orgIdentifier, projectIdentifier, module })
                },
                {
                  label: 'Native Argo CD',
                  to: routes.toNativeArgo({ accountId, orgIdentifier, projectIdentifier, module })
                }
              ]}
            />
          )
        }
      ></Page.Header>
      {children}
    </>
  )
}

export default GitOpsServersPage
