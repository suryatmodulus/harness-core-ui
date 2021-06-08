import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'
import { Layout, Color, Text, Icon } from '@wings-software/uicore'
import type { Optional } from 'utility-types'
import type { Project } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { ModuleName } from 'framework/types/ModuleName'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import type { PermissionRequest } from '@rbac/hooks/usePermission'

interface ContextMenuProps {
  project: Project
  reloadProjects?: () => Promise<unknown>
  editProject?: (project: Project) => void
  collaborators?: (project: Project) => void
  setMenuOpen?: (value: React.SetStateAction<boolean>) => void
  openDialog?: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = props => {
  const history = useHistory()
  const { accountId } = useParams<AccountPathProps>()
  const { getString } = useStrings()
  const { project, editProject, collaborators, setMenuOpen, openDialog } = props

  const permissionRequest: Optional<PermissionRequest, 'permission'> = {
    resourceScope: {
      accountIdentifier: accountId,
      orgIdentifier: project.orgIdentifier
    },
    resource: {
      resourceType: ResourceType.PROJECT,
      resourceIdentifier: project.identifier
    }
  }

  const handleDelete = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    openDialog?.()
  }

  const handleEdit = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    editProject?.(project)
  }

  const handleCollaborate = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    collaborators?.(project)
  }

  const handleCD = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCDProjectOverview({
        orgIdentifier: project.orgIdentifier || /* istanbul ignore next */ '',
        projectIdentifier: project.identifier,
        accountId,
        module: 'cd'
      })
    )
  }

  const handleCV = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCVProjectOverview({
        projectIdentifier: project.identifier,
        orgIdentifier: project.orgIdentifier || /* istanbul ignore next */ '',
        accountId
      })
    )
  }

  const handleCF = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCFFeatureFlags({
        projectIdentifier: project.identifier,
        orgIdentifier: project.orgIdentifier || /* istanbul ignore next */ '',
        accountId
      })
    )
  }
  const handleCI = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCIProjectOverview({
        projectIdentifier: project.identifier,
        orgIdentifier: project.orgIdentifier || /* istanbul ignore next */ '',
        accountId
      })
    )
  }
  const handleCE = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCECORules({
        projectIdentifier: project.identifier,
        orgIdentifier: project.orgIdentifier || /* istanbul ignore next */ '',
        accountId
      })
    )
  }

  return (
    <Menu style={{ minWidth: 'unset' }}>
      {project.modules?.includes(ModuleName.CD) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="cd-main" />
              <Text color={Color.WHITE}>{getString('projectsOrgs.gotoCD')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCD}
        />
      ) : null}
      {project.modules?.includes(ModuleName.CV) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="cv-main" />
              <Text color={Color.WHITE}>{getString('projectsOrgs.gotoCV')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCV}
        />
      ) : null}
      {project.modules?.includes(ModuleName.CI) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="ci-main" />
              <Text color={Color.WHITE}>{getString('projectsOrgs.gotoCI')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCI}
        />
      ) : null}
      {project.modules?.includes(ModuleName.CF) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="cf-main" />
              <Text color={Color.WHITE}>{getString('projectsOrgs.gotoCF')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCF}
        />
      ) : null}
      {project.modules?.includes(ModuleName.CE) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="ce-main" />
              <Text color={Color.WHITE}>{getString('projectsOrgs.gotoCE')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCE}
        />
      ) : null}
      <RbacMenuItem
        icon="edit"
        text={getString('edit')}
        onClick={handleEdit}
        data-testid={'edit-project'}
        permission={{
          ...permissionRequest,
          permission: PermissionIdentifier.UPDATE_PROJECT
        }}
      />
      <RbacMenuItem
        icon="new-person"
        text={getString('projectsOrgs.invite')}
        onClick={handleCollaborate}
        permission={{
          resourceScope: {
            accountIdentifier: accountId,
            orgIdentifier: project.orgIdentifier,
            projectIdentifier: project.identifier
          },
          resource: {
            resourceType: ResourceType.USER
          },
          permission: PermissionIdentifier.INVITE_USER
        }}
      />
      <>
        <Menu.Divider />
        <RbacMenuItem
          icon="trash"
          text={getString('delete')}
          onClick={handleDelete}
          permission={{
            ...permissionRequest,
            permission: PermissionIdentifier.DELETE_PROJECT
          }}
        />
      </>
    </Menu>
  )
}

export default ContextMenu
