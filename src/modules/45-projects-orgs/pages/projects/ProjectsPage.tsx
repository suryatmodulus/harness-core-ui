import React, { useState, useMemo, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Button,
  Layout,
  SelectOption,
  ExpandingSearchInput,
  Container,
  GridListToggle,
  Views,
  ButtonVariation,
  DropDown
} from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import { useGetOrganizationList, useGetProjectAggregateDTOList } from 'services/cd-ng'
import type { Project } from 'services/cd-ng'
import { Page } from '@common/components/Page/Page'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { AccountPathProps, OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { EmailVerificationBanner } from '@common/components/Banners/EmailVerificationBanner'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import ProjectsListView from './views/ProjectListView/ProjectListView'
import ProjectsGridView from './views/ProjectGridView/ProjectGridView'
import ProjectsEmptyState from './projects-empty-state.png'
import css from './ProjectsPage.module.scss'

const ProjectsListPage: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { orgIdentifier } = useQueryParams<OrgPathProps>()
  const { verify } = useQueryParams<{ verify?: boolean }>()
  const { getString } = useStrings()
  useDocumentTitle(getString('projectsText'))
  const [view, setView] = useState(Views.GRID)
  const [searchParam, setSearchParam] = useState<string>()
  const [page, setPage] = useState(0)
  const history = useHistory()
  const { currentUserInfo: user } = useAppStore()

  const allOrgsSelectOption: SelectOption = useMemo(
    () => ({
      label: getString('all'),
      value: getString('projectsOrgs.capsAllValue')
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [orgFilter, setOrgFilter] = useState<SelectOption>(allOrgsSelectOption)

  const { data: orgsData } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { showSuccess } = useToaster()

  useEffect(
    () => {
      if (verify) {
        showSuccess(getString('common.banners.trial.success'))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [verify]
  )

  useEffect(() => {
    if (orgIdentifier === 'ALL' && orgFilter.value !== 'ALL') {
      setOrgFilter(allOrgsSelectOption)
    }
  }, [orgIdentifier, allOrgsSelectOption, orgFilter.value])

  const organizations: SelectOption[] = useMemo(() => {
    return [
      allOrgsSelectOption,
      ...(orgsData?.data?.content?.map(org => {
        if (org.organization.identifier === orgIdentifier) {
          setOrgFilter({
            label: org.organization.name,
            value: org.organization.identifier
          })
        }
        return {
          label: org.organization.name,
          value: org.organization.identifier
        }
      }) || [])
    ]
  }, [orgsData?.data?.content, orgIdentifier, allOrgsSelectOption])

  React.useEffect(() => {
    setPage(0)
  }, [searchParam, orgFilter])

  const { data, loading, refetch, error } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgFilter.value == 'ALL' ? undefined : orgFilter.value.toString(),
      searchTerm: searchParam,
      pageIndex: page,
      pageSize: 50
    },
    debounce: 300
  })

  const projectCreateSuccessHandler = (): void => {
    refetch()
  }

  const { openProjectModal, closeProjectModal } = useProjectModal({
    onSuccess: projectCreateSuccessHandler,
    onWizardComplete: () => {
      closeProjectModal()
      projectCreateSuccessHandler()
    }
  })

  const showEditProject = (project: Project): void => {
    openProjectModal(project)
  }

  const { openCollaboratorModal } = useCollaboratorModal()

  const showCollaborators = (project: Project): void => {
    openCollaboratorModal({ projectIdentifier: project.identifier, orgIdentifier: project.orgIdentifier || 'default' })
  }

  const bodyClassName = user.emailVerified === undefined || user.emailVerified ? css.noBanner : css.hasBanner

  return (
    <Container className={css.projectsPage} height="inherit">
      <EmailVerificationBanner />
      <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('projectsText')} />
      {data?.data?.totalItems || searchParam || loading || error ? (
        <Layout.Horizontal spacing="large" className={css.header}>
          <Button
            variation={ButtonVariation.PRIMARY}
            text={getString('projectLabel')}
            icon="plus"
            onClick={() => openProjectModal()}
          />
          <DropDown
            disabled={loading}
            filterable={false}
            items={organizations}
            value={orgFilter.value.toString()}
            onChange={item => {
              history.push({
                pathname: routes.toProjects({ accountId }),
                search: `?orgIdentifier=${item.value.toString()}`
              })
            }}
            getCustomLabel={item => getString('projectsOrgs.tabOrgs', { name: item.label })}
          />
          <div style={{ flex: 1 }}></div>
          <ExpandingSearchInput
            alwaysExpanded
            onChange={text => {
              setSearchParam(text.trim())
            }}
            width={300}
            className={css.expandSearch}
          />
          <GridListToggle initialSelectedView={Views.GRID} onViewToggle={setView} />
        </Layout.Horizontal>
      ) : null}
      <Page.Body
        loading={loading}
        retryOnError={() => refetch()}
        error={(error?.data as Error)?.message || error?.message}
        noData={
          !searchParam && openProjectModal
            ? {
                when: () => !data?.data?.content?.length,
                image: ProjectsEmptyState,
                imageClassName: css.imageClassName,
                messageTitle: getString('projectsOrgs.youHaveNoProjects'),
                message: getString('projectDescription'),
                buttonText: getString('projectsOrgs.createAProject'),
                onClick: () => openProjectModal?.()
              }
            : {
                when: () => !data?.data?.content?.length,
                image: ProjectsEmptyState,
                imageClassName: css.imageClassName,
                messageTitle: getString('noProjects')
              }
        }
        className={bodyClassName}
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
    </Container>
  )
}

export default ProjectsListPage
