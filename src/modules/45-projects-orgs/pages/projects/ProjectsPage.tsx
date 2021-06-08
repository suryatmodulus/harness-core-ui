import React, { useState, useMemo, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Text, Layout, SelectOption, ExpandingSearchInput, Color, Container } from '@wings-software/uicore'

import { Select } from '@blueprintjs/select'
import { Menu } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import { useGetActivityStatsByProjects, useGetOrganizationList, useGetProjectAggregateDTOList } from 'services/cd-ng'
import type { Project } from 'services/cd-ng'
import { Page } from '@common/components/Page/Page'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { AccountPathProps, OrgPathProps } from '@common/interfaces/RouteInterfaces'
import { EmailVerificationBanner } from '@common/components/Banners/EmailVerificationBanner'
import { Views } from './Constants'
import ProjectsListView from './views/ProjectListView/ProjectListView'
import ProjectsGridView from './views/ProjectGridView/ProjectGridView'
import css from './ProjectsPage.module.scss'

const CustomSelect = Select.ofType<SelectOption>()

const ProjectsListPage: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()
  const { orgIdentifier } = useQueryParams<OrgPathProps>()
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
  const [sortBy, setSortBy] = useState<SelectOption>({ label: 'None', value: 'NONE' })

  const { data: orgsData } = useGetOrganizationList({
    queryParams: {
      accountIdentifier: accountId
    }
  })

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

  const bodyClassName = user.emailVerified ? css.noBanner : css.hasBanner

  const { currentUserInfo } = useAppStore()

  const now = Date.now()
  const thirtyDaysAgo = now - 2592000000

  const { loading: loadingx, data: datax } = useGetActivityStatsByProjects({
    queryParams: {
      userId: currentUserInfo?.uuid,
      startTime: now,
      endTime: thirtyDaysAgo
    }
  })

  // let formattedData = (data?.data?.activityHistoryByUserList || []).map((activityHistoryByUser, index) => {
  //   let total = 0
  //   const dataItems = (activityHistoryByUser.activityStatsPerTimestampList || []).map(activityStatsPerTimestamp => {
  //     if (activityType === ACTIVITY_TYPES_ENUM.ALL) {
  //       total += activityStatsPerTimestamp.totalCount || 0
  //       return {
  //         x: activityStatsPerTimestamp?.timestamp,
  //         y: activityStatsPerTimestamp.totalCount
  //       }
  //     }
  //     const matching = (activityStatsPerTimestamp?.countPerActivityTypeList || []).filter(
  //       item => item.activityType === activityType
  //     )
  //     if (matching.length) {
  //       total += matching[0].count || 0
  //       return {
  //         x: activityStatsPerTimestamp?.timestamp,
  //         y: matching[0].count
  //       }
  //     }
  //     return {
  //       x: activityStatsPerTimestamp?.timestamp,
  //       y: 0
  //     }
  //   })
  //   dataItems.sort((itemA, itemB) => (itemA.x && itemB.x && itemA.x < itemB.x ? -1 : 1))
  //   return {
  //     userId: activityHistoryByUser.userId,
  //     total,
  //     data: dataItems,
  //     index
  //   }
  // })
  // formattedData.sort((itemA, itemB) => (itemA.total < itemB.total ? -1 : 1))
  // formattedData = formattedData.map((value, index) => ({ ...value, index }))

  return (
    <Container className={css.projectsPage}>
      <EmailVerificationBanner />
      <Page.Header title={getString('projectsText')} />
      <Layout.Horizontal spacing="large" className={css.header}>
        <Button intent="primary" text={getString('projectLabel')} icon="plus" onClick={() => openProjectModal()} />
        <CustomSelect
          items={organizations}
          filterable={false}
          itemRenderer={(item, { handleClick }) => (
            <div key={item.value.toString()}>
              <Menu.Item text={item.label} onClick={handleClick} />
            </div>
          )}
          onItemSelect={item => {
            history.push({
              pathname: routes.toProjects({ accountId }),
              search: `?orgIdentifier=${item.value.toString()}`
            })
          }}
          popoverProps={{ minimal: true, popoverClassName: css.customselect }}
        >
          <Button
            inline
            round
            rightIcon="chevron-down"
            className={css.orgSelect}
            text={
              <Layout.Horizontal spacing="xsmall">
                <Text color={Color.BLACK}>{getString('projectsOrgs.tabOrgs')}</Text>
                <Text>{orgFilter.label}</Text>
              </Layout.Horizontal>
            }
          />
        </CustomSelect>

        <CustomSelect
          items={[
            { label: 'Overall', value: 'OVERALL' },
            { label: 'Usage', value: 'USAGE' },
            { label: 'Visibility', value: 'VISIBILITY' },
            { label: 'Deployment Activity', value: 'DEPLOYMENT_ACTIVITY' }
          ]}
          filterable={false}
          itemRenderer={(item, { handleClick }) => (
            <div key={item.value.toString()}>
              <Menu.Item text={item.label} onClick={handleClick} />
            </div>
          )}
          onItemSelect={item => setSortBy(item)}
          popoverProps={{ minimal: true, popoverClassName: css.customselect }}
        >
          <Button
            inline
            round
            rightIcon="chevron-down"
            className={css.orgSelect}
            text={
              <Layout.Horizontal spacing="xsmall">
                <Text color={Color.BLACK}>{'Sort by'}</Text>
                <Text>{sortBy.label}</Text>
              </Layout.Horizontal>
            }
          />
        </CustomSelect>

        <div style={{ flex: 1 }}></div>

        <ExpandingSearchInput
          placeholder={getString('projectsOrgs.search')}
          onChange={text => {
            setSearchParam(text.trim())
          }}
          className={css.search}
        />

        <Layout.Horizontal>
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
