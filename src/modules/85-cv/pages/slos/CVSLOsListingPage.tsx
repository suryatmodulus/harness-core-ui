import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Text,
  useToaster,
  ButtonVariation,
  FontVariation,
  CardSelect,
  CardSelectType,
  Card,
  NoDataCard,
  Pagination,
  Layout,
  FlexExpander
} from '@wings-software/uicore'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier, ResourceType } from 'microfrontends'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useDeleteSLOData, useGetAllJourneys, useGetSLODashboardWidgets, UserJourneyDTO } from 'services/cv'
import RbacButton from '@rbac/components/Button/Button'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import {
  PAGE_SIZE_DASHBOARD_WIDGETS,
  LIST_USER_JOURNEYS_OFFSET,
  LIST_USER_JOURNEYS_PAGESIZE
} from './CVSLOsListingPage.constants'
import type { CVSLOsListingPageProps } from './CVSLOsListingPage.types'
import { getUserJourneys } from './CVSLOListingPage.utils'
import SLOCardHeader from './SLOCard/SLOCardHeader'
import SLOCardContent from './SLOCard/SLOCardContent'
import css from './CVSLOsListingPage.module.scss'

const CVSLOsListingPage: React.FC<CVSLOsListingPageProps> = ({ monitoredServiceIdentifier }) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const [selectedUserJourney, setSelectedUserJourney] = useState<UserJourneyDTO>()
  const [pageNumber, setPageNumber] = useState(0)

  useEffect(() => {
    setPageNumber(0)
    setSelectedUserJourney(undefined)
  }, [projectIdentifier])

  const {
    data: dashboardWidgetsResponse,
    loading: dashboardWidgetsLoading,
    refetch: refetchDashboardWidgets,
    error: dashboardWidgetsError
  } = useGetSLODashboardWidgets({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      monitoredServiceIdentifier,
      userJourneyIdentifiers: selectedUserJourney?.identifier ? [selectedUserJourney.identifier] : undefined,
      pageNumber,
      pageSize: PAGE_SIZE_DASHBOARD_WIDGETS
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const {
    content,
    totalItems = 0,
    totalPages = 0,
    pageIndex = 0,
    pageItemCount = 0,
    pageSize = 10
  } = dashboardWidgetsResponse?.data ?? {}

  const {
    data: userJourneysData,
    loading: userJourneysLoading,
    error: userJourneysError,
    refetch: refetchUserJourneys
  } = useGetAllJourneys({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      offset: LIST_USER_JOURNEYS_OFFSET,
      pageSize: LIST_USER_JOURNEYS_PAGESIZE
    }
  })

  const { mutate: deleteSLO, loading: deleteSLOLoading } = useDeleteSLOData({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const onDelete = async (identifier: string, name: string): Promise<void> => {
    try {
      await deleteSLO(identifier)

      if (pageIndex && pageItemCount === 1) {
        setPageNumber(prevPageNumber => prevPageNumber - 1)
      } else {
        await refetchDashboardWidgets()
      }

      showSuccess(getString('cv.slos.sloDeleted', { name }))
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const addNewSLO = (
    <RbacButton
      icon="plus"
      text={getString('cv.slos.newSLO')}
      variation={ButtonVariation.PRIMARY}
      onClick={() => {
        history.push(routes.toCVCreateSLOs({ accountId, orgIdentifier, projectIdentifier }))
      }}
      permission={{
        permission: PermissionIdentifier.EDIT_SLO_SERVICE,
        resource: {
          resourceType: ResourceType.SLO,
          resourceIdentifier: projectIdentifier
        }
      }}
    />
  )

  const onFilter = (userJourney: UserJourneyDTO): void => {
    setPageNumber(0)
    if (selectedUserJourney?.identifier === userJourney.identifier) {
      setSelectedUserJourney(undefined)
    } else {
      setSelectedUserJourney(userJourney)
    }
  }

  return (
    <>
      {!monitoredServiceIdentifier && (
        <>
          <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('cv.slos.title')} />
          <Page.Header title={addNewSLO} />
        </>
      )}

      <Page.Body
        loading={userJourneysLoading || dashboardWidgetsLoading || deleteSLOLoading}
        error={getErrorMessage(dashboardWidgetsError || userJourneysError)}
        retryOnError={() => {
          if (dashboardWidgetsError) {
            refetchDashboardWidgets()
          }
          if (userJourneysError) {
            refetchUserJourneys()
          }
        }}
        noData={{
          when: () => !content?.length && !selectedUserJourney,
          message: getString('cv.slos.noData'),
          icon: 'join-table'
        }}
        className={css.pageBody}
      >
        <Layout.Vertical height="100%" padding={{ top: 'medium', left: 'xlarge', right: 'xlarge', bottom: 'xlarge' }}>
          <CardSelect
            type={CardSelectType.CardView}
            data={getUserJourneys(userJourneysData?.data?.content)}
            cardClassName={css.userJourney}
            renderItem={({ name }) => <Text font={{ variation: FontVariation.FORM_HELP }}>{name}</Text>}
            selected={selectedUserJourney}
            onChange={onFilter}
          />

          {!!content?.length && (
            <>
              <div className={css.sloCardContainer} data-testid="slo-card-container">
                {content.map(serviceLevelObjective => (
                  <Card key={serviceLevelObjective.sloIdentifier} className={css.sloCard}>
                    <SLOCardHeader
                      onDelete={onDelete}
                      serviceLevelObjective={serviceLevelObjective}
                      monitoredServiceIdentifier={monitoredServiceIdentifier}
                    />
                    <SLOCardContent serviceLevelObjective={serviceLevelObjective} />
                  </Card>
                ))}
              </div>
              <FlexExpander />
              <Pagination
                itemCount={totalItems}
                pageCount={totalPages}
                pageIndex={pageIndex}
                pageSize={pageSize}
                gotoPage={setPageNumber}
              />
            </>
          )}

          {!content?.length && !dashboardWidgetsLoading && (
            <NoDataCard icon="join-table" message={getString('cv.slos.noData')} />
          )}
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default CVSLOsListingPage
