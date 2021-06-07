import React from 'react'
import moment from 'moment'
import { getColorValue } from '@common/components/HeatMap/ColorUtils'
import {
  RunningStatusIndicator,
  StoppedStatusIndicator
} from '@ce/common/InstanceStatusIndicator/InstanceStatusIndicator'
import type { AllResourcesOfAccountResponse } from 'services/lw'
import odIcon from './images/ondemandIcon.svg'
import spotIcon from './images/spotIcon.svg'

export function getRelativeTime(t: string, format: string): string {
  return moment(t, format).fromNow()
}

export function getInstancesLink(resources: AllResourcesOfAccountResponse): string {
  const instanceIDs = resources.response?.map(x => x.id)
  const region = resources.response?.length ? resources.response[0].region : ''
  return `https://console.aws.amazon.com/ec2/v2/home?region=${region}#Instances:search=${instanceIDs?.join(
    ','
  )};sort=instanceId`
}
const gatewayStateMap: { [key: string]: JSX.Element } = {
  down: <StoppedStatusIndicator />,
  active: <RunningStatusIndicator />
}

export function getStateTag(state: string): JSX.Element {
  return gatewayStateMap[state]
}
const PLOT_LINE_LOCATIONS = [11, 22, 33, 44, 55, 66, 77, 88].map(degree => ({
  color: 'white',
  value: degree,
  zIndex: 10
}))
export function getRiskGaugeChartOptions(riskScore: number, disable?: boolean) {
  const gaugeColor = riskScore === -1 || disable ? 'var(--grey-200)' : getColorValue(100 - riskScore, 0, 100)
  riskScore = Math.round(riskScore * 10) / 10
  return {
    chart: {
      height: 50,
      width: 50,
      backgroundColor: 'transparent',
      spacing: [0, 0, 0, 0],
      type: 'solidgauge'
    },
    credits: {
      enabled: false
    },
    title: undefined,
    pane: {
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: [
        {
          borderWidth: 0,
          innerRadius: '80%',
          outerRadius: '100%',
          shape: 'arc'
        }
      ]
    },
    tooltip: {
      enabled: false
    },
    xAxis: {
      tickAmount: 0
    },
    plotOptions: {
      gauge: {
        dataLabels: {
          y: 5,
          borderWidth: 0,
          useHTML: true,
          format: '{point.y} %'
        },
        dial: {
          radius: '45%',
          backgroundColor: gaugeColor,
          baseLength: '40%'
        },
        pivot: {
          backgroundColor: 'white',
          borderColor: gaugeColor,
          borderWidth: 1,
          radius: 3
        }
      }
    },
    yAxis: {
      lineWidth: 0,
      minorTickInterval: null,
      min: 0,
      max: 100,
      tickAmount: 0,
      tickColor: 'transparent',
      plotBands: [
        {
          thickness: 5,
          from: 0,
          to: riskScore,
          color: gaugeColor
        },
        {
          thickness: 5,
          from: riskScore,
          to: 100,
          color: '#EEE'
        }
      ],
      plotLines: PLOT_LINE_LOCATIONS,
      labels: {
        enabled: false
      }
    },
    series: [
      {
        name: 'Risk Score',
        type: 'gauge',
        data: [riskScore]
      }
    ]
  }
}

export function geGaugeChartOptionsWithoutLabel(riskScore: number) {
  const gaugeColor = riskScore === -1 ? 'var(--grey-200)' : getColorValue(100 - riskScore, 0, 100)
  riskScore = Math.round(riskScore * 10) / 10
  return {
    chart: {
      height: 80,
      width: 50,
      backgroundColor: 'transparent',
      spacing: [0, 0, 0, 0],
      type: 'solidgauge'
    },
    credits: {
      enabled: false
    },
    title: undefined,
    pane: {
      size: '100%',
      startAngle: -90,
      endAngle: 90,
      background: [
        {
          borderWidth: 0,
          innerRadius: '80%',
          outerRadius: '100%',
          shape: 'arc'
        }
      ]
    },
    tooltip: {
      enabled: false
    },
    xAxis: {
      tickAmount: 0
    },
    plotOptions: {
      gauge: {
        dataLabels: {
          enabled: false
        },
        dial: {
          radius: '45%',
          backgroundColor: gaugeColor,
          baseLength: '40%'
        },
        pivot: {
          backgroundColor: 'white',
          borderColor: gaugeColor,
          borderWidth: 1,
          radius: 3
        }
      }
    },
    yAxis: {
      lineWidth: 0,
      minorTickInterval: null,
      min: 0,
      max: 100,
      tickAmount: 0,
      tickColor: 'transparent',
      plotBands: [
        {
          thickness: 5,
          from: 0,
          to: riskScore,
          color: gaugeColor
        },
        {
          thickness: 5,
          from: riskScore,
          to: 100,
          color: '#EEE'
        }
      ],
      plotLines: PLOT_LINE_LOCATIONS,
      labels: {
        enabled: false
      }
    },
    series: [
      {
        name: 'Risk Score',
        type: 'gauge',
        data: [riskScore]
      }
    ]
  }
}

export function getDay(t: string, format: string): string {
  return moment(t, format).format('DD-MMM-YYYY')
}

export function getTimestamp(t: string, format: string): string {
  return moment(t, format).format('DD-MMM-YYYY HH:mm:ss')
}

export function getFulfilmentIcon(fulfilment: string): string {
  return fulfilment == 'spot' ? spotIcon : odIcon
}

export function cleanupForHostName(name: string): string {
  const toReplace = [' ', '.', ',']
  toReplace.forEach(l => {
    name = name.split(l).join('-')
  })
  return name
}

export function roundToPrecision(n: number): number {
  return Math.round(n * 100) / 100
}
