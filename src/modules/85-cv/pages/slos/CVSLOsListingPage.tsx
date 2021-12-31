import React, { useEffect, useState, useMemo } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  useToaster,
  ButtonVariation,
  CardSelect,
  CardSelectType,
  Card,
  NoDataCard,
  Pagination,
  Layout,
  FlexExpander,
  DropDown,
  Text
} from '@wings-software/uicore'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier, ResourceType } from 'microfrontends'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import {
  useDeleteSLOData,
  useGetAllJourneys,
  useGetAllMonitoredServicesWithTimeSeriesHealthSources,
  useGetSLODashboardWidgets,
  useGetServiceLevelObjectivesRiskCount,
  RiskCount
} from 'services/cv'
import RbacButton from '@rbac/components/Button/Button'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import SLOCardSelect from './components/SLOCardSelect/SLOCardSelect'
import {
  PAGE_SIZE_DASHBOARD_WIDGETS,
  LIST_USER_JOURNEYS_OFFSET,
  LIST_USER_JOURNEYS_PAGESIZE
} from './CVSLOsListingPage.constants'
import type {
  CVSLOsListingPageProps,
  SLORiskFilter,
  SLITypes,
  SLITypesParams,
  TargetTypes,
  TargetTypesParams,
  RiskTypes
} from './CVSLOsListingPage.types'
import {
  getFilterValueForSLODashboardParams,
  getIsSLODashboardAPIsLoading,
  getMonitoredServicesInitialValue,
  getMonitoredServicesOptionsForFilter,
  getPeriodTypeOptionsForFilter,
  getSliTypeOptionsForFilter,
  getSLORiskTypeFilter,
  getUserJourneyOptionsForFilter
} from './CVSLOListingPage.utils'
import SLOCardHeader from './SLOCard/SLOCardHeader'
import SLOCardContent from './SLOCard/SLOCardContent'
import css from './CVSLOsListingPage.module.scss'

