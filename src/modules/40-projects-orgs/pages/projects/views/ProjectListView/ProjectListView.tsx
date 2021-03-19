import React, { useState, useMemo } from 'react'
import ReactTimeago from 'react-timeago'
import { Text, Layout, Color, Icon, Button, Popover, AvatarGroup } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import { Classes, Position } from '@blueprintjs/core'
import { useHistory, useParams } from 'react-router-dom'
import type { Project, ProjectAggregateDTO, ResponsePageProjectAggregateDTO } from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import routes from '@common/RouteDefinitions'
import TagsPopover from '@common/components/TagsPopover/TagsPopover'
import { ModuleName, String, useStrings } from 'framework/exports'
import ContextMenu from '@projects-orgs/components/Menu/ContextMenu'
import { getModuleIcon } from '@projects-orgs/utils/utils'
import useDeleteProjectDialog from '../../DeleteProject'
import css from './ProjectListView.module.scss'

interface ProjectListViewProps {
  data: ResponsePageProjectAggregateDTO | null
  showEditProject?: (project: Project) => void
  collaborators?: (project: Project) => void
  reloadPage: () => Promise<void>
  gotoPage: (index: number) => void
}

type CustomColumn<T extends object> = Column<T> & {
  refetchProjects?: () => Promise<void>
  editProject?: (project: Project) => void
  collaborators?: (project: Project) => void
}

const RenderColumnProject: Renderer<CellProps<ProjectAggregateDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <div className={css.colorbox} style={{ backgroundColor: `${data.projectResponse.project.color}` }} />
      <Layout.Vertical padding={{ left: 'small' }} className={css.verticalCenter}>
        <Layout.Horizontal spacing="small">
          <Text color={Color.BLACK} lineClamp={1} className={css.project}>
            {data.projectResponse.project.name}
          </Text>
          {data.projectResponse.project.tags && Object.keys(data.projectResponse.project.tags).length ? (
            <TagsPopover tags={data.projectResponse.project.tags} />
          ) : null}
        </Layout.Horizontal>
        {data.projectResponse.project.description ? (
          <Text color={Color.GREY_400} lineClamp={1} className={css.project}>
            {data.projectResponse.project.description}
          </Text>
        ) : null}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
const RenderColumnOrganization: Renderer<CellProps<ProjectAggregateDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.BLACK} lineClamp={1} className={css.org}>
      {data.organization?.name}
    </Text>
  )
}

const RenderColumnModules: Renderer<CellProps<ProjectAggregateDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="medium">
      {data.projectResponse.project.modules?.length ? (
        data.projectResponse.project.modules.map(module => (
          <Icon name={getModuleIcon(module as ModuleName)} size={20} key={module} />
        ))
      ) : (
        <String stringID="moduleRenderer.start" />
      )}
    </Layout.Horizontal>
  )
}

const RenderColumnActivity: Renderer<CellProps<ProjectAggregateDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <Icon name="activity" />
      {data.projectResponse.lastModifiedAt ? <ReactTimeago date={data.projectResponse.lastModifiedAt} /> : null}
    </Layout.Horizontal>
  )
}
const RenderColumnAdmin: Renderer<CellProps<ProjectAggregateDTO>> = ({ row, column }) => {
  const data = row.original
  return (
    <AvatarGroup
      avatars={data.admins?.length ? data.admins : [{}]}
      onAdd={event => {
        event.stopPropagation()
        const { collaborators } = column as any
        collaborators(data.projectResponse.project)
      }}
    />
  )
}
const RenderColumnCollabrators: Renderer<CellProps<ProjectAggregateDTO>> = ({ row, column }) => {
  const data = row.original
  return (
    <AvatarGroup
      avatars={data.collaborators?.length ? data.collaborators : [{}]}
      onAdd={event => {
        event.stopPropagation()
        const { collaborators } = column as any
        collaborators(data.projectResponse.project)
      }}
    />
  )
}
const RenderColumnMenu: Renderer<CellProps<ProjectAggregateDTO>> = ({ row, column }) => {
  const data = row.original.projectResponse.project
  const [menuOpen, setMenuOpen] = useState(false)
  const onDeleted = (): void => {
    ;(column as any).refetchProjects()
  }
  const { openDialog } = useDeleteProjectDialog(data, onDeleted)

  return (
    <Layout.Horizontal className={css.layout}>
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
          iconProps={{ size: 24 }}
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
          data-testid={`menu-${data.identifier + data.orgIdentifier}`}
        />
        <ContextMenu
          project={data}
          reloadProjects={(column as any).refetchProjects}
          editProject={(column as any).editProject}
          collaborators={(column as any).collaborators}
          setMenuOpen={setMenuOpen}
          openDialog={openDialog}
        />
      </Popover>
    </Layout.Horizontal>
  )
}

const ProjectListView: React.FC<ProjectListViewProps> = props => {
  const { data, showEditProject, collaborators, gotoPage, reloadPage } = props
  const history = useHistory()
  const { accountId } = useParams()
  const { getString } = useStrings()

  const columns: CustomColumn<ProjectAggregateDTO>[] = useMemo(
    () => [
      {
        Header: getString('projectLabel').toUpperCase(),
        id: 'name',
        accessor: row => row.projectResponse.project.name,
        width: '25%',
        Cell: RenderColumnProject
      },
      {
        Header: getString('orgLabel').toUpperCase(),
        id: 'orgName',
        accessor: row => row.projectResponse.project.orgIdentifier,
        width: '15%',
        Cell: RenderColumnOrganization
      },
      {
        Header: getString('modules').toUpperCase(),
        id: 'modules',
        accessor: row => row.projectResponse.project.modules,
        width: '20%',
        Cell: RenderColumnModules,
        disableSortBy: true
      },
      {
        Header: getString('lastActivity').toUpperCase(),
        id: 'status',
        accessor: row => row.projectResponse.lastModifiedAt,
        width: '15%',
        Cell: RenderColumnActivity
      },
      {
        Header: getString('adminLabel').toUpperCase(),
        id: 'admin',
        accessor: row => row.projectResponse.project.color,
        width: '10%',
        Cell: RenderColumnAdmin,
        collaborators: collaborators,
        disableSortBy: true
      },
      {
        Header: getString('collaboratorsLabel').toUpperCase(),
        id: 'collaborators',
        accessor: row => row.projectResponse.createdAt,
        width: '10%',
        Cell: RenderColumnCollabrators,
        collaborators: collaborators,
        disableSortBy: true
      },
      {
        Header: '',
        id: 'menu',
        accessor: row => row.projectResponse.project.identifier,
        width: '5%',
        Cell: RenderColumnMenu,
        refetchProjects: reloadPage,
        editProject: showEditProject,
        collaborators: collaborators,
        disableSortBy: true
      }
    ],
    [reloadPage, showEditProject, collaborators]
  )
  return (
    <Table<ProjectAggregateDTO>
      className={css.table}
      columns={columns}
      data={data?.data?.content || []}
      onRowClick={project => {
        history.push(
          routes.toProjectDetails({
            projectIdentifier: project.projectResponse.project.identifier,
            orgIdentifier: project.projectResponse.project.orgIdentifier || '',
            accountId
          })
        )
      }}
      pagination={{
        itemCount: data?.data?.totalItems || 0,
        pageSize: data?.data?.pageSize || 10,
        pageCount: data?.data?.totalPages || 0,
        pageIndex: data?.data?.pageIndex || 0,
        gotoPage: gotoPage
      }}
    />
  )
}

export default ProjectListView
