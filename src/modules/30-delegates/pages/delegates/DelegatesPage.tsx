import React from 'react'
import { useParams } from 'react-router-dom'
import { TabNavigation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'

const DelegatesPage: React.FC = ({ children }) => {
  const params = useParams<PipelineType<ProjectPathProps>>()
  const { accountId, orgIdentifier, projectIdentifier, module } = params
  const { getString } = useStrings()

  return (
    <>
      <Page.Header
        breadcrumbs={<NGBreadcrumbs />}
        title={getString('delegate.delegates')}
        toolbar={
          <TabNavigation
            size={'small'}
            links={[
              {
                label: getString('delegate.delegates'),
                to: routes.toDelegateList({ accountId, orgIdentifier, projectIdentifier, module })
              },
              {
                label: getString('delegate.delegateConfigurations'),
                to: routes.toDelegateConfigs({ accountId, orgIdentifier, projectIdentifier, module })
              }
            ]}
          />
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default DelegatesPage
