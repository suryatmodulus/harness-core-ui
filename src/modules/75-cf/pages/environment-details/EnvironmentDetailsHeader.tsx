import React from 'react'
import { Layout, Text } from '@wings-software/uicore'
import { Link, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'

const CFEnvironmentDetailsHeader: React.FC<{
  environment: EnvironmentResponseDTO
}> = ({ environment }) => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { selectedProject } = useAppStore()
  const { getString } = useStrings()
  const breadcrumbs = [
    {
      title: selectedProject?.name,
      url: routes.toProjectDetails({
        accountId,
        orgIdentifier,
        projectIdentifier
      })
    },
    {
      title: getString('cf.environments.adminEnvironments'),
      url: routes.toCFEnvironments({
        accountId,
        orgIdentifier,
        projectIdentifier
      })
    }
  ]

  return (
    <Layout.Vertical
      height={117}
      padding={{ top: 'large', right: 'xlarge', bottom: 'large', left: 'xlarge' }}
      style={{ backgroundColor: 'rgba(219, 241, 255, .46)', position: 'relative' }}
    >
      <Layout.Horizontal spacing="small">
        {breadcrumbs.map(linkInfo => (
          <React.Fragment key={linkInfo.title + linkInfo.url}>
            <Link style={{ color: '#0092E4', fontSize: '12px' }} to={linkInfo.url}>
              {linkInfo.title}
            </Link>
            <span>/</span>
          </React.Fragment>
        ))}
      </Layout.Horizontal>

      <Layout.Horizontal flex={{ align: 'center-center', distribution: 'space-between' }}>
        <Layout.Vertical>
          <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
            <Text style={{ lineHeight: '40px', color: '#22272D', fontSize: '16px' }}>{environment.name}</Text>
            <IdentifierText identifier={environment.identifier} style={{ margin: 0 }} allowCopy />
          </Layout.Horizontal>
          {environment.description && <Text font={{ size: 'normal' }}>{environment.description}</Text>}
        </Layout.Vertical>

        <Layout.Vertical spacing="small">
          <Layout.Horizontal spacing="medium">
            <Text font={{ weight: 'bold', size: 'normal' }}>{getString('typeLabel')}</Text>
            <Text>{getString(environment.type === EnvironmentType.PRODUCTION ? 'production' : 'nonProduction')}</Text>
          </Layout.Horizontal>
          {Object.keys(environment.tags ?? {}).length > 0 && (
            <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
              <Text font={{ weight: 'bold', size: 'normal' }}>{getString('tagsLabel')}</Text>
              <TagsViewer tags={Object.values(environment.tags || [])} />
            </Layout.Horizontal>
          )}
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default CFEnvironmentDetailsHeader
