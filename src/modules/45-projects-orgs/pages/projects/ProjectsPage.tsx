import React, { useState, useMemo, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, Text, Layout, SelectOption, ExpandingSearchInput, Color, Container } from '@wings-software/uicore'

import { Select } from '@blueprintjs/select'
import { Menu } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useQueryParams } from '@common/hooks'
import {
  useGetActivityStatsByProjects,
  useGetOrganizationList,
  useGetProjectAggregateDTOList,
  ResponsePageProjectAggregateDTO,
  ProjectAggregateDTO
} from 'services/cd-ng'
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
  const [sortedProjectIdsByActivities, setSortedProjectIdsByActivities] = useState<string[]>()
  const [sortedProjectResponse, setSortedProjectResponse] = useState<ResponsePageProjectAggregateDTO>({})
  const [appliedCategories, setAppliedCategories] = useState<string[]>()

  const ACTIVITY_TYPES = {
    VIEW_PROJECT: 'VIEW_PROJECT',
    VIEW_RESOURCE: 'VIEW_RESOURCE',
    CREATE_RESOURCE: 'CREATE_RESOURCE',
    UPDATE_RESOURCE: 'UPDATE_RESOURCE',
    RUN_PIPELINE: 'RUN_PIPELINE',
    CREATE_PIPELINE: 'CREATE_PIPELINE',
    UPDATE_PIPELINE: 'UPDATE_PIPELINE',
    VIEW_PIPELINE: 'VIEW_PIPELINE',
    ALL: 'ALL'
  }

  const ACTIVITY_CATEGORY_VALUE = {
    OVERALL: 'OVERALL',
    USAGE: 'USAGE',
    VISIBILITY: 'VISIBILITY',
    DEPLOYMENT_ACTIVITY: 'DEPLOYMENT_ACTIVITY'
  }

  const ACTIVITY_CATEGORY_LABEL = {
    OVERALL: 'Overall',
    USAGE: 'Usage',
    VISIBILITY: 'Visibility',
    DEPLOYMENT_ACTIVITY: 'Deployment Activity'
  }

  const OVERALL_CATEGORY_GROUP = [
    ACTIVITY_TYPES.VIEW_PROJECT,
    ACTIVITY_TYPES.VIEW_RESOURCE,
    ACTIVITY_TYPES.CREATE_RESOURCE,
    ACTIVITY_TYPES.UPDATE_RESOURCE,
    ACTIVITY_TYPES.RUN_PIPELINE,
    ACTIVITY_TYPES.CREATE_PIPELINE,
    ACTIVITY_TYPES.UPDATE_PIPELINE,
    ACTIVITY_TYPES.VIEW_PIPELINE
  ]
  const USAGE_CATEGORY_GROUP = [
    ACTIVITY_TYPES.CREATE_RESOURCE,
    ACTIVITY_TYPES.UPDATE_RESOURCE,
    ACTIVITY_TYPES.CREATE_PIPELINE,
    ACTIVITY_TYPES.UPDATE_PIPELINE
  ]
  const VISIBILITY_CATEGORY_GROUP = [
    ACTIVITY_TYPES.VIEW_PROJECT,
    ACTIVITY_TYPES.VIEW_RESOURCE,
    ACTIVITY_TYPES.VIEW_PIPELINE
  ]
  const DEPLOYMENT_ACTIVITY_CATEGORY_GROUP = [ACTIVITY_TYPES.RUN_PIPELINE]

  const CATEGORY_GROUP = {
    OVERALL: OVERALL_CATEGORY_GROUP,
    USAGE: USAGE_CATEGORY_GROUP,
    VISIBILITY: VISIBILITY_CATEGORY_GROUP,
    DEPLOYMENT_ACTIVITY: DEPLOYMENT_ACTIVITY_CATEGORY_GROUP
  }
  const { currentUserInfo } = useAppStore()
  const [sortBy, setSortBy] = useState<SelectOption>({
    label: ACTIVITY_CATEGORY_LABEL.OVERALL,
    value: ACTIVITY_CATEGORY_VALUE.OVERALL
  })

  const endTime = useMemo(() => Date.now(), [])
  const startTime = endTime - 2592000000

  const { loading: fetchingProjectActivities, data: projectActivities } = useGetActivityStatsByProjects({
    queryParams: {
      userId: currentUserInfo?.uuid,
      startTime,
      endTime
    }
  })

  React.useEffect(() => {
    let formattedData = (projectActivities?.data?.activityHistoryByUserList || []).map(
      (activityHistoryByUser, index) => {
        let total = 0
        const dataItems = (activityHistoryByUser.activityStatsPerTimestampList || []).map(activityStatsPerTimestamp => {
          if (sortBy.value === ACTIVITY_CATEGORY_VALUE.OVERALL) {
            total += activityStatsPerTimestamp.totalCount || 0
            return {
              x: activityStatsPerTimestamp?.timestamp,
              y: activityStatsPerTimestamp.totalCount
            }
          }
          const matching = (activityStatsPerTimestamp?.countPerActivityTypeList || []).filter(item => {
            let categories
            switch (sortBy.value) {
              case ACTIVITY_CATEGORY_VALUE.OVERALL:
                categories = CATEGORY_GROUP.OVERALL
                break
              case ACTIVITY_CATEGORY_VALUE.USAGE:
                categories = CATEGORY_GROUP.USAGE
                break
              case ACTIVITY_CATEGORY_VALUE.VISIBILITY:
                categories = CATEGORY_GROUP.VISIBILITY
                break
              case ACTIVITY_CATEGORY_VALUE.DEPLOYMENT_ACTIVITY:
                categories = CATEGORY_GROUP.DEPLOYMENT_ACTIVITY
                break
              default:
                break
            }
            setAppliedCategories(categories)
            return (categories || []).includes(item.activityType || '')
          })
          // if (matching.length) {
          //   total += matching[0].count || 0
          //   return {
          //     x: activityStatsPerTimestamp?.timestamp,
          //     y: matching[0].count
          //   }
          // }
          if (matching.length) {
            const matchingSum = matching.reduce((prev, curr) => prev + (curr.count || 0), 0)
            total += matchingSum
            return {
              x: activityStatsPerTimestamp?.timestamp,
              y: matchingSum
            }
          }
          return {
            x: activityStatsPerTimestamp?.timestamp,
            y: 0
          }
        })
        dataItems.sort((itemA, itemB) => (itemA.x && itemB.x && itemA.x < itemB.x ? -1 : 1))
        return {
          projectId: activityHistoryByUser.projectId,
          total,
          data: dataItems,
          index
        }
      }
    )
    formattedData.sort((itemA, itemB) => (itemA.total < itemB.total ? 1 : -1))
    formattedData = formattedData.map((value, index) => ({ ...value, index }))
    setSortedProjectIdsByActivities(formattedData.map(formattedData => formattedData.projectId || ''))
  }, [sortBy, fetchingProjectActivities])

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

  React.useEffect(() => {
    let sortedProjects: ProjectAggregateDTO[] = []
    sortedProjectIdsByActivities?.forEach(projectId => {
      const project = data?.data?.content?.find(
        project => project?.projectResponse?.project?.identifier === projectId
      ) as ProjectAggregateDTO
      sortedProjects.push(project)
    })

    let sortedProjectResponse = data
    if (sortedProjectResponse?.data?.content) {
      sortedProjectResponse['data']['content'] = sortedProjects
    }
    setSortedProjectResponse(sortedProjectResponse || {})
  }, [sortedProjectIdsByActivities])

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
            {
              label: ACTIVITY_CATEGORY_LABEL.OVERALL,
              value: ACTIVITY_CATEGORY_VALUE.OVERALL
            },
            {
              label: ACTIVITY_CATEGORY_LABEL.USAGE,
              value: ACTIVITY_CATEGORY_VALUE.USAGE
            },
            {
              label: ACTIVITY_CATEGORY_LABEL.VISIBILITY,
              value: ACTIVITY_CATEGORY_VALUE.VISIBILITY
            },
            {
              label: ACTIVITY_CATEGORY_LABEL.DEPLOYMENT_ACTIVITY,
              value: ACTIVITY_CATEGORY_VALUE.DEPLOYMENT_ACTIVITY
            }
          ]}
          filterable={false}
          itemRenderer={(item, { handleClick }) => (
            <div key={item.value.toString()}>
              <Menu.Item text={item.label} onClick={handleClick} />
            </div>
          )}
          onItemSelect={item => {
            window.sortedBy = item
            setSortBy(item)
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
        loading={loading || fetchingProjectActivities}
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
            data={sortedProjectResponse?.data?.content?.length ? sortedProjectResponse : data}
            showEditProject={showEditProject}
            collaborators={showCollaborators}
            reloadPage={refetch}
            gotoPage={(pageNumber: number) => setPage(pageNumber)}
            categories={appliedCategories || []}
          />
        ) : null}
        {view === Views.LIST ? (
          <ProjectsListView
            data={sortedProjectResponse?.data?.content?.length ? sortedProjectResponse : data}
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
