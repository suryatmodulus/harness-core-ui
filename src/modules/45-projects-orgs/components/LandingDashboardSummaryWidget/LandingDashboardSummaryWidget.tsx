import React, { useEffect, useState } from 'react'
import { Card, Color, Container, FontVariation, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { TimeRangeToDays, useLandingDashboardContext } from '@common/factories/LandingDashboardContext'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetTopProjects } from 'services/dashboard-service'
import { ModuleName } from 'framework/types/ModuleName'
import {
  StackedSummaryInterface,
  StackedSummaryTable
} from '@common/components/StackedSummaryTable/StackedSummaryTable'
import TimeRangeSelect from '../TimeRangeSelect/TimeRangeSelect'

import DashboardAPIErrorWidget from '../DashboardAPIErrorWidget/DashboardAPIErrorWidget'
import OverviewGlanceCards from '../OverviewGlanceCards/OverviewGlanceCards'
import css from './LandingDashboardSummaryWidget.module.scss'

//Testing with mockdata before API
const getMockDataCD = (days: number) => {
  return [
    {
      label: 'Database project',
      barSectionsData: [{ count: Math.round((510 * days) / 180), color: Color.GREEN_500 }],
      trend: '5%'
    },
    {
      label: 'Payment Platform',
      barSectionsData: [
        { count: Math.round((249 * days) / 180), color: Color.GREEN_500 },
        { count: Math.round((40 * days) / 180), color: Color.RED_500 }
      ],
      trend: '5%'
    },
    {
      label: 'Ecommerce',
      barSectionsData: [
        { count: Math.round((249 * days) / 180), color: Color.GREEN_500 },
        { count: Math.round((40 * days) / 180), color: Color.RED_500 }
      ],
      trend: '-5%'
    },
    {
      label: 'My Project W',
      barSectionsData: [
        { count: Math.round((132 * days) / 180), color: Color.GREEN_500 },
        { count: Math.round((35 * days) / 180), color: Color.RED_500 }
      ],
      trend: '-5%'
    }
  ]
}

const getMockDataCI = (days: number) => {
  return [
    {
      label: 'Database project',
      barSectionsData: [{ count: Math.round((510 * days) / 180), color: Color.PRIMARY_6 }],
      trend: '5%'
    },
    {
      label: 'Payment Platform',
      barSectionsData: [
        { count: Math.round((249 * days) / 180), color: Color.PRIMARY_6 },
        { count: Math.round((40 * days) / 180), color: Color.RED_500 }
      ],
      trend: '5%'
    },
    {
      label: 'Ecommerce',
      barSectionsData: [
        { count: Math.round((156 * days) / 180), color: Color.PRIMARY_6 },
        { count: Math.round((40 * days) / 180), color: Color.RED_500 }
      ],
      trend: '-5%'
    }
  ]
}

const getMockDataCF = (days: number) => {
  return [
    {
      label: 'Database project',
      barSectionsData: [{ count: Math.round((78 * days) / 180), color: Color.ORANGE_500 }]
    },
    {
      label: 'Payment Platform',
      barSectionsData: [{ count: Math.round((65 * days) / 180), color: Color.ORANGE_500 }]
    },
    {
      label: 'Ecommerce',
      barSectionsData: [{ count: Math.round((53 * days) / 180), color: Color.ORANGE_500 }]
    },
    {
      label: 'My Project W',
      barSectionsData: [{ count: Math.round((23 * days) / 180), color: Color.ORANGE_500 }]
    }
  ]
}

const getModuleSummaryHeader = (moduleType: ModuleName): JSX.Element | string => {
  let icon: IconName = 'placeholder'
  let titleId = ''

  switch (moduleType) {
    case ModuleName.CD:
      icon = 'cd-main'
      titleId = 'DEPLOYMENTS'
      break
    case ModuleName.CI:
      icon = 'ci-main'
      titleId = 'BUILDS'
      break
    case ModuleName.CF:
      icon = 'cf-main'
      titleId = 'FEATURE FLAGS'
      break
    default:
  }

  return (
    <Layout.Horizontal spacing="small" margin={{ left: 'large' }} style={{ alignItems: 'center' }}>
      <Icon name={icon}></Icon>
      <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{titleId}</Text>
    </Layout.Horizontal>
  )
}

// interface ProjectSummaryCardData {
//   projectData?: Array<StackedSummaryInterface>
//   error?: any
// }

// const getSummaryCardData = (moduleType: ModuleName, response: TopProjectsPanel | undefined): ProjectSummaryCardData => {
//   let cardData = {}
//   switch (moduleType) {
//     case ModuleName.CD:
//       console.log('_____', JSON.stringify(response?.cdtopProjectsInfo?.response))
//       cardData =
//         response?.cdtopProjectsInfo?.executionStatus === 'SUCCESS'
//           ? {
//               projectData: []
//             }
//           : {}
//   }

//   return cardData
// }

//const renderModuleSummary = (moduleType: ModuleName, responseData: TopProjectsPanel | undefined): JSX.Element => {
const renderModuleSummary = (moduleType: ModuleName, data: Array<StackedSummaryInterface>): JSX.Element => {
  //const data = getSummaryCardData(moduleType, responseData)
  return data?.length ? (
    <StackedSummaryTable
      columnHeaders={['PROJECTS', getModuleSummaryHeader(moduleType)]}
      summaryData={data}
    ></StackedSummaryTable>
  ) : (
    <></>
    // renderNoData(moduleType)
  )
}

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

  useEffect(() => {
    refetch()
  }, [selectedTimeRange, refetch])

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
            ) : !error && response?.data?.executionStatus === 'SUCCESS' ? (
              <Layout.Horizontal>
                {renderModuleSummary(ModuleName.CD, getMockDataCD(TimeRangeToDays[selectedTimeRange]))}
                {renderModuleSummary(ModuleName.CI, getMockDataCI(TimeRangeToDays[selectedTimeRange]))}
                {renderModuleSummary(ModuleName.CF, getMockDataCF(TimeRangeToDays[selectedTimeRange]))}
              </Layout.Horizontal>
            ) : (
              <DashboardAPIErrorWidget
                className={css.topProjectsWrapper}
                callback={refetch}
                iconProps={{ size: 90 }}
              ></DashboardAPIErrorWidget>
            )}
          </Layout.Vertical>
        </Card>
      </Layout.Horizontal>
    </div>
  )
}

export default LandingDashboardSummaryWidget
