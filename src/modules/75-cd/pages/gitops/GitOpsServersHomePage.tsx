import React from 'react'
import { Route, useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import css from './GitOpsServersHomePage.module.scss'

const GitOpsServersPage: React.FC = ({ children }) => {
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<PipelineType<ProjectPathProps>>()
  const { getString } = useStrings()
  const { ARGO_PHASE2_MANAGED } = useFeatureFlags()
  const pathToMatch = routes.toHarnessManagedGitOps({ accountId, orgIdentifier, projectIdentifier, module })

  return (
    <>
      <Route exact path={[pathToMatch, `${pathToMatch}/agents`]}>
        <Page.Header
          title={
            <div className="ng-tooltip-native">
              <h2> {getString('cd.gitOps')}</h2>
            </div>
          }
          className={css.header}
          breadcrumbs={<NGBreadcrumbs links={[]} />}
          toolbar={
            ARGO_PHASE2_MANAGED ? (
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
            ) : undefined
          }
        />
      </Route>
      <div className={css.children}>{children}</div>
    </>
  )
}

export default GitOpsServersPage
