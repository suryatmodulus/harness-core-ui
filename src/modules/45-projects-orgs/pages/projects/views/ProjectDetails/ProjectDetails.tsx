import React, { useState } from 'react'
import { Button, Color, Container, Icon, Layout, Popover, Text } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { Classes, Position } from '@blueprintjs/core'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { Project, useGetProjectAggregateDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import ModuleListCard from '@projects-orgs/components/ModuleListCard/ModuleListCard'
import ModuleEnableCard from '@projects-orgs/components/ModuleEnableCard/ModuleEnableCard'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import ContextMenu from '@projects-orgs/components/Menu/ContextMenu'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacAvatarGroup from '@rbac/components/RbacAvatarGroup/RbacAvatarGroup'
import useDeleteProjectDialog from '../../DeleteProject'
import css from './ProjectDetails.module.scss'

const ProjectDetails: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  const invitePermission = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    resource: {
      resourceType: ResourceType.USER
    },
    permission: PermissionIdentifier.INVITE_USER
  }
  const { data, loading, error, refetch } = useGetProjectAggregateDTO({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier
    }
  })

  const projectData = data?.data?.projectResponse.project
  const refetchProject = (): void => {
    refetch()
  }

  const { openProjectModal } = useProjectModal({
    onSuccess: refetchProject
  })

  const showEditProject = (project: Project): void => {
    openProjectModal(project)
  }

  const { openCollaboratorModal } = useCollaboratorModal()

  const showCollaborators = (project: Project): void => {
    openCollaboratorModal({
      projectIdentifier: project.identifier,
      orgIdentifier: project.orgIdentifier || 'default'
    })
  }

  const history = useHistory()
  const onDeleted = (): void => {
    history.push(routes.toProjects({ accountId }))
  }
  const { openDialog } = useDeleteProjectDialog(projectData || { identifier: '', name: '' }, onDeleted)
  useDocumentTitle(getString('projectsText'))

  const getEnableModules = (): Required<Project>['modules'] => {
    const modulesPresent: Required<Project>['modules'] = []
    if (CDNG_ENABLED) modulesPresent.push(ModuleName.CD)
    if (CVNG_ENABLED) modulesPresent.push(ModuleName.CV)
    if (CING_ENABLED) modulesPresent.push(ModuleName.CI)
    if (CENG_ENABLED) modulesPresent.push(ModuleName.CE)
    if (CFNG_ENABLED) modulesPresent.push(ModuleName.CF)

    return modulesPresent.filter(module => !projectData?.modules?.includes(module))
  }

  const getModuleInfoCards = (): React.ReactElement | React.ReactElement[] => {
    if (!projectData?.modules?.length) {
      return (
        <Layout.Vertical padding="huge" flex={{ align: 'center-center' }} spacing="huge">
          <Icon name="nav-project" size={70} />
          <Text font="medium">{getString('projectsOrgs.noModules')}</Text>
        </Layout.Vertical>
      )
    }

    const infoCards = []

    if (CDNG_ENABLED && projectData.modules.includes(ModuleName.CD)) infoCards.push(ModuleName.CD)
    if (CVNG_ENABLED && projectData.modules.includes(ModuleName.CV)) infoCards.push(ModuleName.CV)
    if (CING_ENABLED && projectData.modules.includes(ModuleName.CI)) infoCards.push(ModuleName.CI)
    if (CENG_ENABLED && projectData.modules.includes(ModuleName.CE)) infoCards.push(ModuleName.CE)
    if (CFNG_ENABLED && projectData.modules.includes(ModuleName.CF)) infoCards.push(ModuleName.CF)

    return infoCards.map(module => (
      <ModuleListCard
        module={module as ModuleName}
        key={module}
        projectIdentifier={projectData.identifier}
        orgIdentifier={projectData.orgIdentifier || ''}
        accountId={accountId}
      />
    ))
  }

  /* istanbul ignore next */ if (loading) return <Page.Spinner />
  /* istanbul ignore next */ if (error)
    return <Page.Error message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  /* istanbul ignore next */ if (!projectData) return <></>
  return (
    <>
      <Page.Header
        size="xlarge"
        title={
          <Layout.Vertical spacing="small" padding="medium" className={css.title}>
            <Breadcrumbs
              links={[
                {
                  url: routes.toProjects({ accountId }),
                  label: getString('projectsText')
                },
                {
                  url: '#',
                  label: projectData.name
                }
              ]}
            />
            <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK} lineClamp={1}>
              {projectData.name}
            </Text>
            <Text font="small" lineClamp={2}>
              {projectData.description}
            </Text>
            <Layout.Horizontal padding={{ top: 'small' }}>
              <TagsRenderer tags={projectData.tags || {}} length={6} />
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Horizontal padding="xxlarge">
            <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall">
              <RbacAvatarGroup
                className={css.projectDetailsAvatarGroup}
                avatars={data?.data?.admins?.length ? data?.data?.admins : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  showCollaborators(projectData as Project)
                }}
                restrictLengthTo={6}
                permission={invitePermission}
              />
              <Text font="xsmall" padding={{ left: 'xsmall' }}>
                {`${getString('adminLabel')} ${data?.data?.admins?.length ? `(${data?.data?.admins?.length})` : ``}`}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall">
              <RbacAvatarGroup
                className={css.projectDetailsAvatarGroup}
                avatars={data?.data?.collaborators?.length ? data?.data?.collaborators : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  showCollaborators(projectData as Project)
                }}
                restrictLengthTo={6}
                permission={invitePermission}
              />
              <Text font="xsmall" padding={{ left: 'xsmall' }}>{`${getString('collaboratorsLabel')} ${
                data?.data?.collaborators?.length ? `(${data?.data?.collaborators?.length})` : ``
              }`}</Text>
            </Layout.Vertical>
            <Popover
              isOpen={menuOpen}
              onInteraction={nextOpenState => {
                setMenuOpen(nextOpenState)
              }}
              className={Classes.DARK}
              position={Position.BOTTOM_RIGHT}
            >
              <Button
                minimal
                icon="Options"
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(true)
                }}
              />
              <ContextMenu
                project={projectData as Project}
                reloadProjects={refetch}
                editProject={showEditProject}
                collaborators={showCollaborators}
                setMenuOpen={setMenuOpen}
                openDialog={openDialog}
              />
            </Popover>
          </Layout.Horizontal>
        }
        className={css.header}
      />
      <Page.Body>
        <Layout.Horizontal>
          <div>
            <Container padding="xxlarge" className={css.enabledModules}>
              <Layout.Vertical padding="small" spacing="large">
                <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
                  {getString('projectsOrgs.modulesEnabled')}
                </Text>
                {getModuleInfoCards()}
              </Layout.Vertical>
            </Container>
            <Container padding="xxlarge">
              {getEnableModules().length === 0 ? null : (
                <>
                  <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
                    {getString('projectsOrgs.enableModules')}
                  </Text>
                  <Layout.Horizontal spacing="small" padding={{ top: 'large' }}>
                    {getEnableModules().map(module => (
                      <ModuleEnableCard
                        key={module}
                        data={projectData as Project}
                        module={module as ModuleName}
                        refetchProject={refetchProject}
                      />
                    ))}
                  </Layout.Horizontal>
                </>
              )}
            </Container>
          </div>
          {/* TODO: ENABLE THIS WHEN WE HAVE INFO */}
          {/* <Layout.Vertical padding="huge" spacing="large">
            <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
              {getString('projectsOrgs.recentActivities')}
            </Text>
            <Card className={css.activityCard}>
              <ActivityStack
                items={[]}
                tooltip={item => (
                  <Layout.Vertical padding="medium">
                    <Text>{item.activity}</Text>
                    <Text>{item.updatedBy}</Text>
                  </Layout.Vertical>
                )}
              />
            </Card>
          </Layout.Vertical>*/}
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default ProjectDetails
