import React, { useState } from 'react'
import { Button, Color, Container, Icon, Layout, Popover, Text } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { Classes, Position } from '@blueprintjs/core'
import ReactTimeago from 'react-timeago'
import { isEmpty } from 'lodash-es'
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
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
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
        size={projectData.description || !isEmpty(projectData.tags) ? 'xxlarge' : 'xlarge'}
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toProjects({ accountId }),
                label: getString('projectsText')
              }
            ]}
          />
        }
        title={
          <Layout.Vertical spacing="small" padding={{ top: 'small' }} className={css.title}>
            <Layout.Horizontal
              spacing="medium"
              margin={{ bottom: 'medium' }}
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
            >
              <div className={css.colorBar} style={{ backgroundColor: projectData.color }} />
              {data?.data?.projectResponse.lastModifiedAt ? (
                <Text color={Color.GREY_500} font={{ size: 'small' }}>
                  {`${getString('common.modified')} `}
                  <ReactTimeago date={data?.data?.projectResponse.lastModifiedAt} />
                </Text>
              ) : null}
            </Layout.Horizontal>
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text
                font={{ size: 'medium', weight: 'semi-bold' }}
                color={Color.GREY_800}
                lineClamp={1}
                padding={{ right: 'xlarge' }}
              >
                {projectData.name}
              </Text>
              <Text
                font={{ size: 'small', weight: 'semi-bold' }}
                color={Color.GREY_500}
                lineClamp={1}
                padding={{ right: 'medium' }}
              >
                {getString('idLabel', { id: projectData.identifier })}
              </Text>
              <div className={css.divider} />
              <Text
                font={{ size: 'small', weight: 'semi-bold' }}
                color={Color.GREY_500}
                lineClamp={1}
                padding={{ left: 'medium' }}
              >
                {`${getString('orgLabel')}: ${projectData.orgIdentifier}`}
              </Text>
            </Layout.Horizontal>
            {projectData.description ? (
              <Text font="small" color={Color.BLACK} lineClamp={2}>
                {projectData.description}
              </Text>
            ) : null}
            {projectData.tags && !isEmpty(projectData.tags) ? (
              <Layout.Horizontal padding={{ top: 'medium' }}>
                <TagsRenderer tags={projectData.tags} length={6} tagClassName={css.tags} />
              </Layout.Horizontal>
            ) : null}
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Vertical
            padding={{ top: 'small' }}
            flex={{ justifyContent: 'space-between', alignItems: 'flex-end' }}
          >
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
            <Layout.Horizontal padding={{ right: 'huge' }} margin={{ right: 'huge' }}>
              <Layout.Vertical padding={{ right: 'xlarge' }}>
                <Text font="xsmall" color={Color.GREY_400} padding={{ left: 'xsmall', bottom: 'small' }}>
                  {`${getString('adminLabel')} ${data?.data?.admins?.length ? `(${data?.data?.admins?.length})` : ``}`}
                </Text>
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
              </Layout.Vertical>
              <Layout.Vertical>
                <Text font="xsmall" color={Color.GREY_400} padding={{ left: 'xsmall', bottom: 'small' }}>{`${getString(
                  'collaboratorsLabel'
                )} ${data?.data?.collaborators?.length ? `(${data?.data?.collaborators?.length})` : ``}`}</Text>
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
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
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
