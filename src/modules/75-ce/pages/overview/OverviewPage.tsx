import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { Container } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import { Page } from '@common/components/Page/Page'
import {
  CcmMetaData,
  QlceViewAggregateOperation,
  StatsInfo,
  useFetchCcmMetaDataQuery,
  useFetchPerspectiveDetailsSummaryQuery,
  useFetchPerspectiveForecastCostQuery
} from 'services/ce/services'
import { getTimeFilters } from '@ce/utils/perspectiveUtils'
import { CE_DATE_FORMAT_INTERNAL, DATE_RANGE_SHORTCUTS, getGMTStartDateTime } from '@ce/utils/momentUtils'
import { AGGREGATE_FUNCTION } from '@ce/components/PerspectiveGrid/Columns'
import OverviewClusterCostBreakdown from '@ce/components/OverviewPage/OverviewClusterCostBreakdown'
import OverviewCloudCost, { OverviewLayout } from '@ce/components/OverviewPage/OverviewCloudCost'
import OverviewSummary from '@ce/components/OverviewPage/OverviewSummary'
import OverviewTopCluster from '@ce/components/OverviewPage/OverviewTopClusters'
import OverviewTopRecommendations from '@ce/components/OverviewPage/OverviewTopRecommendations'
import OverviewCostByProviders from '@ce/components/OverviewPage/OverviewCostByProviders'
import PerspectiveTimeRangePicker from '@ce/components/PerspectiveTimeRangePicker/PerspectiveTimeRangePicker'
import { PageSpinner } from '@common/components'
import OverviewAddCluster from '@ce/components/OverviewPage/OverviewAddCluster'
import { Utils } from '@ce/common/Utils'
import { useCreateConnectorMinimal } from '@ce/components/CreateConnector/CreateConnector'
import NoData from '@ce/components/OverviewPage/OverviewNoData'
import type { TrialBannerProps } from '@common/components/HomePageTemplate/HomePageTemplate'
import { TrialLicenseBanner } from '@common/components/Banners/TrialLicenseBanner'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetLicensesAndSummary } from 'services/cd-ng'
import type { AccountPathProps, Module } from '@common/interfaces/RouteInterfaces'
import { handleUpdateLicenseStore, useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import bgImage from './images/CD/overviewBg.png'
import css from './Overview.module.scss'

export interface TimeRange {
  to: string
  from: string
}

interface NoDataOverviewPageProps {
  showConnectorModal?: boolean
  trialBannerProps: TrialBannerProps
}

const NoDataOverviewPage: React.FC<NoDataOverviewPageProps> = (props: NoDataOverviewPageProps) => {
  const { showConnectorModal, trialBannerProps } = props

  const [showBanner, setShowBanner] = useState(true)

  const bannerClassName = showBanner ? css.hasBanner : css.hasNoBanner

  // Only one will be shown at a time.
  // If the props says showConnectorModal = true,
  // the NoDataOverlay will not be shown
  const [showNoDataOverlay, setShowNoDataOverlay] = useState(!showConnectorModal)
  const { openModal, closeModal } = useCreateConnectorMinimal({
    portalClassName: css.excludeSideNavOverlay,
    onSuccess: () => {
      closeModal()
    }
  })

  useEffect(() => {
    showConnectorModal && openModal()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleClick = (): void => {
    setShowNoDataOverlay(false)
    openModal()
  }

  return (
    <>
      <TrialLicenseBanner {...trialBannerProps} setHasBanner={setShowBanner} />
      <div
        className={cx(css.body, bannerClassName)}
        style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', height: '100%', width: '100%' }}
      >
        {showNoDataOverlay && <NoData onConnectorCreateClick={handleClick} />}
      </div>
    </>
  )
}

const OverviewPage: React.FC = () => {
  const { accountId } = useParams<AccountPathProps>()

  const [timeRange, setTimeRange] = useState<TimeRange>({
    to: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[1].format(CE_DATE_FORMAT_INTERNAL),
    from: DATE_RANGE_SHORTCUTS.LAST_30_DAYS[0].format(CE_DATE_FORMAT_INTERNAL)
  })

  const { licenseInformation, updateLicenseStore } = useLicenseStore()
  const [showBanner, setShowBanner] = useState(true)

  const bannerClassName = showBanner ? css.hasBanner : css.hasNoBanner

  const [summaryResult] = useFetchPerspectiveDetailsSummaryQuery({
    variables: {
      isClusterQuery: false,
      aggregateFunction: [
        { operationType: QlceViewAggregateOperation.Sum, columnName: 'cost' },
        { operationType: QlceViewAggregateOperation.Max, columnName: 'startTime' },
        { operationType: QlceViewAggregateOperation.Min, columnName: 'startTime' }
      ],
      filters: [...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTStartDateTime(timeRange.to))]
    }
  })

  const [forecastedCostResult] = useFetchPerspectiveForecastCostQuery({
    variables: {
      aggregateFunction: AGGREGATE_FUNCTION.DEFAULT,
      filters: [...getTimeFilters(getGMTStartDateTime(timeRange.from), getGMTStartDateTime(timeRange.to))]
    }
  })

  const { data: summaryData, fetching: summaryFetching } = summaryResult
  const cloudCost = (summaryData?.perspectiveTrendStats?.cost || {}) as StatsInfo

  const { data: forecastedCostData, fetching: forecastedCostFetching } = forecastedCostResult
  const forecastedCost = (forecastedCostData?.perspectiveForecastCost?.cost || {}) as StatsInfo

  const { data, refetch, loading } = useGetLicensesAndSummary({
    queryParams: { moduleType: ModuleName.CE as any },
    accountIdentifier: accountId
  })

  const expiryTime = data?.data?.maxExpiryTime
  const updatedLicenseInfo = data?.data && {
    ...licenseInformation?.['CE'],
    ...pick(data?.data, ['licenseType', 'edition']),
    expiryTime
  }

  useEffect(() => {
    handleUpdateLicenseStore(
      { ...licenseInformation },
      updateLicenseStore,
      ModuleName.CE.toString() as Module,
      updatedLicenseInfo
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const [ccmMetaResult, refetchCCMMetaData] = useFetchCcmMetaDataQuery()
  const { data: ccmData, fetching: fetchingCCMMetaData } = ccmMetaResult
  const {
    cloudDataPresent,
    clusterDataPresent,
    defaultAwsPerspectiveId,
    defaultAzurePerspectiveId,
    defaultClusterPerspectiveId,
    defaultGcpPerspectiveId
  } = (ccmData?.ccmMetaData || {}) as CcmMetaData

  if (fetchingCCMMetaData || loading) {
    return <PageSpinner />
  }

  const trialBannerProps = {
    expiryTime: data?.data?.maxExpiryTime,
    licenseType: data?.data?.licenseType,
    module: ModuleName.CE,
    refetch
  }

  if (ccmData && !Utils.accountHasConnectors(ccmData.ccmMetaData as CcmMetaData)) {
    return <NoDataOverviewPage trialBannerProps={trialBannerProps} showConnectorModal />
  }

  if (ccmData && !cloudDataPresent && !clusterDataPresent) {
    return <NoDataOverviewPage trialBannerProps={trialBannerProps} />
  }

  return (
    <>
      <TrialLicenseBanner {...trialBannerProps} setHasBanner={setShowBanner} />
      <Container className={cx(css.body, bannerClassName)}>
        <Page.Header
          title="Overview"
          content={<PerspectiveTimeRangePicker timeRange={timeRange} setTimeRange={setTimeRange} />}
        />
        <Page.Body>
          <Container padding={{ top: 'medium', right: 'xlarge', bottom: 'medium', left: 'xlarge' }}>
            <div className={css.mainContainer}>
              <div className={css.columnOne}>
                <div className={cx(css.summary, css.noColor)}>
                  <OverviewSummary cost={cloudCost} fetching={summaryFetching} />
                  <OverviewSummary cost={forecastedCost} fetching={forecastedCostFetching} />
                </div>
                {clusterDataPresent && (
                  <OverviewClusterCostBreakdown
                    timeRange={timeRange}
                    defaultClusterPerspectiveId={defaultClusterPerspectiveId}
                  />
                )}
                {!clusterDataPresent && cloudDataPresent && (
                  <OverviewCloudCost
                    layout={OverviewLayout.VERTICAL}
                    timeRange={timeRange}
                    providers={{
                      defaultAwsPerspectiveId,
                      defaultAzurePerspectiveId,
                      defaultGcpPerspectiveId
                    }}
                  />
                )}
                {clusterDataPresent && cloudDataPresent && (
                  <OverviewCloudCost
                    layout={OverviewLayout.HORIZONTAL}
                    timeRange={timeRange}
                    providers={{
                      defaultAwsPerspectiveId,
                      defaultAzurePerspectiveId,
                      defaultGcpPerspectiveId
                    }}
                  />
                )}
                {!cloudDataPresent && clusterDataPresent && <OverviewTopCluster timeRange={timeRange} />}
              </div>
              <div className={css.columnTwo}>
                <OverviewCostByProviders timeRange={timeRange} clusterDataPresent={clusterDataPresent} />
                {clusterDataPresent && <OverviewTopRecommendations />}
                {/* <div>PUT AUTOSTOPPING COMPONENT HERE</div> */}
              </div>
            </div>
            {!clusterDataPresent && (
              <OverviewAddCluster
                onAddClusterSuccess={() => {
                  refetchCCMMetaData({ requestPolicy: 'network-only' })
                }}
              />
            )}
          </Container>
        </Page.Body>
      </Container>
    </>
  )
}

export default OverviewPage
