import React, { useState } from 'react'
import cx from 'classnames'
import { Card, Text, Layout, CardBody, Container, Color, AvatarGroup } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import type { Project, ProjectAggregateDTO } from 'services/cd-ng'
import DefaultRenderer from '@projects-orgs/components/ModuleRenderer/DefaultRenderer'
import CVRenderer from '@projects-orgs/components/ModuleRenderer/cv/CVRenderer'
import CIRenderer from '@projects-orgs/components/ModuleRenderer/ci/CIRenderer'
import CDRenderer from '@projects-orgs/components/ModuleRenderer/cd/CDRenderer'
import ContextMenu from '@projects-orgs/components/Menu/ContextMenu'
import routes from '@common/RouteDefinitions'
import CERenderer from '@projects-orgs/components/ModuleRenderer/ce/CERenderer'
import CFRenderer from '@projects-orgs/components/ModuleRenderer/cf/CFRenderer'
import useDeleteProjectDialog from '@projects-orgs/pages/projects/DeleteProject'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import css from './ProjectCard.module.scss'

export interface ProjectCardProps {
  data: ProjectAggregateDTO
  isPreview?: boolean
  className?: string
  reloadProjects?: () => Promise<void>
  editProject?: (project: Project) => void
  handleInviteCollaborators?: (project: Project) => void
}

const ProjectCard: React.FC<ProjectCardProps> = props => {
  const { data: projectAggregateDTO, isPreview, reloadProjects, editProject, handleInviteCollaborators } = props
  const {
    projectResponse,
    organization,
    admins: adminList,
    collaborators: collaboratorsList,
    harnessManagedOrg
  } = projectAggregateDTO
  const data = projectResponse.project || null
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const history = useHistory()
  const onDeleted = (): void => {
    reloadProjects?.()
  }
  const [menuOpen, setMenuOpen] = useState(false)
  const { openDialog } = useDeleteProjectDialog(data, onDeleted)

  return (
    <Card
      className={cx(css.projectCard, props.className)}
      data-testid={`project-card-${data.identifier + data.orgIdentifier}`}
    >
      <Container padding="xlarge" className={css.projectInfo}>
        {!isPreview ? (
          <CardBody.Menu
            menuContent={
              <ContextMenu
                project={data}
                reloadProjects={reloadProjects}
                editProject={editProject}
                collaborators={handleInviteCollaborators}
                openDialog={openDialog}
                setMenuOpen={setMenuOpen}
              />
            }
            menuPopoverProps={{
              className: Classes.DARK,
              isOpen: menuOpen,
              onInteraction: nextOpenState => {
                setMenuOpen(nextOpenState)
              }
            }}
          />
        ) : null}
        <Container
          onClick={() => {
            !isPreview &&
              history.push({
                pathname: routes.toProjectDetails({
                  projectIdentifier: data.identifier,
                  orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ '',
                  accountId
                })
              })
          }}
        >
          <div className={css.colorBar} style={{ backgroundColor: data.color }} />
          {data.name ? (
            <Text font="medium" lineClamp={1} color={Color.BLACK}>
              {data.name}
            </Text>
          ) : isPreview ? (
            <Text font="medium" lineClamp={1} color={Color.BLACK}>
              {getString('projectCard.projectName')}
            </Text>
          ) : null}
          <Text font={{ size: 'small' }} margin={{ top: 'xsmall' }}>
            {data.identifier}
          </Text>
          {harnessManagedOrg || isPreview ? null : (
            <Container
              padding="xsmall"
              margin={{ top: 'small' }}
              border={{ color: Color.GREY_200 }}
              flex={{ inline: true }}
            >
              <Text font={{ size: 'small' }} margin={{ right: 'xsmall' }}>{`${getString('orgLabel')}:`}</Text>
              <Text font={{ size: 'small', weight: 'bold' }}>{organization?.name}</Text>
            </Container>
          )}
          {data.description ? (
            <Text font="small" lineClamp={2} padding={{ top: 'small' }}>
              {data.description}
            </Text>
          ) : null}
          {data.tags && (
            <Container padding={{ top: 'small' }}>
              <TagsRenderer tags={data.tags} length={2} width={150} />
            </Container>
          )}

          <Layout.Horizontal padding={{ top: 'medium' }}>
            <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall">
              <Text font="small" padding={{ bottom: 'small' }}>{`${getString('adminLabel')} ${
                adminList?.length ? `(${adminList?.length})` : ``
              }`}</Text>
              <AvatarGroup
                className={css.projectAvatarGroup}
                avatars={adminList?.length ? adminList : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  handleInviteCollaborators ? handleInviteCollaborators(data) : null
                }}
                restrictLengthTo={1}
              />
            </Layout.Vertical>
            <Layout.Vertical spacing="xsmall">
              <Text font="small" padding={{ bottom: 'small' }}>{`${getString('collaboratorsLabel')} ${
                collaboratorsList?.length ? `(${collaboratorsList?.length})` : ``
              }`}</Text>
              <AvatarGroup
                className={css.projectAvatarGroup}
                avatars={collaboratorsList?.length ? collaboratorsList : [{}]}
                onAdd={event => {
                  event.stopPropagation()

                  handleInviteCollaborators ? handleInviteCollaborators(data) : null
                }}
                restrictLengthTo={1}
              />
            </Layout.Vertical>
          </Layout.Horizontal>
        </Container>
      </Container>
      {!data.modules?.length ? <DefaultRenderer /> : null}
      {data.modules?.includes(ModuleName.CD) ? <CDRenderer data={data} isPreview={isPreview} /> : null}
      {data.modules?.includes(ModuleName.CV) ? <CVRenderer data={data} isPreview={isPreview} /> : null}
      {data.modules?.includes(ModuleName.CI) ? <CIRenderer data={data} isPreview={isPreview} /> : null}
      {data.modules?.includes(ModuleName.CF) ? <CFRenderer data={data} isPreview={isPreview} /> : null}
      {data.modules?.includes(ModuleName.CE) ? <CERenderer data={data} isPreview={isPreview} /> : null}
    </Card>
  )
}

export default ProjectCard