const CVSLOsListingPage: React.FC<CVSLOsListingPageProps> = ({ monitoredServiceIdentifier }) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const [selectedUserJourney, setSelectedUserJourney] = useState<string>(getString('all'))
  const [selectedMonitoredServiceIdentifier, setSelectedMonitoredServiceIdentifier] = useState(
    getMonitoredServicesInitialValue(getString, monitoredServiceIdentifier)
  )

  const [sliTypes, setSelectedSliTypes] = useState<SLITypes>(getString('all') as SLITypes)
  const [targetTypes, setSelectedTargetTypes] = useState<TargetTypes>(getString('all') as TargetTypes)
  const [selectedSLORiskFilter, setSelectedSLORiskFilter] = useState<SLORiskFilter | null>(null)
  const [pageNumber, setPageNumber] = useState(0)

  useEffect(() => {
    setPageNumber(0)
    setSelectedUserJourney(getString('all'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier])

  const pathParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  }, [accountId, orgIdentifier, projectIdentifier])

  const {
    data: dashboardWidgetsResponse,
    loading: dashboardWidgetsLoading,
    refetch: refetchDashboardWidgets,
    error: dashboardWidgetsError
  } = useGetSLODashboardWidgets({
    queryParams: {
      ...pathParams,
      monitoredServiceIdentifier:
        selectedMonitoredServiceIdentifier !== getString('all') ? selectedMonitoredServiceIdentifier : undefined,
      pageNumber,
      pageSize: PAGE_SIZE_DASHBOARD_WIDGETS,
      userJourneyIdentifiers: getFilterValueForSLODashboardParams(getString, selectedUserJourney),
      errorBudgetRisks: getFilterValueForSLODashboardParams(
        getString,
        selectedSLORiskFilter?.identifier
      ) as RiskTypes[],
      sliTypes: getFilterValueForSLODashboardParams(getString, sliTypes) as SLITypesParams[],
      targetTypes: getFilterValueForSLODashboardParams(getString, targetTypes) as TargetTypesParams[]
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const {
    data: riskCountResponse,
    loading: riskCountLoading,
    refetch: refetchRiskCount,
    error: dashboardRiskCountError
  } = useGetServiceLevelObjectivesRiskCount({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      monitoredServiceIdentifier:
        selectedMonitoredServiceIdentifier !== getString('all') ? selectedMonitoredServiceIdentifier : undefined,
      userJourneyIdentifiers: getFilterValueForSLODashboardParams(getString, selectedUserJourney),
      sliTypes: getFilterValueForSLODashboardParams(getString, sliTypes) as SLITypesParams[],
      targetTypes: getFilterValueForSLODashboardParams(getString, targetTypes) as TargetTypesParams[]
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const {
    data: monitoredServicesData,
    loading: monitoredServicesLoading,
    error: monitoredServicesDataError,
    refetch: refetchMonitoredServicesData
  } = useGetAllMonitoredServicesWithTimeSeriesHealthSources({
    queryParams: pathParams
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
      ...pathParams,
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

      await refetchRiskCount()
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

  const onFilter = (currentRiskFilter: SLORiskFilter): void => {
    setPageNumber(0)

    if (selectedSLORiskFilter?.identifier === currentRiskFilter.identifier) {
      setSelectedSLORiskFilter(null)
    } else {
      setSelectedSLORiskFilter(currentRiskFilter)
    }
  }

  const getAllFilters = (): JSX.Element => {
    return (
      <Layout.Horizontal margin={{ bottom: 'medium' }} className={css.sloFilters}>
        <Layout.Vertical width="180px" margin={{ right: 'small' }} data-testid="userJourney-filter">
          <Text>{getString('cv.slos.userJourney')}</Text>
          <DropDown
            placeholder={getString('all')}
            items={getUserJourneyOptionsForFilter(userJourneysData?.data?.content, getString)}
            value={selectedUserJourney}
            onChange={val => {
              setSelectedUserJourney(val.value as string)
            }}
          />
        </Layout.Vertical>
        <Layout.Vertical width="180px" margin={{ right: 'small' }} data-testid="monitoredServices-filter">
          <Text>{getString('cv.monitoredServices.title')}</Text>
          <DropDown
            placeholder={getString('all')}
            items={getMonitoredServicesOptionsForFilter(monitoredServicesData, getString)}
            value={selectedMonitoredServiceIdentifier}
            onChange={({ value }) => {
              setSelectedMonitoredServiceIdentifier(value as string)
            }}
          />
        </Layout.Vertical>
        <Layout.Vertical width="180px" margin={{ right: 'small' }} data-testid="sloTargetAndBudget-filter">
          <Text>{getString('cv.slos.sloTargetAndBudget.periodType')}</Text>
          <DropDown
            placeholder={targetTypes}
            items={getPeriodTypeOptionsForFilter(getString)}
            value={targetTypes}
            onChange={({ value }) => {
              setSelectedTargetTypes(value as TargetTypes)
            }}
          />
        </Layout.Vertical>
        <Layout.Vertical width="180px" margin={{ right: 'small' }} data-testid="sliType-filter">
          <Text>{getString('cv.slos.sliType')}</Text>
          <DropDown
            placeholder={sliTypes}
            items={getSliTypeOptionsForFilter(getString)}
            value={sliTypes}
            onChange={({ value }) => {
              setSelectedSliTypes(value as SLITypes)
            }}
          />
        </Layout.Vertical>
      </Layout.Horizontal>
    )
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
        loading={getIsSLODashboardAPIsLoading(
          userJourneysLoading,
          dashboardWidgetsLoading,
          deleteSLOLoading,
          monitoredServicesLoading,
          riskCountLoading
        )}
        error={getErrorMessage(
          dashboardWidgetsError || userJourneysError || dashboardRiskCountError || monitoredServicesDataError
        )}
        retryOnError={() => {
          if (dashboardWidgetsError) {
            refetchDashboardWidgets()
          }
          if (userJourneysError) {
            refetchUserJourneys()
          }
          if (monitoredServicesDataError) {
            refetchMonitoredServicesData()
          }

          if (dashboardRiskCountError) {
            refetchRiskCount()
          }
        }}
        noData={{
          when: () => !content?.length && !riskCountResponse?.data?.riskCounts?.length,
          message: getString('cv.slos.noData'),
          icon: 'join-table'
        }}
        className={css.pageBody}
      >
        <Layout.Vertical height="100%" padding={{ top: 'medium', left: 'xlarge', right: 'xlarge', bottom: 'xlarge' }}>
          {getAllFilters()}

          <CardSelect<SLORiskFilter>
            type={CardSelectType.CardView}
            data={getSLORiskTypeFilter(
              getString,
              riskCountResponse?.data?.riskCounts as RiskCount[] | undefined,
              riskCountResponse?.data?.totalCount
            )}
            cardClassName={css.sloRiskFilterCard}
            renderItem={({ ...props }) => <SLOCardSelect key={props.identifier} {...props} />}
            selected={selectedSLORiskFilter as SLORiskFilter}
            onChange={onFilter}
          />

          <hr />

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
