import React from 'react'
import { Card, Color, FontVariation, Layout, Text } from '@wings-software/uicore'
// import { useLandingDashboardContext } from '@common/factories/LandingDashboardContext'
import GlanceCard from '@common/components/GlanceCard/GlanceCard'
import { useStrings } from 'framework/strings'
import {
  StackedSummaryInterface,
  StackedSummaryTable
} from '@common/components/StackedSummaryTable/StackedSummaryTable'
import { ModuleName } from 'framework/types/ModuleName'
import TimeRangeSelect from '../TimeRangeSelect/TimeRangeSelect'

import css from './LandingDashboardSummaryWidget.module.scss'

//Testing with mockdata before API
const mockDataCD = [
  {
    label: 'Database project',
    barSectionsData: [{ count: 510, color: Color.GREEN_500 }],
    trend: '5%'
  },
  {
    label: 'Payment Platform',
    barSectionsData: [
      { count: 249, color: Color.GREEN_500 },
      { count: 40, color: Color.RED_500 }
    ],
    trend: '5%'
  },
  {
    label: 'Ecommerce',
    barSectionsData: [
      { count: 249, color: Color.GREEN_500 },
      { count: 40, color: Color.RED_500 }
    ],
    trend: '-5%'
  },
  {
    label: 'My Project W',
    barSectionsData: [
      { count: 132, color: Color.GREEN_500 },
      { count: 35, color: Color.RED_500 }
    ],
    trend: '-5%'
  }
]

const mockDataCI = [
  {
    label: 'Database project',
    barSectionsData: [{ count: 510, color: Color.PRIMARY_6 }],
    trend: '5%'
  },
  {
    label: 'Payment Platform',
    barSectionsData: [
      { count: 249, color: Color.PRIMARY_6 },
      { count: 40, color: Color.RED_500 }
    ],
    trend: '5%'
  },
  {
    label: 'Ecommerce',
    barSectionsData: [
      { count: 249, color: Color.PRIMARY_6 },
      { count: 40, color: Color.RED_500 }
    ],
    trend: '-5%'
  }
]

const mockDataCF = [
  {
    label: 'Database project',
    barSectionsData: [{ count: 78, color: Color.ORANGE_500 }]
  },
  {
    label: 'Payment Platform',
    barSectionsData: [{ count: 65, color: Color.ORANGE_500 }]
  },
  {
    label: 'Ecommerce',
    barSectionsData: [{ count: 53, color: Color.ORANGE_500 }]
  },
  {
    label: 'My Project W',
    barSectionsData: [{ count: 23, color: Color.ORANGE_500 }]
  }
]

const renderNoData = (module: ModuleName): JSX.Element => {
  return <div>{{ module }}</div>
}

const getModuleSummaryHeader = (moduleType: ModuleName): Array<JSX.Element | string> => {
  switch (moduleType) {
    case ModuleName.CD:
      return ['PROJECTS', 'DEPLOYMENTS']
    case ModuleName.CI:
      return ['PROJECTS', 'BUILDS']
    case ModuleName.CF:
      return ['PROJECTS', 'FEATURE FLAGS']
    default:
      return []
  }
}

const renderModuleSummary = (moduleType: ModuleName, data: Array<StackedSummaryInterface>): JSX.Element => {
  return data?.length ? (
    <StackedSummaryTable columnHeaders={getModuleSummaryHeader(moduleType)} summaryData={data}></StackedSummaryTable>
  ) : (
    renderNoData(moduleType)
  )
}

const LandingDashboardSummaryWidget: React.FC = () => {
  // const { selectedTimeRange } = useLandingDashboardContext()
  const { getString } = useStrings()

  return (
    <div style={{ position: 'relative' }}>
      <TimeRangeSelect className={css.timeRangeSelect} />
      <Layout.Horizontal spacing="large">
        <Layout.Horizontal spacing="large">
          <Layout.Vertical spacing="large">
            <GlanceCard
              title="Projects"
              iconName="nav-project"
              iconSize={16}
              number={48}
              delta="+1%"
              styling
              intent="success"
              href={'/'}
            />
            <GlanceCard title="Environments" iconName="infrastructure" number={63} delta="-6%" intent="danger" />
          </Layout.Vertical>
          <Layout.Vertical spacing="large">
            <GlanceCard title="Services" iconName="services" number={6} delta="6" intent="success" href={'/'} />
            <GlanceCard title="Pipelines" iconName="pipeline" iconSize={38} number={460} delta="-6" intent="danger" />
          </Layout.Vertical>
        </Layout.Horizontal>
        <Card style={{ width: '100%' }}>
          <Layout.Vertical>
            <Text font={{ variation: FontVariation.CARD_TITLE }}>
              {getString('projectsOrgs.landingDashboard.title')}
            </Text>
            <Layout.Horizontal>
              {renderModuleSummary(ModuleName.CD, mockDataCD)}
              {renderModuleSummary(ModuleName.CI, mockDataCI)}
              {renderModuleSummary(ModuleName.CF, mockDataCF)}
            </Layout.Horizontal>
          </Layout.Vertical>
        </Card>
      </Layout.Horizontal>
    </div>
  )
}

export default LandingDashboardSummaryWidget
