import React, { useState } from 'react'
import { Card, Color, Container, FontVariation, Icon, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { TimeRangeToDays, useLandingDashboardContext } from '@common/factories/LandingDashboardContext'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTopProjects } from 'services/dashboard-service'
import TimeRangeSelect from '../TimeRangeSelect/TimeRangeSelect'

import DashboardAPIErrorWidget from '../DashboardAPIErrorWidget/DashboardAPIErrorWidget'
import OverviewGlanceCards from '../OverviewGlanceCards/OverviewGlanceCards'
import css from './LandingDashboardSummaryWidget.module.scss'

const LandingDashboardSummaryWidget: React.FC = () => {
  const { selectedTimeRange } = useLandingDashboardContext()
  const { getString } = useStrings()
  const { accountId } = useParams<ProjectPathProps>()
  const [range] = useState([Date.now() - TimeRangeToDays[selectedTimeRange] * 24 * 60 * 60000, Date.now()])

  const {
    data: response,
    loading,
    error,
    refetch
  } = useGetTopProjects({
    queryParams: {
      accountIdentifier: accountId,
      startTime: range[0],
      endTime: range[1]
    }
  })

  return (
    <div style={{ position: 'relative' }}>
      <TimeRangeSelect className={css.timeRangeSelect} />
      <Layout.Horizontal className={css.atGlanceWrapper} spacing="large">
        <OverviewGlanceCards />
        <Card className={css.topProjectContainer}>
          <Layout.Vertical style={{ height: '100%' }}>
            <Text font={{ variation: FontVariation.CARD_TITLE }}>
              {getString('projectsOrgs.landingDashboard.title')}
            </Text>
            {loading ? (
              <Container className={css.topProjectsWrapper}>
                <Icon name="spinner" size={24} color={Color.PRIMARY_7} flex={{ alignItems: 'center' }} />
              </Container>
            ) : error || response?.data?.executionStatus === 'SUCCESS' ? (
              <DashboardAPIErrorWidget
                className={css.topProjectsWrapper}
                callback={refetch}
                iconProps={{ size: 90 }}
              ></DashboardAPIErrorWidget>
            ) : (
              <></>
            )}
          </Layout.Vertical>
        </Card>
      </Layout.Horizontal>
    </div>
  )
}

export default LandingDashboardSummaryWidget
