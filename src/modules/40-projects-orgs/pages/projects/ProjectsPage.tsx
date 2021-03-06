import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Text, Layout, SelectOption, Link, ExpandingSearchInput } from '@wings-software/uicore'

import { Select } from '@blueprintjs/select'
import { Menu } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'

import { useGetOrganizationList, useGetProjectAggregateDTOList } from 'services/cd-ng'
import type { Project } from 'services/cd-ng'
import { Page } from '@common/components/Page/Page'
import { useQueryParams } from '@common/hooks'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/exports'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import i18n from './ProjectsPage.i18n'
import { Views } from './Constants'
import ProjectsListView from './views/ProjectListView/ProjectListView'
import ProjectsGridView from './views/ProjectGridView/ProjectGridView'
import css from './ProjectsPage.module.scss'

const allOrgsSelectOption: SelectOption = {
  label: i18n.orgLabel,
  value: i18n.orgLabel.toUpperCase()
}

const CustomSelect = Select.ofType<SelectOption>()

const ProjectsListPage: React.FC = () => {
  const { accountId } = useParams()
  const { orgId } = useQueryParams()
  const { getString } = useStrings()
  useDocumentTitle(getString('projectsText'))
  const [view, setView] = useState(Views.GRID)
  const [searchParam, setSearchParam] = useState<string>()
  const [page, setPage] = useState(0)
  const history = useHistory()
  let orgFilter = allOrgsSelectOption

  // const [canCreate] = usePermission({
  //   actions: ['create'],
  //   accountIdentifier: accountId,
  //   resourceType: ResourceType.PROJECT
  // })

  const { data: orgsData } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const organizations: SelectOption[] = [
    allOrgsSelectOption,
    ...(orgsData?.data?.content?.map(org => {
      org.organization.identifier === orgId
        ? (orgFilter = {
            label: org.organization.name as string,
            value: org.organization.identifier as string
          })
        : null
      return {
        label: org.organization.name as string,
        value: org.organization.identifier as string
      }
    }) || [])
  ]

  React.useEffect(() => {
    setPage(0)
  }, [searchParam, orgFilter])

  const { data, loading, refetch, error } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgFilter.value == 'ALL' ? undefined : orgFilter.value.toString(),
      searchTerm: searchParam,
      pageIndex: page,
      pageSize: 10
    },
    debounce: 300
  })

  const projectCreateSuccessHandler = (): void => {
    refetch()
  }

  const { openProjectModal } = useProjectModal({
    onSuccess: projectCreateSuccessHandler
  })

  const showEditProject = (project: Project): void => {
    openProjectModal(project)
  }

  const { openCollaboratorModal } = useCollaboratorModal()

  const showCollaborators = (project: Project): void => {
    openCollaboratorModal({ projectIdentifier: project.identifier, orgIdentifier: project.orgIdentifier || 'default' })
  }

  return (
    <>
      <Page.Header
        title={i18n.projects}
        content={
          <Link
            withoutHref
            onClick={() => {
              history.push(routes.toProjectsGetStarted({ accountId }))
            }}
          >
            {i18n.getNewProjectStarted}
          </Link>
        }
      />

      <>
        <Layout.Horizontal className={css.header}>
          <Layout.Horizontal width="55%">
            <Button
              intent="primary"
              text={i18n.newProject}
              icon="plus"
              onClick={() => openProjectModal()}
              // disabled={!canCreate}
            />
          </Layout.Horizontal>

          <Layout.Horizontal spacing="small" width="45%" className={css.headerLayout}>
            <Layout.Horizontal flex>
              <ExpandingSearchInput
                placeholder={i18n.search}
                onChange={text => {
                  setSearchParam(text.trim())
                }}
                className={css.search}
              />
            </Layout.Horizontal>

            <Text>{i18n.tabOrgs}</Text>
            <CustomSelect
              items={organizations}
              filterable={false}
              itemRenderer={(item, { handleClick }) => (
                <div key={item.value.toString()}>
                  <Menu.Item text={item.label} onClick={handleClick} />
                </div>
              )}
              onItemSelect={item => {
                orgFilter = item
                history.push({
                  pathname: routes.toProjects({ accountId }),
                  search: `?orgId=${orgFilter.value.toString()}`
                })
              }}
              popoverProps={{ minimal: true, popoverClassName: css.customselect }}
            >
              <Button inline minimal rightIcon="chevron-down" text={orgFilter.label} className={css.orgSelect} />
            </CustomSelect>

            <Layout.Horizontal inline>
              <Button
                minimal
                icon="grid-view"
                intent={view === Views.GRID ? 'primary' : 'none'}
                onClick={() => {
                  setView(Views.GRID)
                }}
              />
              <Button
                minimal
                icon="list"
                intent={view === Views.LIST ? 'primary' : 'none'}
                onClick={() => {
                  setView(Views.LIST)
                }}
              />
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Layout.Horizontal>
        <Page.Body
          loading={loading}
          retryOnError={() => refetch()}
          error={(error?.data as Error)?.message || error?.message}
          noData={
            !searchParam && openProjectModal
              ? {
                  when: () => !data?.data?.content?.length,
                  icon: 'nav-project',
                  message: getString('projectDescription'),
                  buttonText: getString('addProject'),
                  onClick: () => openProjectModal?.()
                }
              : {
                  when: () => !data?.data?.content?.length,
                  icon: 'nav-project',
                  message: getString('noProjects')
                }
          }
          className={css.pageContainer}
        >
          {view === Views.GRID ? (
            <ProjectsGridView
              data={data}
              showEditProject={showEditProject}
              collaborators={showCollaborators}
              reloadPage={refetch}
              gotoPage={(pageNumber: number) => setPage(pageNumber)}
            />
          ) : null}
          {view === Views.LIST ? (
            <ProjectsListView
              data={data}
              showEditProject={showEditProject}
              collaborators={showCollaborators}
              reloadPage={refetch}
              gotoPage={(pageNumber: number) => setPage(pageNumber)}
            />
          ) : null}
        </Page.Body>
      </>
    </>
  )
}

export default ProjectsListPage
