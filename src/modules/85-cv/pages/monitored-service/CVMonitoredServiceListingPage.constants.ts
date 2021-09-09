import { Color } from '@wings-software/uicore'

export const HistoricalTrendChartOption = {
  title: {
    text: ''
  },
  credits: {
    enabled: false
  },
  xAxis: {
    visible: false,
    startOnTick: false,
    endOnTick: false
  },
  yAxis: {
    visible: false,
    startOnTick: false,
    endOnTick: false
  },
  legend: {
    enabled: false
  },
  series: [],
  tooltip: {
    enabled: false
  },
  chart: { width: 175, height: 52 },
  plotOptions: {
    series: {
      marker: {
        enabled: false
      },
      enableMouseTracking: false
    }
  }
}

export const DefaultChangePercentage = {
  color: Color.BLACK_100,
  percentage: 0
}
