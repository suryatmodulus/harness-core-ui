import React from 'react'
import { useParams } from 'react-router-dom'
import { Layout } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { Page } from '@common/exports'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export const ServiceDetailsHeader: React.FC = () => {
  const { orgIdentifier, projectIdentifier, accountId, module } = useParams<ProjectPathProps & ModulePathParams>()
  const { selectedProject: { name: selectedProjectName = '' } = {} } = useAppStore()
  const { getString } = useStrings()
  return (
    <Page.Header
      title={
        <Layout.Vertical spacing="xsmall">
          <Breadcrumbs
            links={[
              {
                url: routes.toProjectOverview({ orgIdentifier, projectIdentifier, accountId, module }),
                label: selectedProjectName
              },
              {
                url: routes.toServices({ orgIdentifier, projectIdentifier, accountId, module }),
                label: getString('services')
              },
              { url: '#', label: '' }
            ]}
          />
        </Layout.Vertical>
      }
    />
  )
}
