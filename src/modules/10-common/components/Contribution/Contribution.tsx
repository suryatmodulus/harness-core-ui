import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Avatar, Card, Color, Container, Icon, Layout, Text } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'

import css from './Contribution.module.scss'

interface ContributionProps {
  view: 'USER' | 'PROJECT'
  rank: number
  name: string
  count: number
  selected: boolean
  data?: { x?: number; y?: number }[]
  onClick: any
}

const Contribution: React.FC<ContributionProps> = ({
  rank,
  view,
  name,
  count,
  data = [],
  selected = false,
  onClick
}) => {
  const { getString } = useStrings()
  return (
    <Card className={css.main} selected={selected} onClick={onClick}>
      <Layout.Vertical>
        <Layout.Horizontal
          flex={{ justifyContent: 'space-between' }}
          className={css.separator}
          padding={{ top: 'medium', bottom: 'medium', left: 'small', right: 'small' }}
        >
          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
            {view === 'PROJECT' ? <Avatar name={name} size="normal" /> : <Icon name="projects" padding="xsmall" />}
            <Layout.Vertical padding={{ left: 'xsmall' }}>
              <Text>{name}</Text>
              <Text>
                {count}&nbsp;
                {getString('common.activities')}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
          <Text font={{ size: 'large' }} color={Color.GREY_500} margin={{ right: 'medium' }}>{`#${rank + 1}`}</Text>
        </Layout.Horizontal>
        <Container padding={{ top: 'xlarge' }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: {
                type: 'area',
                width: 500,
                height: 200
              },
              credits: {
                enabled: false
              },
              title: false,
              xAxis: {
                labels: {
                  formatter: function () {
                    return new Date(this.value).toLocaleString('default', { month: 'long', day: 'numeric' })
                  }
                }
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
                  name: 'Date',
                  data
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
