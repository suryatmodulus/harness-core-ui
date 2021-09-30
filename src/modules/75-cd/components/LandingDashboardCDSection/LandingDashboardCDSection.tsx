import React from 'react'
import { Card, Color, Container, FontVariation, Layout, Text } from '@wings-software/uicore'
import { OverviewChartsWithToggle } from '@common/components/OverviewChartsWithToggle/OverviewChartsWithToggle'
import { StackedSummaryTable } from '@common/components/StackedSummaryTable/StackedSummaryTable'

//Testing with mockdata before API
const generateMockData = (rows: number) => {
  const successData = []
  const failureData = []
  for (let i = 0; i < rows; i++) {
    successData.push(20 + Math.round(Math.random() * 50))
    failureData.push(5 + Math.round(Math.random() * successData[i]) / 5)
  }

  return [
    {
      name: 'Failed',
      data: failureData,
      color: '#EE5F54'
    },
    {
      name: 'Success',
      data: successData,
      color: '#5FB34E'
    }
  ]
}

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

const dummySummaryData = [
  { title: 'Deployments', count: 211, trend: '17%' },
  { title: 'Failure Rate', count: 15, trend: '5%' },
  { title: 'Deployment Frequency', count: '2/week', trend: '5%' }
]

const dummyRenderer = (data: any): JSX.Element => {
  return (
    <>
      <Text font={{ variation: FontVariation.BODY2 }}>{data.title}</Text>
      <Container flex>
        <Text font={{ variation: FontVariation.H4 }}>{data.count}</Text>
        <Text color={Color.GREEN_600}>{data.trend}</Text>
      </Container>
    </>
  )
}

const renderSummaryCards = (): JSX.Element => {
  return (
    <>
      {dummySummaryData?.map((summaryData, index) => (
        <Container key={`summry-${index}`} height={76} background={Color.GREY_50} padding="medium">
          {dummyRenderer(summaryData)}
        </Container>
      ))}
    </>
  )
}

const LandingDashboardCDSection: React.FC = () => {
  return (
    <Layout.Horizontal spacing="large">
      <Card style={{ width: '60%' }}>
        <OverviewChartsWithToggle
          data={generateMockData(30)}
          summaryCards={renderSummaryCards()}
        ></OverviewChartsWithToggle>
      </Card>
      <Card style={{ width: '37%' }}>
        <StackedSummaryTable columnHeaders={['SERVICES', 'DEPLOYMENTS']} summaryData={mockDataCD}></StackedSummaryTable>
      </Card>
    </Layout.Horizontal>
  )
}

export default LandingDashboardCDSection
