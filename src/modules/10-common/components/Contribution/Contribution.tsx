import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Avatar, Card, Container, Icon, Layout, Text } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'

import css from './Contribution.module.scss'

interface ContributionProps {
  view: 'USER' | 'PROJECT'
  name: string
  count: number
}

const Contribution: React.FC<ContributionProps> = ({ view, name, count }) => {
  const { getString } = useStrings()
  return (
    <Card className={css.main}>
      <Layout.Vertical>
        <Layout.Horizontal
          className={css.separator}
          padding={{ top: 'medium', bottom: 'medium', left: 'small', right: 'small' }}
          flex={{ justifyContent: 'flex-start' }}
        >
          {view === 'PROJECT' ? <Avatar name={name} size="normal" /> : <Icon name="projects" padding="xsmall" />}
          <Layout.Vertical padding={{ left: 'xsmall' }}>
            <Text>{name}</Text>
            <Text>
              {count}&nbsp;
              {getString('common.activities')}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
        <Container padding={{ top: 'xlarge' }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: {
                type: 'line'
              },
              title: false,
              xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
              },
              yAxis: {
                title: {
                  text: 'Count'
                }
              },
              plotOptions: {
                line: {
                  dataLabels: {
                    enabled: true
                  },
                  enableMouseTracking: false
                }
              },
              series: [
                {
                  name: 'Month',
                  data: [20, 15, 30, 40, 25, 35, 25, 10, 12, 28, 39, 45]
                }
              ]
            }}
          />
        </Container>
      </Layout.Vertical>
    </Card>
  )
}

export default Contribution
