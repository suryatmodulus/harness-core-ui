import React from 'react'
import { Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { Module, PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { SidebarLink } from '../SideNav/SideNav'
import NavExpandable from '../NavExpandable/NavExpandable'

interface ProjectSetupMenuProps {
  module?: Module
}

const ProjectSetupMenu: React.FC<ProjectSetupMenuProps> = ({ module }) => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  const { NG_SHOW_DELEGATE, NG_TEMPLATES } = useFeatureFlags()
  const params = { accountId, orgIdentifier, projectIdentifier, module }
  const getGitSyncEnabled = (): boolean => {
    if (module === 'ci' || module === 'cd' || !module) return true
    return false
  }
  return (
    <NavExpandable title={getString('common.projectSetup')} route={routes.toSetup(params)}>
      <Layout.Vertical spacing="small">
        <SidebarLink label={getString('connectorsLabel')} to={routes.toConnectors(params)} />
        <SidebarLink label={getString('common.secrets')} to={routes.toSecrets(params)} />
        <SidebarLink to={routes.toAccessControl(params)} label={getString('accessControl')} />
        {NG_SHOW_DELEGATE ? (
          <SidebarLink label={getString('delegate.delegates')} to={routes.toDelegates(params)} />
        ) : null}
        {getGitSyncEnabled() ? (
          <SidebarLink
            label={getString('gitManagement')}
            to={routes.toGitSyncAdmin({ accountId, orgIdentifier, projectIdentifier, module })}
          />
        ) : null}
        {NG_TEMPLATES ? (
          <SidebarLink label={getString('common.templates')} to={routes.toTemplatesListing(params)} />
        ) : null}
      </Layout.Vertical>
    </NavExpandable>
  )
}

export default ProjectSetupMenu
